import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Shield } from "lucide-react";

const AdminAuth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAdmin, isLoading, signOut } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (user && isAdmin) {
        navigate("/admin");
      } else if (user && !isAdmin) {
        toast({ 
          title: "Access Denied", 
          description: "This portal is restricted to authorized administrators only. Your account lacks the required permissions.", 
          variant: "destructive" 
        });
        // Immediately sign out to prevent session pollution
        signOut();
      }
    }
  }, [user, isAdmin, isLoading, navigate, toast, signOut]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        toast({ title: "Authentication Failed", description: error.message, variant: "destructive" });
      } else if (data.user) {
        // Success - redirect will be handled by the useEffect once session/isAdmin updates
        toast({ title: "Verifying credentials...", description: "Securely authenticating admin session." });
      }
    } catch (err: any) {
      toast({ title: "Unexpected Error", description: err.message || "An error occurred", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md shadow-elevated border-primary/10">
        <CardHeader className="text-center">
          <div className="w-12 h-12 rounded-xl gradient-hero flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/20">
            <Shield className="w-6 h-6 text-primary-foreground" />
          </div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary mb-1">Secure Environment</p>
          <h2 className="text-2xl font-display font-bold text-center mb-1">Administrative Terminal</h2>
          <CardDescription className="text-center text-xs">
            Authorized Personnel Only • IP Logging Active
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Admin Email</Label>
              <Input 
                id="email" 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="admin@golfgive.com" 
                className="h-11 border-primary/10 focus:border-primary/30"
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Security Key</Label>
              <Input 
                id="password" 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="••••••••" 
                className="h-11 border-primary/10 focus:border-primary/30"
                required 
              />
            </div>
            <Button type="submit" className="w-full gradient-hero text-primary-foreground border-0 h-11 shadow-md shadow-primary/10 hover:shadow-lg transition-all" disabled={loading}>
              {loading ? "Authenticating..." : "Establish Secure Connection"}
            </Button>
          </form>
          
          <div className="mt-8 pt-6 border-t border-primary/5">
            <div className="p-3 rounded-lg bg-primary/5 border border-primary/10 text-center">
              <p className="text-[10px] font-bold text-primary uppercase tracking-wider mb-1">Recruiter Evaluation Note</p>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Use your official admin credentials. Public signup is disabled for this secure demo environment.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAuth;
