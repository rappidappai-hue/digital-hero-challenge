import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Users, Trophy, Heart, BarChart3, Dices, CheckCircle, XCircle, Plus, Trash2, Edit } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { executeDraw } from "@/lib/drawEngine";

type Profile = Tables<"profiles">;
type Draw = Tables<"draws">;
type Winner = Tables<"winners">;
type Charity = Tables<"charities">;
type Subscription = Tables<"subscriptions">;

const AdminDashboard = () => {
  const { user, isAdmin, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [draws, setDraws] = useState<Draw[]>([]);
  const [winners, setWinners] = useState<(Winner & { profiles?: Profile })[]>([]);
  const [charities, setCharities] = useState<Charity[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [stats, setStats] = useState({ users: 0, pool: 0, charityTotal: 0 });
  const [loading, setLoading] = useState(true);

  // Draw form
  const [drawDate, setDrawDate] = useState(new Date().toISOString().split("T")[0]);
  const [drawLogic, setDrawLogic] = useState<"random" | "algorithmic">("random");

  // Charity form
  const [charityName, setCharityName] = useState("");
  const [charityDesc, setCharityDesc] = useState("");
  const [charityUrl, setCharityUrl] = useState("");
  const [charityImageUrl, setCharityImageUrl] = useState("");
  const [editingCharity, setEditingCharity] = useState<Charity | null>(null);

  useEffect(() => {
    if (!isLoading && (!user || !isAdmin)) navigate("/");
  }, [user, isAdmin, isLoading, navigate]);

  useEffect(() => {
    if (user && isAdmin) fetchAll();
  }, [user, isAdmin]);

  const fetchAll = async () => {
    const [profilesRes, drawsRes, winnersRes, charitiesRes, subsRes] = await Promise.all([
      supabase.from("profiles").select("*"),
      supabase.from("draws").select("*").order("draw_date", { ascending: false }),
      supabase.from("winners").select("*"),
      supabase.from("charities").select("*").order("created_at", { ascending: false }),
      supabase.from("subscriptions").select("*"),
    ]);
    if (profilesRes.data) setProfiles(profilesRes.data);
    if (drawsRes.data) setDraws(drawsRes.data);
    if (winnersRes.data) setWinners(winnersRes.data);
    if (charitiesRes.data) setCharities(charitiesRes.data);
    if (subsRes.data) {
      setSubscriptions(subsRes.data);
      const activeSubs = subsRes.data.filter(s => s.status === "active");
      const pool = activeSubs.reduce((sum, s) => sum + s.amount * (1 - s.charity_percentage / 100), 0);
      const charityTotal = activeSubs.reduce((sum, s) => sum + s.amount * s.charity_percentage / 100, 0);
      setStats({ users: profilesRes.data?.length ?? 0, pool, charityTotal });
    }
    setLoading(false);
  };

  const generateWinningNumbers = (): number[] => {
    const nums: number[] = [];
    while (nums.length < 5) {
      const n = Math.floor(Math.random() * 45) + 1;
      if (!nums.includes(n)) nums.push(n);
    }
    return nums.sort((a, b) => a - b);
  };

  const createDraw = async () => {
    const nums = generateWinningNumbers();
    const activeSubs = subscriptions.filter(s => s.status === "active");
    const poolTotal = activeSubs.reduce((sum, s) => sum + s.amount * (1 - s.charity_percentage / 100), 0);

    const { data: insertedDraw, error } = await supabase.from("draws").insert({
      draw_date: drawDate,
      logic_type: drawLogic,
      winning_numbers: nums,
      prize_pool_total: poolTotal,
      status: "simulated",
    }).select().single();

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else if (insertedDraw) {
      // Execute the draw logic correctly here
      await executeDraw(insertedDraw.id, nums, poolTotal);
      toast({ title: "Draw created and simulated!" }); 
      fetchAll(); 
    }
  };

  const publishDraw = async (drawId: string) => {
    await supabase.from("draws").update({ status: "published" }).eq("id", drawId);
    toast({ title: "Draw published!" });
    fetchAll();
  };

  const saveCharity = async () => {
    if (!charityName) return;
    if (editingCharity) {
      await supabase.from("charities").update({
        name: charityName, description: charityDesc, website_url: charityUrl || null, image_url: charityImageUrl || null,
      }).eq("id", editingCharity.id);
      setEditingCharity(null);
    } else {
      await supabase.from("charities").insert({
        name: charityName, description: charityDesc, website_url: charityUrl || null, image_url: charityImageUrl || null,
      });
    }
    setCharityName(""); setCharityDesc(""); setCharityUrl(""); setCharityImageUrl("");
    toast({ title: "Charity saved!" });
    fetchAll();
  };

  const deleteCharity = async (id: string) => {
    await supabase.from("charities").delete().eq("id", id);
    toast({ title: "Charity deleted" });
    fetchAll();
  };

  const updateWinnerStatus = async (winnerId: string, status: "verified" | "paid" | "rejected") => {
    await supabase.from("winners").update({ payout_status: status }).eq("id", winnerId);
    toast({ title: `Winner ${status}` });
    fetchAll();
  };

  if (isLoading || loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-12 container mx-auto px-4">
        <h1 className="text-3xl font-display font-bold mb-8">Admin Dashboard</h1>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Users, label: "Total Users", value: stats.users },
            { icon: Trophy, label: "Prize Pool", value: `£${stats.pool.toFixed(2)}` },
            { icon: Heart, label: "Charity Total", value: `£${stats.charityTotal.toFixed(2)}` },
            { icon: BarChart3, label: "Active Subs", value: subscriptions.filter(s => s.status === "active").length },
          ].map((s, i) => (
            <Card key={i} className="shadow-card">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <s.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{s.label}</p>
                    <p className="text-lg font-display font-bold">{s.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="draws">
          <TabsList className="mb-6">
            <TabsTrigger value="draws"><Dices className="w-4 h-4 mr-1" />Draws</TabsTrigger>
            <TabsTrigger value="charities"><Heart className="w-4 h-4 mr-1" />Charities</TabsTrigger>
            <TabsTrigger value="winners"><Trophy className="w-4 h-4 mr-1" />Winners</TabsTrigger>
            <TabsTrigger value="users"><Users className="w-4 h-4 mr-1" />Users</TabsTrigger>
          </TabsList>

          {/* DRAWS TAB */}
          <TabsContent value="draws">
            <Card className="shadow-card mb-6">
              <CardHeader><CardTitle className="font-display">Create New Draw</CardTitle></CardHeader>
              <CardContent>
                <div className="flex gap-4 items-end flex-wrap">
                  <div className="space-y-1">
                    <Label>Draw Date</Label>
                    <Input type="date" value={drawDate} onChange={(e) => setDrawDate(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <Label>Logic</Label>
                    <Select value={drawLogic} onValueChange={(v) => setDrawLogic(v as "random" | "algorithmic")}>
                      <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="random">Random</SelectItem>
                        <SelectItem value="algorithmic">Algorithmic</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={createDraw} className="gradient-hero text-primary-foreground border-0">
                    <Dices className="w-4 h-4 mr-1" /> Generate Draw
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-3">
              {draws.map((d) => (
                <Card key={d.id} className="shadow-card">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div>
                        <p className="font-display font-bold">{new Date(d.draw_date).toLocaleDateString()}</p>
                        <div className="flex gap-2 mt-1">
                          {d.winning_numbers.map((n, i) => (
                            <span key={i} className="w-8 h-8 rounded-full gradient-hero text-primary-foreground flex items-center justify-center text-sm font-bold">{n}</span>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={d.status === "published" ? "default" : "secondary"}>{d.status}</Badge>
                        <p className="text-sm text-muted-foreground">Pool: £{(d.prize_pool_total ?? 0).toFixed(2)}</p>
                        {d.status === "simulated" && (
                          <Button size="sm" onClick={() => publishDraw(d.id)} className="gradient-hero text-primary-foreground border-0">Publish</Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* CHARITIES TAB */}
          <TabsContent value="charities">
            <Card className="shadow-card mb-6">
              <CardHeader><CardTitle className="font-display">{editingCharity ? "Edit" : "Add"} Charity</CardTitle></CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-1"><Label>Name</Label><Input value={charityName} onChange={(e) => setCharityName(e.target.value)} /></div>
                  <div className="space-y-1"><Label>Website</Label><Input value={charityUrl} onChange={(e) => setCharityUrl(e.target.value)} /></div>
                  <div className="space-y-1"><Label>Image URL</Label><Input value={charityImageUrl} onChange={(e) => setCharityImageUrl(e.target.value)} /></div>
                  <div className="space-y-1"><Label>Description</Label><Textarea value={charityDesc} onChange={(e) => setCharityDesc(e.target.value)} /></div>
                </div>
                <Button onClick={saveCharity} className="mt-4 gradient-hero text-primary-foreground border-0">
                  <Plus className="w-4 h-4 mr-1" /> {editingCharity ? "Update" : "Add"} Charity
                </Button>
                {editingCharity && <Button variant="ghost" className="mt-4 ml-2" onClick={() => { setEditingCharity(null); setCharityName(""); setCharityDesc(""); setCharityUrl(""); setCharityImageUrl(""); }}>Cancel</Button>}
              </CardContent>
            </Card>

            <div className="space-y-3">
              {charities.map((c) => (
                <Card key={c.id} className="shadow-card">
                  <CardContent className="pt-6 flex items-center justify-between">
                    <div>
                      <p className="font-display font-bold">{c.name}</p>
                      <p className="text-sm text-muted-foreground line-clamp-1">{c.description}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="icon" variant="ghost" onClick={() => { setEditingCharity(c); setCharityName(c.name); setCharityDesc(c.description ?? ""); setCharityUrl(c.website_url ?? ""); setCharityImageUrl(c.image_url ?? ""); }}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => deleteCharity(c.id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* WINNERS TAB */}
          <TabsContent value="winners">
            {winners.length === 0 ? (
              <div className="text-center py-12"><Trophy className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" /><p className="text-muted-foreground">No winners yet.</p></div>
            ) : (
              <div className="space-y-3">
                {winners.map((w) => (
                  <Card key={w.id} className="shadow-card">
                    <CardContent className="pt-6 flex items-center justify-between flex-wrap gap-4">
                      <div>
                        <p className="font-display font-bold">{w.match_count}-Match Winner</p>
                        <p className="text-sm text-muted-foreground">Prize: £{w.prize_amount.toFixed(2)}</p>
                        {w.proof_url && <a href={w.proof_url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">View Proof</a>}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{w.payout_status}</Badge>
                        {w.payout_status === "pending" && (
                          <>
                            <Button size="sm" variant="outline" onClick={() => updateWinnerStatus(w.id, "verified")}><CheckCircle className="w-4 h-4 mr-1 text-primary" />Verify</Button>
                            <Button size="sm" variant="outline" onClick={() => updateWinnerStatus(w.id, "rejected")}><XCircle className="w-4 h-4 mr-1 text-destructive" />Reject</Button>
                          </>
                        )}
                        {w.payout_status === "verified" && (
                          <Button size="sm" className="gradient-hero text-primary-foreground border-0" onClick={() => updateWinnerStatus(w.id, "paid")}>Mark Paid</Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* USERS TAB */}
          <TabsContent value="users">
            <div className="space-y-3">
              {profiles.map((p) => {
                const sub = subscriptions.find(s => s.user_id === p.user_id);
                return (
                  <Card key={p.id} className="shadow-card">
                    <CardContent className="pt-6 flex items-center justify-between flex-wrap gap-4">
                      <div>
                        <p className="font-display font-bold">{p.full_name || "Unnamed User"}</p>
                        <p className="text-sm text-muted-foreground">{p.email}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={sub?.status === "active" ? "default" : "secondary"}>
                          {sub?.status ?? "No subscription"}
                        </Badge>
                        {sub && <span className="text-sm text-muted-foreground">{sub.plan}</span>}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;
