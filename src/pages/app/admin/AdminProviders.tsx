import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Server, Plus } from "lucide-react";

const AdminProviders = () => {
  const { profile } = useAuth();
  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile?.org_id) return;
    supabase.from("llm_providers").select("*").eq("org_id", profile.org_id).order("display_name")
      .then(({ data }) => { setProviders(data || []); setLoading(false); });
  }, [profile?.org_id]);

  if (loading) return <div className="p-8 text-muted-foreground">Loading providers...</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Server className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">LLM Providers</h1>
        </div>
        <Button><Plus className="h-4 w-4 mr-2" />Add Provider</Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {providers.map(p => (
          <Card key={p.id} className="p-5 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">{p.display_name}</h3>
              <Badge variant={p.is_active ? "default" : "secondary"}>{p.is_active ? "Active" : "Inactive"}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">{p.provider} · {p.data_region}{p.gdpr_compliant ? " · GDPR ✓" : ""}</p>
            <p className="text-xs text-muted-foreground">Models: {p.available_models?.join(", ")}</p>
          </Card>
        ))}
        {providers.length === 0 && <Card className="p-12 text-center text-muted-foreground col-span-2">No providers configured.</Card>}
      </div>
    </div>
  );
};

export default AdminProviders;
