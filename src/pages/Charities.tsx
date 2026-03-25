import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Heart, Search, ExternalLink } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";
import { motion } from "framer-motion";

type Charity = Tables<"charities">;

const Charities = () => {
  const [charities, setCharities] = useState<Charity[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCharities = async () => {
      const { data } = await supabase.from("charities").select("*").eq("is_active", true).order("is_featured", { ascending: false });
      if (data) setCharities(data);
      setLoading(false);
    };
    fetchCharities();
  }, []);

  const filtered = charities.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.description?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-12 container mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1 className="text-4xl font-display font-bold mb-4">Our Partner Charities</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Every subscription supports amazing causes. Choose the charity closest to your heart.
          </p>
        </motion.div>

        <div className="max-w-md mx-auto mb-8 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search charities..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">No charities found. Check back soon!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((charity, i) => (
              <motion.div key={charity.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="shadow-card hover:shadow-elevated transition-shadow h-full">
                  {charity.image_url && (
                    <div className="h-48 overflow-hidden rounded-t-lg">
                      <img src={charity.image_url} alt={charity.name} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="font-display text-lg">{charity.name}</CardTitle>
                      {charity.is_featured && <Badge className="gradient-warm text-primary-foreground border-0 text-xs">Featured</Badge>}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{charity.description}</p>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">
                        <span className="text-primary font-display font-bold">£{(charity.total_raised ?? 0).toLocaleString()}</span>{" "}
                        <span className="text-muted-foreground">raised</span>
                      </p>
                      {charity.website_url && charity.website_url.trim() !== "" && charity.website_url.trim() !== "#" && (
                        <a 
                          href={charity.website_url.trim().replace(/^["']|["']$/g, '').toLowerCase().startsWith('http') 
                            ? charity.website_url.trim().replace(/^["']|["']$/g, '') 
                            : `https://${charity.website_url.trim().replace(/^["']|["']$/g, '')}`}
                        >
                          <Button variant="outline" size="sm" className="h-8 gap-1 text-xs px-3 border-primary/20 hover:bg-primary/10 text-primary">
                            Visit Website <ExternalLink className="w-3 h-3" />
                          </Button>
                        </a>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Charities;
