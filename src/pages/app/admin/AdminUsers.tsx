import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Users, Plus, MoreHorizontal, Loader2, UserCheck, UserX, Copy, Link } from "lucide-react";
import { toast } from "sonner";
import { PaginationControls, paginate } from "@/components/app/PaginationControls";
import { useLanguage } from "@/context/LanguageContext";

const roleBadgeColors: Record<string, string> = {
  admin: "bg-purple-500/15 text-purple-400 border-purple-500/30",
  dpo: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  developer: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  viewer: "bg-muted text-muted-foreground border-border",
};

interface UserRow {
  id: string;
  full_name: string;
  is_active: boolean;
  created_at: string;
  role: string;
}

const AdminUsers = () => {
  const { profile, user } = useAuth();
  const { t } = useLanguage();
  const orgId = profile?.org_id;
  const queryClient = useQueryClient();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [userPage, setUserPage] = useState(0);
  const [userPageSize, setUserPageSize] = useState(10);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("viewer");
  const [inviteLink, setInviteLink] = useState<string | null>(null);

  const { data: users, isLoading } = useQuery({
    queryKey: ["admin-users", orgId],
    enabled: !!orgId,
    queryFn: async () => {
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("id, full_name, is_active, created_at")
        .eq("org_id", orgId!);
      if (error) throw error;

      const { data: roles } = await supabase
        .from("user_roles")
        .select("user_id, role");

      const roleMap = new Map<string, string>();
      roles?.forEach((r) => roleMap.set(r.user_id, r.role));

      return profiles.map((p) => ({
        ...p,
        role: roleMap.get(p.id) ?? "viewer",
      })) as UserRow[];
    },
  });

  const changeRole = useMutation({
    mutationFn: async ({ userId, newRole }: { userId: string; newRole: string }) => {
      // Delete existing role and insert new one
      await supabase.from("user_roles").delete().eq("user_id", userId);
      const { error } = await (supabase as any).from("user_roles").insert({
        user_id: userId,
        org_id: orgId!,
        role: newRole as "admin" | "dpo" | "developer" | "viewer",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users", orgId] });
      toast.success(t("app.admin.users.roleUpdated"));
    },
    onError: () => toast.error(t("app.admin.users.roleUpdateFailed")),
  });

  const toggleActive = useMutation({
    mutationFn: async ({ userId, is_active }: { userId: string; is_active: boolean }) => {
      const { error } = await supabase
        .from("profiles")
        .update({ is_active })
        .eq("id", userId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users", orgId] });
      toast.success(t("app.admin.users.statusUpdated"));
    },
    onError: () => toast.error(t("app.admin.users.statusUpdateFailed")),
  });

  const inviteUser = useMutation({
    mutationFn: async () => {
      if (!orgId || !inviteEmail) throw new Error(t("app.admin.users.missingData"));

      const { data, error } = await (supabase.rpc as any)("create_invitation", {
        p_email: inviteEmail,
        p_role: inviteRole,
      });

      if (error) {
        console.error("RPC create_invitation error:", JSON.stringify(error));
        throw new Error(error.message || error.details || t("app.admin.users.rpcError"));
      }
      if (!data) throw new Error(t("app.admin.users.noTokenReturned"));
      return data as string;
    },
    onSuccess: (token: string) => {
      const baseUrl = window.location.origin;
      const link = `${baseUrl}/auth?invitation_token=${token}&email=${encodeURIComponent(inviteEmail)}`;
      setInviteLink(link);
      queryClient.invalidateQueries({ queryKey: ["admin-users", orgId] });
      toast.success(`${t("app.admin.users.invitationCreatedFor")} ${inviteEmail}`);
    },
    onError: (e: Error) => {
      toast.error(e.message || t("app.admin.users.invitationCreateError"));
    },
  });

  const copyLink = () => {
    if (inviteLink) {
      navigator.clipboard.writeText(inviteLink);
      toast.success(t("app.admin.users.linkCopied"));
    }
  };

  const resetInviteDialog = () => {
    setInviteOpen(false);
    setInviteEmail("");
    setInviteRole("viewer");
    setInviteLink(null);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" /> {t("app.admin.users.title")}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t("app.admin.users.subtitle")}
          </p>
        </div>
        <Dialog open={inviteOpen} onOpenChange={(open) => { if (!open) resetInviteDialog(); else setInviteOpen(true); }}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="w-4 h-4 mr-1" /> {t("app.admin.users.inviteUser")}</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("app.admin.users.inviteUser")}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              {inviteLink ? (
                <>
                  <p className="text-sm text-muted-foreground">{t("app.admin.users.shareLink")}</p>
                  <div className="flex gap-2">
                    <Input value={inviteLink} readOnly className="text-xs font-mono" />
                    <Button variant="outline" size="icon" onClick={copyLink} title={t("app.admin.users.copyLink")}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1" onClick={resetInviteDialog}>{t("app.admin.common.close")}</Button>
                    <Button className="flex-1" onClick={() => { setInviteLink(null); setInviteEmail(""); }}>
                      <Plus className="w-4 h-4 mr-1" /> {t("app.admin.users.inviteAnother")}
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label>{t("app.admin.leads.email")}</Label>
                    <Input value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder={t("app.admin.users.emailPlaceholder")} />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("app.admin.users.role")}</Label>
                    <Select value={inviteRole} onValueChange={setInviteRole}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="viewer">{t("app.admin.users.roleViewer")}</SelectItem>
                        <SelectItem value="developer">{t("app.admin.users.roleDeveloper")}</SelectItem>
                        <SelectItem value="dpo">{t("app.admin.users.roleDpo")}</SelectItem>
                        <SelectItem value="admin">{t("app.admin.users.roleAdmin")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={() => inviteUser.mutate()} disabled={!inviteEmail || inviteUser.isPending} className="w-full">
                    {inviteUser.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Link className="w-4 h-4 mr-2" />}
                    {inviteUser.isPending ? t("app.admin.users.creating") : t("app.admin.users.generateLink")}
                  </Button>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
      ) : (
        <>
          <div className="border border-border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead>{t("app.admin.apiKeys.name")}</TableHead>
                  <TableHead>{t("app.admin.users.role")}</TableHead>
                  <TableHead>{t("app.admin.common.status")}</TableHead>
                  <TableHead>{t("app.admin.users.joined")}</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(() => { const { paged } = paginate(users ?? [], userPage, userPageSize); return paged; })().map((u) => (
                  <TableRow key={u.id} className="border-border">
                    <TableCell className="font-medium">{u.full_name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={roleBadgeColors[u.role] || ""}>
                        {u.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {u.is_active ? (
                        <span className="flex items-center gap-1 text-green-400 text-sm"><UserCheck className="w-3.5 h-3.5" /> {t("app.admin.common.active")}</span>
                      ) : (
                        <span className="flex items-center gap-1 text-muted-foreground text-sm"><UserX className="w-3.5 h-3.5" /> {t("app.admin.users.inactive")}</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(u.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {["admin", "dpo", "developer", "viewer"].map((role) => (
                            <DropdownMenuItem
                              key={role}
                              onClick={() => changeRole.mutate({ userId: u.id, newRole: role })}
                              disabled={u.role === role}
                            >
                              {t("app.admin.users.setAs")} {role}
                            </DropdownMenuItem>
                          ))}
                          <DropdownMenuItem
                            onClick={() => {
                              if (u.id === user?.id) {
                                toast.error(t("app.admin.users.cannotDeactivateSelf"));
                                return;
                              }
                              toggleActive.mutate({ userId: u.id, is_active: !u.is_active });
                            }}
                          >
                            {u.is_active ? t("app.admin.users.deactivate") : t("app.admin.users.activate")}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <PaginationControls page={userPage} totalPages={Math.max(1, Math.ceil((users?.length ?? 0) / userPageSize))} totalItems={users?.length ?? 0} pageSize={userPageSize} onPageChange={setUserPage} onPageSizeChange={setUserPageSize} />
        </>
      )}
    </div>
  );
};

export default AdminUsers;
