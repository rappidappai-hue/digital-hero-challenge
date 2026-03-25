import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Trophy, Target, ArrowRight, Sparkles, Users, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.15, duration: 0.6 } }),
};

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0 gradient-dark opacity-95">
          {/* Subtle overlay effect */}
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
        </div>
        <div className="relative container mx-auto px-4 py-32">
          <motion.div initial="hidden" animate="visible" className="max-w-2xl">
            <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 text-primary-foreground text-sm font-medium mb-6 backdrop-blur-sm">
              <Sparkles className="w-4 h-4" /> Play. Win. Give Back.
            </motion.div>
            <motion.h1 variants={fadeUp} custom={1} className="text-5xl md:text-7xl font-display font-bold text-primary-foreground leading-tight mb-6">
              Every Swing<br />
              <span className="bg-clip-text text-transparent" style={{ backgroundImage: "var(--gradient-hero)" }}>Changes a Life</span>
            </motion.h1>
            <motion.p variants={fadeUp} custom={2} className="text-lg text-primary-foreground/80 mb-8 max-w-lg">
              Subscribe, enter your golf scores, win monthly prizes — and a portion of every subscription goes directly to the charity you choose.
            </motion.p>
            <motion.div variants={fadeUp} custom={3} className="flex flex-wrap gap-4">
              <Link to="/subscribe">
                <Button size="lg" className="gradient-hero text-primary-foreground border-0 h-14 px-8 text-base font-semibold shadow-lg hover:shadow-xl transition-all relative overflow-hidden group">
                  <motion.span 
                    animate={{ x: ["-100%", "200%"] }} 
                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                    className="absolute inset-0 w-1/2 h-full bg-white/20 -skew-x-12 translate-x-[-100%]"
                  />
                  <span className="relative z-10 flex items-center">
                    Start Giving <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Button>
              </Link>
              <Link to="/charities">
                <Button size="lg" variant="outline" className="h-14 px-8 text-base bg-transparent border-white/30 text-white hover:bg-white/10 hover:text-white transition-colors">
                  Explore Charities
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">How GolfGive Works</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Three simple steps to making an impact while enjoying the game you love.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { icon: Target, title: "Enter Your Scores", desc: "Log your latest 5 Stableford scores. Your scores become your draw numbers — simple as that.", color: "bg-primary/10 text-primary", step: "01" },
              { icon: Trophy, title: "Win Prizes", desc: "Match 3, 4, or 5 numbers in our monthly draw to win from the prize pool. Jackpot rolls over!", color: "bg-gold/10 text-gold", step: "02" },
              { icon: Heart, title: "Support Charities", desc: "At least 10% of your subscription goes directly to your chosen charity. Increase it anytime.", color: "bg-charity-pink/10 text-charity-pink", step: "03" },
            ].map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}>
                <Card className="shadow-card hover:shadow-elevated transition-all h-full border-0 bg-card">
                  <CardContent className="pt-8 pb-8 text-center">
                    <span className="text-6xl font-display font-bold text-muted-foreground/10">{item.step}</span>
                    <div className={`w-14 h-14 rounded-2xl ${item.color} flex items-center justify-center mx-auto mb-4 -mt-4`}>
                      <item.icon className="w-7 h-7" />
                    </div>
                    <h3 className="font-display font-bold text-xl mb-3">{item.title}</h3>
                    <p className="text-muted-foreground text-sm">{item.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Prize Pool */}
      <section className="py-24 gradient-dark text-primary-foreground">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">Prize Pool Distribution</h2>
            <p className="text-primary-foreground/70 max-w-xl mx-auto">Every month, the pool is split across three tiers. Match more, win more.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {[
              { match: "5-Number Match", share: "40%", label: "Jackpot", rollover: true, accent: "gradient-warm" },
              { match: "4-Number Match", share: "35%", label: "Major Prize", rollover: false, accent: "gradient-hero" },
              { match: "3-Number Match", share: "25%", label: "Prize", rollover: false, accent: "bg-primary/20" },
            ].map((tier, i) => (
              <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <div className={`rounded-2xl p-6 text-center ${i === 0 ? "border-2 border-gold/50" : "border border-primary-foreground/10"} bg-primary-foreground/5 backdrop-blur`}>
                  <p className="text-sm text-primary-foreground/60 mb-2">{tier.label}</p>
                  <p className="text-4xl font-display font-bold mb-1">{tier.share}</p>
                  <p className="text-sm text-primary-foreground/80 mb-3">{tier.match}</p>
                  {tier.rollover && (
                    <span className="inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full bg-gold/20 text-gold">
                      <TrendingUp className="w-3 h-3" /> Rolls over if unclaimed
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-12">Making a Difference</h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            {[
              { icon: Users, value: "1,200+", label: "Active Members" },
              { icon: Heart, value: "£45,000+", label: "Raised for Charity" },
              { icon: Trophy, value: "£32,000+", label: "Prizes Awarded" },
            ].map((stat, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="w-7 h-7 text-primary" />
                </div>
                <p className="text-3xl font-display font-bold">{stat.value}</p>
                <p className="text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="gradient-hero rounded-3xl p-12 md:p-20 text-center text-primary-foreground">
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">Ready to Make Every Swing Count?</h2>
            <p className="text-primary-foreground/80 mb-8 max-w-lg mx-auto">Join GolfGive today. Subscribe from just £9.99/month.</p>
            <Link to="/subscribe">
              <motion.div
                animate={{ scale: [1, 1.03, 1] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              >
                <Button size="lg" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 h-14 px-10 text-base font-semibold shadow-xl group">
                  Subscribe Now <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </motion.div>
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
