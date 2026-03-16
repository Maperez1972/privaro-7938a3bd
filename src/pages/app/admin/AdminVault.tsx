import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Eye, Trash2, KeyRound, Copy, Check, Loader2 } from "lucide-react";

interface VaultToken {
  id: string;
  entity_type: string;
  token_value: string;
  encryption_key_id: string;
  is_reversible: boolean;
  access_roles: string[];
  reversal_count: number;
  last_reversed_at: string | null;
  last_reversed_by: string | null;
  expires_at: string | null;
  created_at: string;
}

interface AccessLogEntry {
  id: string;
  action: string;
  created_at: string;
  user_id: string;
  token_id: string;
  ip_address: string | null;
}

const entityColors: Record<string, string> = {
  dni: "bg-purple-500/15 text-purple-400 border-purple-500/30",
  nie: "bg-purple-500/15 text-purple-400 border-purple-500/30",
  ssn: "bg-purple-500/15 text-purple-400 border-purple-500/30",
  email: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  iban: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  credit_card: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  phone: "bg-green-500/15 text-green-400 border-green-500/30",
  health_record: "bg-red-500/15 text-red-400 border-red-500/30",
  full_name: "bg-muted text-muted-foreground border-border",
};

const getEntityBadgeClass = (type: string) =>
  entityColors[type] || "bg-muted text-muted-foreground border-border";

const formatDate = (d: string | null) => {
  if (!d) return "Never";
  return new Date(d).toLocaleString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
};

