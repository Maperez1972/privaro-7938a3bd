import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, ShieldCheck } from "lucide-react";

const Policies = () => {
  const { profile } = useAuth();
  const [policies, setPolicies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile?.org_id) return;
    supabase.from("policies").select("*").eq("org_id", profile.org_id).order("created_at", { ascending: false })
      .then(({ data }) => { setPolicies(data || []); setLoading(false); });
  }, [profile?.org_id]);

  if (loading) return <div className="p-8 text-muted-foreground">Loading policies...</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Policies</h1>
        </div>
        <Button><Plus className="h-4 w-4 mr-2" />New Policy</Button>
      </div>
      {policies.length === 0 ? (
        <Card className="p-12 text-center text-muted-foreground">No policies configured. Create privacy policies to control PII handling.</Card>
      ) : (
        <div className="space-y-4">
          {policies.map(p => (
            <Card key={p.id} className="p-5 flex items-center justify-between">
              <div>
                <h3 className="font-semibold">{p.name}</h3>
                <p className="text-sm text-muted-foreground">Type: {p.type}</p>
              </div>
              <Badge variant={p.is_active ? "default" : "secondary"}>{p.is_active ? "Active" : "Inactive"}</Badge>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Policies;
