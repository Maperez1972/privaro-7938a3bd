import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, Plus, Loader2, ShieldCheck, Info } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useLanguage } from "@/context/LanguageContext";

const BASE_URL = "https://evtfdgjliyhpubbrxzuq.supabase.co/functions/v1/byok-admin";

interface EncryptionKey {
  id: string;
  display_name: string;
  key_type: "managed" | "byok" | "kms_aws";
  algorithm: string;
  status: string;
  is_default: boolean;
  tokens_encrypted: number;
  last_used_at: string | null;
  created_at: string;
}

const keyTypeBadge: Record<string, string> = {
  managed: "bg-muted text-muted-foreground border-border",
  byok: "bg-purple-500/15 text-purple-400 border-purple-500/30",
  kms_aws: "bg-blue-500/15 text-blue-400 border-blue-500/30",
};

const statusBadge: Record<string, string> = {
  active: "bg-green-500/15 text-green-400 border-green-500/30",
  inactive: "bg-red-500/15 text-red-400 border-red-500/30",
};

const getToken = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Not authenticated");
  return session.access_token;
};

const apiFetch = async (path: string, options: RequestInit = {}) => {
  const token = await getToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || data?.message || `Error ${res.status}`);
  return data;
};

const formatRelative = (d: string | null, neverLabel: string) => {
  if (!d) return neverLabel;
  try {
    return formatDistanceToNow(new Date(d), { addSuffix: true });
  } catch {
    return "—";
  }
};

const formatNumber = (n: number) => n.toLocaleString("en-US");

const HEX_REGEX = /^[0-9a-fA-F]{64}$/;

