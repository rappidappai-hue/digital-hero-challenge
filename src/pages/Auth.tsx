import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Heart } from "lucide-react";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleDemoSignIn = async () => {
    setLoading(true);
    const demoEmail = "recruiter@digitalheroes.co.in";
    const demoPass = "evaluator123";
    
    // Attempt login first
    const { error } = await supabase.auth.signInWithPassword({ email: demoEmail, password: demoPass });
    if (error && error.message.includes("Invalid login credentials")) {
      // Auto-create for the recruiter if it doesn't exist
      await supabase.auth.signUp({ email: demoEmail, password: demoPass, options: { data: { full_name: "Senior Recruiter" } } });
      await supabase.auth.signInWithPassword({ email: demoEmail, password: demoPass });
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        navigate("/dashboard");
      }
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      });
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Success!", description: "Check your email to confirm your account." });
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md shadow-elevated">
        <CardHeader className="text-center">
          <div className="w-12 h-12 rounded-xl gradient-hero flex items-center justify-center mx-auto mb-4">
            <Heart className="w-6 h-6 text-primary-foreground" />
          </div>
          <CardTitle className="font-display text-2xl">{isLogin ? "Welcome Back" : "Join GolfGive"}</CardTitle>
          <CardDescription>{isLogin ? "Sign in to your account" : "Create your account to get started"}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="John Doe" required />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} />
            </div>
            <Button type="submit" className="w-full gradient-hero text-primary-foreground border-0" disabled={loading}>
              {loading ? "Loading..." : isLogin ? "Sign In" : "Create Account"}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <button type="button" className="text-sm text-muted-foreground hover:text-foreground transition-colors" onClick={() => setIsLogin(!isLogin)}>
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>
          <div className="mt-6 border-t pt-4">
            <Button type="button" variant="outline" className="w-full relative shadow-sm border-primary/20 text-primary hover:bg-primary/10" onClick={handleDemoSignIn} disabled={loading}>
              <div className="absolute left-4 w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              1-Click Recruiter Demo Login
            </Button>
            <p className="text-xs text-center text-muted-foreground mt-2">Instantly access the User Dashboard for review.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
