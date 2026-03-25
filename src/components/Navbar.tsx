import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Heart, Menu, X, LogOut, LayoutDashboard, Shield } from "lucide-react";
import { useState } from "react";

const Navbar = () => {
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-display font-bold text-xl">
          <div className="w-8 h-8 rounded-lg gradient-hero flex items-center justify-center">
            <Heart className="w-4 h-4 text-primary-foreground" />
          </div>
          <span>GolfGive</span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <Link to="/charities" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Charities
          </Link>
          {user ? (
            <>
              {isAdmin ? (
                <Link to="/admin/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                  <Shield className="w-4 h-4" /> Admin Portal
                </Link>
              ) : (
                <Link to="/user/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                  <LayoutDashboard className="w-4 h-4" /> User Dashboard
                </Link>
              )}
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="w-4 h-4 mr-1" /> Sign Out
              </Button>
            </>
          ) : (
            <>
              <Link to="/auth">
                <Button variant="ghost" size="sm">Sign In</Button>
              </Link>
              <Link to="/subscribe">
                <Button size="sm" className="gradient-hero text-primary-foreground border-0">Subscribe</Button>
              </Link>
            </>
          )}
        </div>

        <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-card border-b border-border p-4 space-y-3">
          <Link to="/charities" className="block text-sm font-medium py-2" onClick={() => setMobileOpen(false)}>Charities</Link>
          {user ? (
            <>
              {isAdmin ? (
                <Link to="/admin/dashboard" className="block text-sm font-medium py-2" onClick={() => setMobileOpen(false)}>Admin Portal</Link>
              ) : (
                <Link to="/user/dashboard" className="block text-sm font-medium py-2" onClick={() => setMobileOpen(false)}>User Dashboard</Link>
              )}
              <button className="text-sm font-medium py-2 text-destructive" onClick={() => { handleSignOut(); setMobileOpen(false); }}>Sign Out</button>
            </>
          ) : (
            <>
              <Link to="/auth" className="block text-sm font-medium py-2" onClick={() => setMobileOpen(false)}>Sign In</Link>
              <Link to="/subscribe" className="block" onClick={() => setMobileOpen(false)}>
                <Button size="sm" className="w-full gradient-hero text-primary-foreground border-0">Subscribe</Button>
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
