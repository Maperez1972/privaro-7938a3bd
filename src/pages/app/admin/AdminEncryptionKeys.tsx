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

const formatRelative = (d: string | null) => {
  if (!d) return "Never";
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
      toast({ title: "Failed to load keys", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { fetchKeys(); }, [fetchKeys]);

  // Add BYOK
  const handleAdd = async () => {
    if (!addName.trim()) return;
    if (!HEX_REGEX.test(addMaterial)) {
      toast({ title: "Invalid key material", description: "Must be exactly 64 hexadecimal characters.", variant: "destructive" });
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
      toast({ title: "BYOK key created" });
      setAddOpen(false);
      setAddName("");
      setAddMaterial("");
      setAddDefault(false);
      fetchKeys();
    } catch (err: any) {
      toast({ title: "Failed to create key", description: err.message, variant: "destructive" });
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
      toast({ title: "Default key updated" });
      fetchKeys();
    } catch (err: any) {
      toast({ title: "Failed to set default", description: err.message, variant: "destructive" });
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
      toast({ title: "Key revoked" });
      setRevokeOpen(false);
      setRevokeKey(null);
      fetchKeys();
    } catch (err: any) {
      toast({ title: "Revoke failed", description: err.message, variant: "destructive" });
    } finally {
      setRevoking(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Encryption Keys</h1>
          <p className="text-sm text-muted-foreground">Manage encryption keys for the Token Vault</p>
        </div>
        <Button onClick={() => setAddOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" /> Add BYOK Key
        </Button>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/30 p-4">
        <Info className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
        <p className="text-sm text-muted-foreground">
          BYOK keys allow you to use your own encryption keys to protect sensitive data. Privaro never stores your key material.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <ShieldCheck className="w-5 h-5" /> Keys
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
              <Button variant="outline" size="sm" onClick={fetchKeys}>Retry</Button>
            </div>
          ) : keys.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
              <ShieldCheck className="w-10 h-10 opacity-40" />
              <p className="text-sm">No encryption keys configured</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Algorithm</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Default</TableHead>
                  <TableHead className="text-right">Tokens Encrypted</TableHead>
                  <TableHead>Last Used</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
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
                        {k.status || "Active"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Star className={`w-4 h-4 mx-auto ${k.is_default ? "text-amber-400 fill-amber-400" : "text-muted-foreground/30"}`} />
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{formatNumber(k.tokens_encrypted ?? 0)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{formatRelative(k.last_used_at)}</TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={k.is_default || settingDefault === k.id}
                        onClick={() => handleSetDefault(k.id)}
                      >
                        {settingDefault === k.id && <Loader2 className="w-3 h-3 animate-spin mr-1" />}
                        Set Default
                      </Button>
                      {k.key_type !== "managed" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive border-destructive/30 hover:bg-destructive/10"
                          onClick={() => { setRevokeKey(k); setRevokeOpen(true); }}
                        >
                          Revoke
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
            <DialogTitle>Add BYOK Key</DialogTitle>
            <DialogDescription>Provide your own 256-bit AES encryption key.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="byok-name">Display Name</Label>
              <Input id="byok-name" placeholder="e.g. Production Key" value={addName} onChange={(e) => setAddName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="byok-material">Key Material</Label>
              <Textarea
                id="byok-material"
                placeholder="64 hexadecimal characters"
                value={addMaterial}
                onChange={(e) => setAddMaterial(e.target.value.replace(/\s/g, ""))}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">Enter your 256-bit AES key as 64 hexadecimal characters</p>
              {addMaterial.length > 0 && !HEX_REGEX.test(addMaterial) && (
                <p className="text-xs text-destructive">
                  {addMaterial.length !== 64
                    ? `${addMaterial.length}/64 characters`
                    : "Invalid characters — only 0-9 and a-f allowed"}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="byok-default" checked={addDefault} onCheckedChange={(v) => setAddDefault(!!v)} />
              <Label htmlFor="byok-default" className="text-sm font-normal">Set as default encryption key</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={handleAdd} disabled={adding || !addName.trim() || !HEX_REGEX.test(addMaterial)}>
              {adding && <Loader2 className="w-4 h-4 animate-spin mr-1.5" />}
              Create Key
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Revoke Confirm */}
      <AlertDialog open={revokeOpen} onOpenChange={setRevokeOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke Encryption Key</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure? Tokens encrypted with this key will no longer be decryptable.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRevoke} disabled={revoking} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {revoking && <Loader2 className="w-4 h-4 animate-spin mr-1.5" />}
              Revoke Key
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminEncryptionKeys;
