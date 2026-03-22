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
import { Users, Plus, MoreHorizontal, Loader2, UserCheck, UserX } from "lucide-react";
import { toast } from "sonner";
import { PaginationControls, paginate } from "@/components/app/PaginationControls";

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
  const orgId = profile?.org_id;
  const queryClient = useQueryClient();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [userPage, setUserPage] = useState(0);
  const [userPageSize, setUserPageSize] = useState(10);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("viewer");

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
      const { error } = await supabase.from("user_roles").insert({
        user_id: userId,
        org_id: orgId!,
        role: newRole as "admin" | "dpo" | "developer" | "viewer",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users", orgId] });
      toast.success("Role updated");
    },
    onError: () => toast.error("Failed to update role"),
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
      toast.success("User status updated");
    },
    onError: () => toast.error("Failed to update user"),
  });

  const inviteUser = useMutation({
    mutationFn: async () => {
      if (!orgId || !inviteEmail) throw new Error("Missing data");

      const { data, error } = await supabase.functions.invoke("invite-user", {
        body: {
          email: inviteEmail,
          role: inviteRole,
          full_name: inviteEmail.split("@")[0],
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users", orgId] });
      toast.success(`Invitación enviada a ${inviteEmail}. Recibirá un email para acceder.`);
      setInviteOpen(false);
      setInviteEmail("");
      setInviteRole("viewer");
    },
    onError: (e: Error) => {
      if (e.message?.includes("ya está registrado") || e.message?.includes("already registered")) {
        toast.error("Este email ya está registrado");
      } else {
        toast.error(e.message || "Error al invitar usuario");
      }
    },
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" /> User Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage users, roles, and permissions
          </p>
        </div>
        <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="w-4 h-4 mr-1" /> Invite User</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite User</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="user@company.com" />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={inviteRole} onValueChange={setInviteRole}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="viewer">Viewer</SelectItem>
                    <SelectItem value="developer">Developer</SelectItem>
                    <SelectItem value="dpo">DPO</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={() => inviteUser.mutate()} disabled={!inviteEmail || inviteUser.isPending} className="w-full">
                {inviteUser.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {inviteUser.isPending ? "Sending…" : "Send Invitation"}
              </Button>
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
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
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
                        <span className="flex items-center gap-1 text-green-400 text-sm"><UserCheck className="w-3.5 h-3.5" /> Active</span>
                      ) : (
                        <span className="flex items-center gap-1 text-muted-foreground text-sm"><UserX className="w-3.5 h-3.5" /> Inactive</span>
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
                              Set as {role}
                            </DropdownMenuItem>
                          ))}
                          <DropdownMenuItem
                            onClick={() => {
                              if (u.id === user?.id) {
                                toast.error("You cannot deactivate yourself");
                                return;
                              }
                              toggleActive.mutate({ userId: u.id, is_active: !u.is_active });
                            }}
                          >
                            {u.is_active ? "Deactivate" : "Activate"}
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
