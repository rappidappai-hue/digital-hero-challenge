import { Heart } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="bg-foreground text-background py-12 mt-20">
    <div className="container mx-auto px-4">
      <div className="grid md:grid-cols-3 gap-8">
        <div>
          <div className="flex items-center gap-2 font-display font-bold text-xl mb-3">
            <div className="w-8 h-8 rounded-lg gradient-hero flex items-center justify-center">
              <Heart className="w-4 h-4 text-primary-foreground" />
            </div>
            GolfGive
          </div>
          <p className="text-sm opacity-70">Play golf, win prizes, change lives. Every swing makes an impact.</p>
        </div>
        <div>
          <h4 className="font-display font-semibold mb-3">Quick Links</h4>
          <div className="space-y-2 text-sm opacity-70">
            <Link to="/charities" className="block hover:opacity-100 transition-opacity">Charities</Link>
            <Link to="/subscribe" className="block hover:opacity-100 transition-opacity">Subscribe</Link>
            <Link to="/auth" className="block hover:opacity-100 transition-opacity">Sign In</Link>
          </div>
        </div>
        <div>
          <h4 className="font-display font-semibold mb-3">How It Works</h4>
          <div className="space-y-2 text-sm opacity-70">
            <p>Subscribe monthly or yearly</p>
            <p>Enter your golf scores</p>
            <p>Win prizes & support charities</p>
          </div>
        </div>
      </div>
      <div className="border-t border-background/20 mt-8 pt-8 text-center text-sm opacity-50">
        © {new Date().getFullYear()} GolfGive. All rights reserved.
      </div>
    </div>
  </footer>
);

export default Footer;
