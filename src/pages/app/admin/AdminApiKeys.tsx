import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Key, Plus, Trash2, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AdminApiKeys = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [keys, setKeys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [keyName, setKeyName] = useState("");
  const [generating, setGenerating] = useState(false);
  const [generatedKey, setGeneratedKey] = useState("");
  const [copied, setCopied] = useState(false);
  const [permissions, setPermissions] = useState({ detect: true, protect: true });
  useEffect(() => {
    if (!profile?.org_id) return;
    supabase.from("api_keys").select("*").eq("org_id", profile.org_id).order("created_at", { ascending: false })
      .then(({ data }) => { setKeys(data || []); setLoading(false); });
  }, [profile?.org_id]);

  const generateKey = async () => {
    if (!keyName.trim() || !profile?.org_id) return;
    setGenerating(true);
    try {
      const rawKey = `pk_${crypto.randomUUID().replace(/-/g, "")}`;
      const keyPrefix = rawKey.slice(0, 8);
      const selectedPerms = Object.entries(permissions).filter(([, v]) => v).map(([k]) => k);
      const { data, error } = await supabase.from("api_keys").insert({
        name: keyName.trim(),
        key_hash: rawKey,
        key_prefix: keyPrefix,
        org_id: profile.org_id,
        is_active: true,
        permissions: selectedPerms,
      } as any).select().single();
      if (error) throw error;
      setGeneratedKey(rawKey);
      setKeys(prev => [data, ...prev]);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setKeyName("");
    setGeneratedKey("");
    setCopied(false);
    setPermissions({ detect: true, protect: true });
  };

  const copyKey = async () => {
    await navigator.clipboard.writeText(generatedKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const revokeKey = async (id: string) => {
    const { error } = await supabase.from("api_keys").update({ is_active: false }).eq("id", id);
    if (!error) setKeys(ks => ks.map(k => k.id === id ? { ...k, is_active: false } : k));
    else toast({ title: "Error", description: error.message, variant: "destructive" });
  };

  const deleteKey = async (id: string) => {
    const { error } = await supabase.from("api_keys").delete().eq("id", id);
    if (!error) setKeys(ks => ks.filter(k => k.id !== id));
    else toast({ title: "Error", description: error.message, variant: "destructive" });
  };

  if (loading) return <div className="p-8 text-muted-foreground">Loading API keys...</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Key className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">API Keys</h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">Manage integration API keys</p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="bg-primary text-primary-foreground">
          <Plus className="h-4 w-4 mr-2" />New API Key
        </Button>
      </div>

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border">
              <TableHead>Name</TableHead>
              <TableHead>Prefix</TableHead>
              <TableHead>Permissions</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Used</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {keys.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-12">
                  No API keys yet
                </TableCell>
              </TableRow>
            ) : keys.map(k => (
              <TableRow key={k.id} className="border-border">
                <TableCell className="font-semibold">{k.name}</TableCell>
                <TableCell className="font-mono text-sm text-muted-foreground">
                  {k.key_prefix}...
                </TableCell>
                <TableCell>
                  <div className="flex gap-1.5">
                    {(k.permissions && Array.isArray(k.permissions) ? k.permissions : ["detect", "protect"]).map((p: string) => (
                      <Badge key={p} variant="secondary" className="text-xs">{p}</Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={k.is_active ? "outline" : "secondary"}
                    className={k.is_active ? "border-green-500/50 text-green-400" : "text-muted-foreground"}
                  >
                    {k.is_active ? "Active" : "Revoked"}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {k.last_used_at ? new Date(k.last_used_at).toLocaleDateString() : "Never"}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    {k.is_active && (
                      <Button variant="ghost" size="icon" onClick={() => revokeKey(k.id)} title="Revoke key">
                        <Key className="h-4 w-4 text-primary" />
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" onClick={() => deleteKey(k.id)} title="Delete key">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) handleCloseDialog(); else setDialogOpen(true); }}>
        <DialogContent className="max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">{generatedKey ? "API Key Created" : "Create API Key"}</DialogTitle>
          </DialogHeader>
          {generatedKey ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Copy your API key now. You won't be able to see it again.</p>
              <div className="flex gap-2">
                <Input readOnly value={generatedKey} className="font-mono text-sm" />
                <Button variant="outline" size="icon" onClick={copyKey}>
                  {copied ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <Button className="w-full" onClick={handleCloseDialog}>Done</Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-muted-foreground mb-1.5">Key Name</label>
                <Input
                  placeholder="e.g. Production API"
                  value={keyName}
                  onChange={(e) => setKeyName(e.target.value)}
                />
              </div>
              <Button className="w-full" onClick={generateKey} disabled={!keyName.trim() || generating}>
                {generating ? "Generating..." : "Generate Key"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminApiKeys;