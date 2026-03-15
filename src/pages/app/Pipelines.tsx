import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Settings2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Pipelines = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [pipelines, setPipelines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile?.org_id) return;
    supabase.from("pipelines").select("*").eq("org_id", profile.org_id).order("created_at", { ascending: false })
      .then(({ data }) => { setPipelines(data || []); setLoading(false); });
  }, [profile?.org_id]);

  const toggleStatus = async (id: string, current: string) => {
    const newStatus = current === "active" ? "inactive" : "active";
    const { error } = await supabase.from("pipelines").update({ status: newStatus }).eq("id", id);
    if (!error) setPipelines(ps => ps.map(p => p.id === id ? { ...p, status: newStatus } : p));
    else toast({ title: "Error", description: error.message, variant: "destructive" });
  };

  if (loading) return <div className="p-8 text-muted-foreground">Loading pipelines...</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Pipelines</h1>
        <Button><Plus className="h-4 w-4 mr-2" />New Pipeline</Button>
      </div>
      {pipelines.length === 0 ? (
        <Card className="p-12 text-center text-muted-foreground">No pipelines configured yet. Create one to get started.</Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {pipelines.map(p => (
            <Card key={p.id} className="p-5 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{p.name}</h3>
                  <p className="text-sm text-muted-foreground">{p.llm_provider} / {p.llm_model}</p>
                </div>
                <Badge variant={p.status === "active" ? "default" : "secondary"}>{p.status}</Badge>
              </div>
              <p className="text-xs text-muted-foreground">Sector: {p.sector} · Requests: {p.total_requests}</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => toggleStatus(p.id, p.status)}>
                  <Settings2 className="h-3 w-3 mr-1" />{p.status === "active" ? "Disable" : "Enable"}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Pipelines;
