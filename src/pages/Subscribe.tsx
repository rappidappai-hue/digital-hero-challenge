import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { Check, Heart, Zap, Crown } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";
import { motion } from "framer-motion";

type Charity = Tables<"charities">;

const Subscribe = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [plan, setPlan] = useState<"monthly" | "yearly">("monthly");
  const [charityPct, setCharityPct] = useState(10);
  const [charities, setCharities] = useState<Charity[]>([]);
  const [selectedCharity, setSelectedCharity] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const prices = { monthly: 9.99, yearly: 99.99 };

  useEffect(() => {
    supabase.from("charities").select("*").eq("is_active", true).then(({ data }) => {
      if (data) setCharities(data);
    });
  }, []);

  const handleSubscribe = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }
    setLoading(true);

    const now = new Date();
    const renewalDate = new Date(now);
    if (plan === "monthly") renewalDate.setMonth(renewalDate.getMonth() + 1);
    else renewalDate.setFullYear(renewalDate.getFullYear() + 1);

    const { error } = await supabase.from("subscriptions").upsert({
      user_id: user.id,
      plan,
      status: "active",
      amount: prices[plan],
      charity_percentage: charityPct,
      start_date: now.toISOString(),
      renewal_date: renewalDate.toISOString(),
    }, { onConflict: "user_id" });

    if (!error && selectedCharity) {
      await supabase.from("user_charities").upsert({
        user_id: user.id,
        charity_id: selectedCharity,
        is_active: true,
      }, { onConflict: "user_id,charity_id" });
    }

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Subscribed!", description: "Welcome to GolfGive!" });
      navigate("/user/dashboard");
    }
    setLoading(false);
  };

  const charityAmount = (prices[plan] * charityPct) / 100;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-12 container mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1 className="text-4xl font-display font-bold mb-4">Choose Your Plan</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">Subscribe to enter monthly draws, track scores, and support charities.</p>
        </motion.div>

        {/* Plan Toggle */}
        <div className="flex justify-center mb-8">
          <div className="bg-secondary rounded-full p-1 flex">
            <button className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${plan === "monthly" ? "gradient-hero text-primary-foreground" : "text-muted-foreground"}`} onClick={() => setPlan("monthly")}>Monthly</button>
            <button className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${plan === "yearly" ? "gradient-hero text-primary-foreground" : "text-muted-foreground"}`} onClick={() => setPlan("yearly")}>
              Yearly <span className="text-xs opacity-75">Save 17%</span>
            </button>
          </div>
        </div>

        <div className="max-w-3xl mx-auto grid md:grid-cols-2 gap-6">
          {/* Plan Card */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <Card className="shadow-elevated border-primary/20 border-2">
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  {plan === "yearly" ? <Crown className="w-5 h-5 text-gold" /> : <Zap className="w-5 h-5 text-primary" />}
                  <CardTitle className="font-display">{plan === "monthly" ? "Monthly" : "Yearly"} Plan</CardTitle>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-display font-bold">£{prices[plan]}</span>
                  <span className="text-muted-foreground">/{plan === "monthly" ? "mo" : "yr"}</span>
                </div>
                <CardDescription>Everything you need to play, win, and give.</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {["Monthly prize draw entry", "Score tracking (5 rolling)", "Support your chosen charity", "Winner verification system", "Dashboard & analytics"].map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-primary flex-shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>

          {/* Charity & Checkout */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="font-display flex items-center gap-2">
                  <Heart className="w-5 h-5 text-charity-pink" /> Charity Contribution
                </CardTitle>
                <CardDescription>Choose how much goes to charity (min 10%)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Charity: {charityPct}%</span>
                    <span className="font-display font-bold text-charity-pink">£{charityAmount.toFixed(2)}/subscription</span>
                  </div>
                  <Slider value={[charityPct]} onValueChange={([v]) => setCharityPct(v)} min={10} max={50} step={5} className="w-full" />
                </div>

                {charities.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Select a charity:</p>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {charities.map((c) => (
                        <button key={c.id} onClick={() => setSelectedCharity(c.id)} className={`w-full text-left p-3 rounded-lg text-sm transition-all ${selectedCharity === c.id ? "bg-primary/10 border border-primary/30" : "bg-secondary hover:bg-secondary/80"}`}>
                          {c.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <Button className="w-full gradient-hero text-primary-foreground border-0 h-12 text-base" onClick={handleSubscribe} disabled={loading}>
                  {loading ? "Processing..." : `Subscribe — £${prices[plan]}/${plan === "monthly" ? "mo" : "yr"}`}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Subscribe;
