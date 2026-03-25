import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  isAdmin: boolean;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  isAdmin: false,
  isLoading: true,
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const checkAdmin = async (userId: string) => {
    try {
      const { data, error } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
      if (error) console.error("Admin check error:", error);
      setIsAdmin(!!data);
    } catch (e) {
      console.error("Rpc rejection:", e);
      setIsAdmin(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!mounted) return;
        setSession(session);
        if (session?.user) {
          await checkAdmin(session.user.id);
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      if (event === 'INITIAL_SESSION') return; 
      
      setSession(session);
      
      if (session?.user) {
        setIsLoading(true);
        try {
          // Perform admin check, but don't let it hang the whole app indefinitely
          // We'll wrap it in a promise that resolves after a timeout just in case
          const adminPromise = checkAdmin(session.user.id);
          const timeoutPromise = new Promise(resolve => setTimeout(resolve, 2000));
          
          await Promise.race([adminPromise, timeoutPromise]);
        } catch (e) {
          console.error("Auth state handling error:", e);
        } finally {
          if (mounted) setIsLoading(false);
        }
      } else {
        setIsAdmin(false);
        setIsLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    // Fire and forget to avoid Promise-queue deadlocks
    supabase.auth.signOut().catch(e => console.warn(e));
    
    // Explicitly detonate the local browser cache to guarantee immediate session wiping
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('sb-')) localStorage.removeItem(key);
    });
    
    setSession(null);
    setIsAdmin(false);
    
    // Hard jump to homepage
    window.location.href = "/";
  };

  return (
    <AuthContext.Provider value={{ session, user: session?.user ?? null, isAdmin, isLoading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