const AdminEncryptionKeys = () => {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [keys, setKeys] = useState<EncryptionKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add BYOK modal
  const [addOpen, setAddOpen] = useState(false);
  const [addName, setAddName] = useState("");
  const [addMaterial, setAddMaterial] = useState("");
  const [addDefault, setAddDefault] = useState(false);
  const [adding, setAdding] = useState(false);

  // Set default
  const [settingDefault, setSettingDefault] = useState<string | null>(null);

  // Revoke
  const [revokeOpen, setRevokeOpen] = useState(false);
  const [revokeKey, setRevokeKey] = useState<EncryptionKey | null>(null);
  const [revoking, setRevoking] = useState(false);

  const fetchKeys = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch("");
      setKeys(Array.isArray(data) ? data : data.keys ?? []);
    } catch (err: any) {
      setError(err.message);
      toast({ title: t("app.admin.encryption.failedLoad"), description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { fetchKeys(); }, [fetchKeys]);

  // Add BYOK
  const handleAdd = async () => {
    if (!addName.trim()) return;
    if (!HEX_REGEX.test(addMaterial)) {
      toast({ title: t("app.admin.encryption.invalidKeyMaterial"), description: t("app.admin.encryption.invalidKeyMaterialDesc"), variant: "destructive" });
      return;
    }
    setAdding(true);
    try {
      await apiFetch("", {
        method: "POST",
        body: JSON.stringify({
          key_type: "byok",
          display_name: addName.trim(),
          key_material: addMaterial,
          set_as_default: addDefault,
        }),
      });
      toast({ title: t("app.admin.encryption.byokCreated") });
      setAddOpen(false);
      setAddName("");
      setAddMaterial("");
      setAddDefault(false);
      fetchKeys();
    } catch (err: any) {
      toast({ title: t("app.admin.encryption.failedCreate"), description: err.message, variant: "destructive" });
    } finally {
      setAdding(false);
    }
  };

  // Set as default
  const handleSetDefault = async (keyId: string) => {
    setSettingDefault(keyId);
    try {
      await apiFetch(`/${keyId}`, {
        method: "PATCH",
        body: JSON.stringify({ set_as_default: true }),
      });
      toast({ title: t("app.admin.encryption.defaultUpdated") });
      fetchKeys();
    } catch (err: any) {
      toast({ title: t("app.admin.encryption.failedSetDefault"), description: err.message, variant: "destructive" });
    } finally {
      setSettingDefault(null);
    }
  };

  // Revoke
  const handleRevoke = async () => {
    if (!revokeKey) return;
    setRevoking(true);
    try {
      await apiFetch(`/${revokeKey.id}`, { method: "DELETE" });
      toast({ title: t("app.admin.encryption.keyRevoked") });
      setRevokeOpen(false);
      setRevokeKey(null);
      fetchKeys();
    } catch (err: any) {
      toast({ title: t("app.admin.encryption.revokeFailed"), description: err.message, variant: "destructive" });
    } finally {
      setRevoking(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("app.admin.encryption.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("app.admin.encryption.subtitle")}</p>
        </div>
        <Button onClick={() => setAddOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" /> {t("app.admin.encryption.addByok")}
        </Button>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/30 p-4">
        <Info className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
        <p className="text-sm text-muted-foreground">
          {t("app.admin.encryption.byokInfo")}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <ShieldCheck className="w-5 h-5" /> {t("app.admin.encryption.keys")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
              <p className="text-sm text-destructive">{error}</p>
              <Button variant="outline" size="sm" onClick={fetchKeys}>{t("app.admin.common.retry")}</Button>
            </div>
          ) : keys.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
              <ShieldCheck className="w-10 h-10 opacity-40" />
              <p className="text-sm">{t("app.admin.encryption.noKeys")}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("app.admin.apiKeys.name")}</TableHead>
                  <TableHead>{t("app.admin.encryption.type")}</TableHead>
                  <TableHead>{t("app.admin.encryption.algorithm")}</TableHead>
                  <TableHead>{t("app.admin.common.status")}</TableHead>
                  <TableHead className="text-center">{t("app.admin.encryption.default")}</TableHead>
                  <TableHead className="text-right">{t("app.admin.encryption.tokensEncrypted")}</TableHead>
                  <TableHead>{t("app.admin.apiKeys.lastUsed")}</TableHead>
                  <TableHead className="text-right">{t("app.admin.common.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {keys.map((k) => (
                  <TableRow key={k.id}>
                    <TableCell className="font-medium">{k.display_name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={keyTypeBadge[k.key_type] || keyTypeBadge.managed}>
                        {k.key_type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{k.algorithm || "AES-256-GCM"}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusBadge[k.status?.toLowerCase()] || statusBadge.inactive}>
                        {k.status || t("app.admin.common.active")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Star className={`w-4 h-4 mx-auto ${k.is_default ? "text-amber-400 fill-amber-400" : "text-muted-foreground/30"}`} />
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{formatNumber(k.tokens_encrypted ?? 0)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{formatRelative(k.last_used_at, t("app.admin.common.never"))}</TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={k.is_default || settingDefault === k.id}
                        onClick={() => handleSetDefault(k.id)}
                      >
                        {settingDefault === k.id && <Loader2 className="w-3 h-3 animate-spin mr-1" />}
                        {t("app.admin.encryption.setDefault")}
                      </Button>
                      {k.key_type !== "managed" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive border-destructive/30 hover:bg-destructive/10"
                          onClick={() => { setRevokeKey(k); setRevokeOpen(true); }}
                        >
                          {t("app.admin.encryption.revoke")}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add BYOK Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("app.admin.encryption.addByok")}</DialogTitle>
            <DialogDescription>{t("app.admin.encryption.addByokDesc")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="byok-name">{t("app.admin.encryption.displayName")}</Label>
              <Input id="byok-name" placeholder={t("app.admin.encryption.displayNamePlaceholder")} value={addName} onChange={(e) => setAddName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="byok-material">{t("app.admin.encryption.keyMaterial")}</Label>
              <Textarea
                id="byok-material"
                placeholder={t("app.admin.encryption.keyMaterialPlaceholder")}
                value={addMaterial}
                onChange={(e) => setAddMaterial(e.target.value.replace(/\s/g, ""))}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">{t("app.admin.encryption.keyMaterialHint")}</p>
              {addMaterial.length > 0 && !HEX_REGEX.test(addMaterial) && (
                <p className="text-xs text-destructive">
                  {addMaterial.length !== 64
                    ? `${addMaterial.length}/64 ${t("app.admin.encryption.characters")}`
                    : t("app.admin.encryption.invalidChars")}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="byok-default" checked={addDefault} onCheckedChange={(v) => setAddDefault(!!v)} />
              <Label htmlFor="byok-default" className="text-sm font-normal">{t("app.admin.encryption.setAsDefaultCheckbox")}</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>{t("app.admin.common.cancel")}</Button>
            <Button onClick={handleAdd} disabled={adding || !addName.trim() || !HEX_REGEX.test(addMaterial)}>
              {adding && <Loader2 className="w-4 h-4 animate-spin mr-1.5" />}
              {t("app.admin.encryption.createKey")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Revoke Confirm */}
      <AlertDialog open={revokeOpen} onOpenChange={setRevokeOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("app.admin.encryption.revokeTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("app.admin.encryption.revokeConfirm")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("app.admin.common.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleRevoke} disabled={revoking} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {revoking && <Loader2 className="w-4 h-4 animate-spin mr-1.5" />}
              {t("app.admin.encryption.revokeKeyBtn")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminEncryptionKeys;