const AdminVault = () => {
  const { profile } = useAuth();
  const { toast } = useToast();

  const [tokens, setTokens] = useState<VaultToken[]>([]);
  const [accessLog, setAccessLog] = useState<AccessLogEntry[]>([]);
  const [loadingTokens, setLoadingTokens] = useState(true);
  const [loadingLog, setLoadingLog] = useState(false);

  // Reveal state
  const [revealOpen, setRevealOpen] = useState(false);
  const [selectedToken, setSelectedToken] = useState<VaultToken | null>(null);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [revealedValue, setRevealedValue] = useState<string | null>(null);
  const [revealing, setRevealing] = useState(false);
  const [copied, setCopied] = useState(false);

  // Revoke state
  const [revokeOpen, setRevokeOpen] = useState(false);
  const [revokeToken, setRevokeToken] = useState<VaultToken | null>(null);
  const [revoking, setRevoking] = useState(false);

  const fetchTokens = async () => {
    if (!profile?.org_id) return;
    setLoadingTokens(true);
    const { data, error } = await (supabase as any)
      .from("tokens_vault")
      .select("id, entity_type, token_value, encryption_key_id, is_reversible, access_roles, reversal_count, last_reversed_at, last_reversed_by, expires_at, created_at")
      .eq("org_id", profile.org_id)
      .eq("is_reversible", true)
      .order("created_at", { ascending: false });
    if (error) {
      toast({ title: "Error loading tokens", description: error.message, variant: "destructive" });
    } else {
      setTokens((data as any) ?? []);
    }
    setLoadingTokens(false);
  };

  const fetchAccessLog = async () => {
    if (!profile?.org_id) return;
    setLoadingLog(true);
    const { data, error } = await (supabase as any)
      .from("vault_access_log")
      .select("id, action, created_at, user_id, token_id, ip_address")
      .eq("org_id", profile.org_id)
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) {
      toast({ title: "Error loading access log", description: error.message, variant: "destructive" });
    } else {
      setAccessLog((data as any) ?? []);
    }
    setLoadingLog(false);
  };

  useEffect(() => {
    fetchTokens();
  }, [profile?.org_id]);

  // --- Reveal ---
  const openReveal = (token: VaultToken) => {
    setSelectedToken(token);
    setConfirmPassword("");
    setRevealedValue(null);
    setCopied(false);
    setRevealOpen(true);
  };

  const handleReveal = async () => {
    if (!selectedToken || !confirmPassword) return;
    setRevealing(true);
    try {
      const { data, error } = await supabase.functions.invoke("reveal-token", {
        body: { token_id: selectedToken.id, password: confirmPassword },
      });
      if (error || data?.error) throw new Error(data?.error || error?.message);
      setRevealedValue(data.value);
      fetchTokens();
    } catch (err: any) {
      toast({ title: "Reveal failed", description: err.message, variant: "destructive" });
    } finally {
      setRevealing(false);
    }
  };

  const handleCopy = async () => {
    if (!revealedValue) return;
    await navigator.clipboard.writeText(revealedValue);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // --- Revoke ---
  const openRevoke = (token: VaultToken) => {
    setRevokeToken(token);
    setRevokeOpen(true);
  };

  const handleRevoke = async () => {
    if (!revokeToken) return;
    setRevoking(true);
    const { error } = await supabase
      .from("tokens_vault")
      .delete()
      .eq("id", revokeToken.id);
    if (error) {
      toast({ title: "Revoke failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Token revoked" });
      fetchTokens();
    }
    setRevoking(false);
    setRevokeOpen(false);
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Tokens Vault</h1>
        <p className="text-sm text-muted-foreground">Manage reversible tokens and track access history</p>
      </div>

      <Tabs defaultValue="tokens" onValueChange={(v) => v === "log" && fetchAccessLog()}>
        <TabsList>
          <TabsTrigger value="tokens">Active Tokens</TabsTrigger>
          <TabsTrigger value="log">Access Log</TabsTrigger>
        </TabsList>

        {/* TAB 1: Active Tokens */}
        <TabsContent value="tokens">
          <Card>
            <CardHeader><CardTitle className="text-lg">Reversible Tokens</CardTitle></CardHeader>
            <CardContent>
              {loadingTokens ? (
                <div className="flex items-center justify-center py-12 text-muted-foreground">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading…
                </div>
              ) : tokens.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
                  <KeyRound className="w-10 h-10 opacity-40" />
                  <p className="text-sm">No tokens in vault yet</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Token</TableHead>
                      <TableHead>Entity Type</TableHead>
                      <TableHead>Key ID</TableHead>
                      <TableHead className="text-center">Reversals</TableHead>
                      <TableHead>Last Revealed</TableHead>
                      <TableHead>Expires</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tokens.map((t) => (
                      <TableRow key={t.id}>
                        <TableCell className="font-mono text-sm">{t.token_value}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getEntityBadgeClass(t.entity_type)}>
                            {t.entity_type}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">{t.encryption_key_id}</TableCell>
                        <TableCell className="text-center">{t.reversal_count}</TableCell>
                        <TableCell className="text-sm">{formatDate(t.last_reversed_at)}</TableCell>
                        <TableCell className="text-sm">{formatDate(t.expires_at)}</TableCell>
                        <TableCell className="text-right space-x-1">
                          <Button variant="ghost" size="icon" onClick={() => openReveal(t)} title="Reveal">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => openRevoke(t)} title="Revoke" className="text-destructive hover:text-destructive">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: Access Log */}
        <TabsContent value="log">
          <Card>
            <CardHeader><CardTitle className="text-lg">Vault Access Log</CardTitle></CardHeader>
            <CardContent>
              {loadingLog ? (
                <div className="flex items-center justify-center py-12 text-muted-foreground">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading…
                </div>
              ) : accessLog.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
                  <KeyRound className="w-10 h-10 opacity-40" />
                  <p className="text-sm">No access log entries yet</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Time</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Token ID</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>IP</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {accessLog.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell className="text-sm">{formatDate(entry.created_at)}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={entry.action === "reveal" ? "bg-blue-500/15 text-blue-400 border-blue-500/30" : "bg-red-500/15 text-red-400 border-red-500/30"}>
                            {entry.action}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground truncate max-w-[120px]">{entry.token_id}</TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground truncate max-w-[120px]">{entry.user_id}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{entry.ip_address || "—"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Reveal Dialog */}
      <Dialog open={revealOpen} onOpenChange={(o) => { if (!o) setRevealOpen(false); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reveal Token Value</DialogTitle>
            <DialogDescription>
              Decrypt and view the original value for this token.
            </DialogDescription>
          </DialogHeader>

          {selectedToken && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm">{selectedToken.token_value}</span>
                <Badge variant="outline" className={getEntityBadgeClass(selectedToken.entity_type)}>
                  {selectedToken.entity_type}
                </Badge>
                <span className="text-xs text-muted-foreground">({selectedToken.reversal_count} prior reveals)</span>
              </div>

              {revealedValue ? (
                <div className="rounded-md border border-green-500/30 bg-green-500/10 p-4 space-y-2">
                  <p className="font-mono text-sm text-green-400 break-all select-all">{revealedValue}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-amber-400">⚠️ This value will only be shown once. Copy it now.</p>
                    <Button variant="ghost" size="sm" onClick={handleCopy} className="gap-1.5">
                      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {copied ? "Copied" : "Copy"}
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Enter your password to confirm</label>
                    <Input
                      type="password"
                      placeholder="Password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleReveal()}
                    />
                  </div>
                  <DialogFooter>
                    <Button onClick={handleReveal} disabled={!confirmPassword || revealing}>
                      {revealing && <Loader2 className="w-4 h-4 animate-spin mr-1.5" />}
                      Reveal Value
                    </Button>
                  </DialogFooter>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Revoke AlertDialog */}
      <AlertDialog open={revokeOpen} onOpenChange={setRevokeOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke Token</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <span className="font-mono">{revokeToken?.token_value}</span> from the vault. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRevoke} disabled={revoking} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {revoking && <Loader2 className="w-4 h-4 animate-spin mr-1.5" />}
              Revoke
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminVault;
