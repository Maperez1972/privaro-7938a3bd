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
import { PaginationControls, paginate } from "@/components/app/PaginationControls";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/context/LanguageContext";

const AdminApiKeys = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [keys, setKeys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [keyName, setKeyName] = useState("");
  const [generating, setGenerating] = useState(false);
  const [generatedKey, setGeneratedKey] = useState("");
  const [copied, setCopied] = useState(false);
  const [permissions, setPermissions] = useState({ detect: true, protect: true });
  const [keyPage, setKeyPage] = useState(0);
  const [keyPageSize, setKeyPageSize] = useState(10);
  useEffect(() => {
    if (!profile?.org_id) return;
    supabase.from("api_keys").select("*").eq("org_id", profile.org_id).order("created_at", { ascending: false })
      .then(({ data }) => { setKeys(data || []); setLoading(false); });
  }, [profile?.org_id]);

  const generateKey = async () => {
    if (!keyName.trim() || !profile?.org_id) return;
    setGenerating(true);
    try {
      // Fixed 2026-07-24 — CRITICAL functional bug: this used to generate
      // the key client-side (crypto.randomUUID()) and insert the RAW
      // value directly into key_hash with no hashing at all. The proxy's
      // real verify_api_key() hashes the received key with SHA-256 and
      // looks that up — so no key generated this way could ever work.
      // Confirmed against real data: every key created here (including
      // Octupus's own attempt) had a broken hash_len of 35-37 chars
      // instead of a real SHA-256's 64. Moved key generation server-side
      // to create-api-key, mirroring the correct pattern already used in
      // partner-sub-accounts.
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const res = await fetch(`${supabaseUrl}/functions/v1/create-api-key`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({ name: keyName.trim(), permissions }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create key");
      setGeneratedKey(data.raw_key);
      setKeys(prev => [data, ...prev]);
    } catch (err: any) {
      toast({ title: t("app.admin.common.error"), description: err.message, variant: "destructive" });
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
    else toast({ title: t("app.admin.common.error"), description: error.message, variant: "destructive" });
  };

  const deleteKey = async (id: string) => {
    const { error } = await supabase.from("api_keys").delete().eq("id", id);
    if (!error) setKeys(ks => ks.filter(k => k.id !== id));
    else toast({ title: t("app.admin.common.error"), description: error.message, variant: "destructive" });
  };

  if (loading) return <div className="p-8 text-muted-foreground">{t("app.admin.apiKeys.loading")}</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Key className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">{t("app.admin.apiKeys.title")}</h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">{t("app.admin.apiKeys.subtitle")}</p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="bg-primary text-primary-foreground">
          <Plus className="h-4 w-4 mr-2" />{t("app.admin.apiKeys.newApiKey")}
        </Button>
      </div>

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border">
              <TableHead>{t("app.admin.apiKeys.name")}</TableHead>
              <TableHead>{t("app.admin.apiKeys.prefix")}</TableHead>
              <TableHead>{t("app.admin.apiKeys.permissions")}</TableHead>
              <TableHead>{t("app.admin.common.status")}</TableHead>
              <TableHead>{t("app.admin.apiKeys.lastUsed")}</TableHead>
              <TableHead className="text-right">{t("app.admin.common.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {keys.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-12">
                  {t("app.admin.apiKeys.noKeys")}
                </TableCell>
              </TableRow>
            ) : (() => { const { paged } = paginate(keys, keyPage, keyPageSize); return paged; })().map(k => (
              <TableRow key={k.id} className="border-border">
                <TableCell className="font-semibold">{k.name}</TableCell>
                <TableCell className="font-mono text-sm text-muted-foreground">
                  {k.key_prefix}...
                </TableCell>
                <TableCell>
                  <div className="flex gap-1.5">
                    {(k.display_permissions && Array.isArray(k.display_permissions) ? k.display_permissions : ["detect", "protect"]).map((p: string) => (
                      <Badge key={p} variant="outline" className="text-xs">{p}</Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={k.is_active ? "outline" : "secondary"}
                    className={k.is_active ? "border-green-500/50 text-green-400" : "text-muted-foreground"}
                  >
                    {k.is_active ? t("app.admin.common.active") : t("app.admin.apiKeys.revoked")}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {k.last_used_at ? new Date(k.last_used_at).toLocaleDateString() : t("app.admin.common.never")}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    {k.is_active && (
                      <Button variant="ghost" size="icon" onClick={() => revokeKey(k.id)} title={t("app.admin.apiKeys.revokeKey")}>
                        <Key className="h-4 w-4 text-primary" />
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" onClick={() => deleteKey(k.id)} title={t("app.admin.apiKeys.deleteKey")}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
      <PaginationControls page={keyPage} totalPages={Math.max(1, Math.ceil(keys.length / keyPageSize))} totalItems={keys.length} pageSize={keyPageSize} onPageChange={setKeyPage} onPageSizeChange={setKeyPageSize} />

      <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) handleCloseDialog(); else setDialogOpen(true); }}>
        <DialogContent className="max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">{generatedKey ? t("app.admin.apiKeys.keyCreated") : t("app.admin.apiKeys.createKey")}</DialogTitle>
          </DialogHeader>
          {generatedKey ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">{t("app.admin.apiKeys.copyNowWarning")}</p>
              <div className="flex gap-2">
                <Input readOnly value={generatedKey} className="font-mono text-sm" />
                <Button variant="outline" size="icon" onClick={copyKey}>
                  {copied ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <Button className="w-full" onClick={handleCloseDialog}>{t("app.admin.common.done")}</Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-muted-foreground mb-1.5">{t("app.admin.apiKeys.keyName")}</label>
                <Input
                  placeholder={t("app.admin.apiKeys.keyNamePlaceholder")}
                  value={keyName}
                  onChange={(e) => setKeyName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm text-muted-foreground mb-2">{t("app.admin.apiKeys.permissions")}</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={permissions.detect}
                      onCheckedChange={(v) => setPermissions(p => ({ ...p, detect: !!v }))}
                    />
                    <span className="text-sm">detect</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={permissions.protect}
                      onCheckedChange={(v) => setPermissions(p => ({ ...p, protect: !!v }))}
                    />
                    <span className="text-sm">protect</span>
                  </label>
                </div>
              </div>
              <Button className="w-full" onClick={generateKey} disabled={!keyName.trim() || generating || (!permissions.detect && !permissions.protect)}>
                {generating ? t("app.admin.apiKeys.generating") : t("app.admin.apiKeys.generateKey")}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminApiKeys;