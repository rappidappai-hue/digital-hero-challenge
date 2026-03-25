import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Trophy, Target, Heart, Calendar, Plus, Trash2 } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";
import { motion } from "framer-motion";

type GolfScore = Tables<"golf_scores">;
type Subscription = Tables<"subscriptions">;
type Winner = Tables<"winners">;

const Dashboard = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [scores, setScores] = useState<GolfScore[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [winners, setWinners] = useState<Winner[]>([]);
  const [newScore, setNewScore] = useState("");
  const [newDate, setNewDate] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) navigate("/auth");
  }, [user, isLoading, navigate]);

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user) return;
    const [scoresRes, subRes, winnersRes] = await Promise.all([
      supabase.from("golf_scores").select("*").eq("user_id", user.id).order("played_date", { ascending: false }),
      supabase.from("subscriptions").select("*").eq("user_id", user.id).single(),
      supabase.from("winners").select("*").eq("user_id", user.id),
    ]);
    if (scoresRes.data) setScores(scoresRes.data);
    if (subRes.data) setSubscription(subRes.data);
    if (winnersRes.data) setWinners(winnersRes.data);
    setLoading(false);
  };

  const addScore = async () => {
    try {
      if (!user) return;
      if (!newScore) {
        toast({ title: "Missing score", description: "Please enter a valid golf score first.", variant: "destructive" });
        return;
      }
      
      const scoreNum = parseInt(newScore);
      if (isNaN(scoreNum) || scoreNum < 1 || scoreNum > 45) {
        toast({ title: "Invalid score", description: "Score must be between 1 and 45 (Stableford)", variant: "destructive" });
        return;
      }

      setLoading(true);

      // If already 5 scores, delete the oldest
      if (scores.length >= 5) {
        const oldest = scores[scores.length - 1];
        await supabase.from("golf_scores").delete().eq("id", oldest.id);
      }

      const { error } = await supabase.from("golf_scores").insert({
        user_id: user.id,
        score: scoreNum,
        played_date: newDate || new Date().toISOString().split("T")[0],
      });

      if (error) throw error;

      toast({ title: "Score added successfully!" });
      setNewScore("");
      await fetchData();
    } catch (e: any) {
      toast({ title: "Action Failed", description: e.message || "An unexpected error occurred.", variant: "destructive" });
      setLoading(false);
    }
  };

  const deleteScore = async (id: string) => {
    await supabase.from("golf_scores").delete().eq("id", id);
    fetchData();
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const totalWinnings = winners.reduce((sum, w) => sum + w.prize_amount, 0);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-12 container mx-auto px-4">
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-3xl font-display font-bold mb-8">
          Your Dashboard
        </motion.h1>

        <div className="grid md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Target, label: "Subscription", value: subscription?.status === "active" ? "Active" : "Inactive", color: subscription?.status === "active" ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive" },
            { icon: Trophy, label: "Total Winnings", value: `£${totalWinnings.toFixed(2)}`, color: "bg-gold/10 text-gold" },
            { icon: Heart, label: "Charity %", value: `${subscription?.charity_percentage ?? 10}%`, color: "bg-charity-pink/10 text-charity-pink" },
            { icon: Calendar, label: "Scores Entered", value: `${scores.length}/5`, color: "bg-primary/10 text-primary" },
          ].map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card className="shadow-card">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color}`}>
                      <stat.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="text-lg font-display font-bold">{stat.value}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Score Entry */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="font-display flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" /> Golf Scores
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-4">
                <div className="flex-1 space-y-1">
                  <Label className="text-xs">Score (1-45)</Label>
                  <Input type="number" min={1} max={45} value={newScore} onChange={(e) => setNewScore(e.target.value)} placeholder="Score" />
                </div>
                <div className="flex-1 space-y-1">
                  <Label className="text-xs">Date</Label>
                  <Input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} />
                </div>
                <div className="flex items-end">
                  <Button onClick={addScore} size="icon" className="gradient-hero text-primary-foreground border-0">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                {scores.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No scores yet. Enter your latest golf scores!</p>
                ) : (
                  scores.map((s) => (
                    <div key={s.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary">
                      <div>
                        <span className="font-display font-bold text-lg">{s.score}</span>
                        <span className="text-sm text-muted-foreground ml-2">pts</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">{new Date(s.played_date).toLocaleDateString()}</span>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => deleteScore(s.id)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-2">Only your latest 5 scores are kept. New scores replace the oldest.</p>
            </CardContent>
          </Card>

          {/* Winnings */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="font-display flex items-center gap-2">
                <Trophy className="w-5 h-5 text-gold" /> Winnings & Draws
              </CardTitle>
            </CardHeader>
            <CardContent>
              {winners.length === 0 ? (
                <div className="text-center py-8">
                  <Trophy className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No winnings yet. Keep entering scores!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {winners.map((w) => (
                    <div key={w.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary">
                      <div>
                        <Badge variant={w.match_count === 5 ? "default" : "secondary"} className={w.match_count === 5 ? "gradient-warm text-primary-foreground border-0" : ""}>
                          {w.match_count}-Match
                        </Badge>
                      </div>
                      <div className="text-right">
                        <p className="font-display font-bold">£{w.prize_amount.toFixed(2)}</p>
                        <Badge variant="outline" className="text-xs">{w.payout_status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {subscription?.status !== "active" && (
                <div className="mt-4 p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <p className="text-sm font-medium">Subscribe to enter monthly draws!</p>
                  <Button size="sm" className="mt-2 gradient-hero text-primary-foreground border-0" onClick={() => navigate("/subscribe")}>
                    Subscribe Now
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
