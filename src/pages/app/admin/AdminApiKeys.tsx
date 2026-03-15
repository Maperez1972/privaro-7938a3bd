import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Key, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AdminApiKeys = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [keys, setKeys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile?.org_id) return;
    supabase.from("api_keys").select("*").eq("org_id", profile.org_id).order("created_at", { ascending: false })
      .then(({ data }) => { setKeys(data || []); setLoading(false); });
  }, [profile?.org_id]);

  const revokeKey = async (id: string) => {
    const { error } = await supabase.from("api_keys").update({ is_active: false }).eq("id", id);
    if (!error) setKeys(ks => ks.map(k => k.id === id ? { ...k, is_active: false } : k));
    else toast({ title: "Error", description: error.message, variant: "destructive" });
  };

  if (loading) return <div className="p-8 text-muted-foreground">Loading API keys...</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Key className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">API Keys</h1>
        </div>
        <Button><Plus className="h-4 w-4 mr-2" />Generate Key</Button>
      </div>
      <div className="space-y-4">
        {keys.length === 0 ? (
          <Card className="p-12 text-center text-muted-foreground">No API keys generated yet.</Card>
        ) : keys.map(k => (
          <Card key={k.id} className="p-5 flex items-center justify-between">
            <div>
              <h3 className="font-semibold">{k.name}</h3>
              <p className="text-sm text-muted-foreground">Created {new Date(k.created_at).toLocaleDateString()}{k.last_used_at ? ` · Last used ${new Date(k.last_used_at).toLocaleDateString()}` : ""}</p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={k.is_active ? "default" : "secondary"}>{k.is_active ? "Active" : "Revoked"}</Badge>
              {k.is_active && <Button variant="ghost" size="icon" onClick={() => revokeKey(k.id)}><Trash2 className="h-4 w-4" /></Button>}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminApiKeys;
