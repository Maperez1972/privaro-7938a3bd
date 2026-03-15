import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";

const AdminUsers = () => {
  const { profile } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile?.org_id) return;
    supabase.from("profiles").select("id, full_name, org_id, created_at").eq("org_id", profile.org_id)
      .then(async ({ data: profiles }) => {
        if (!profiles) { setLoading(false); return; }
        const { data: roles } = await supabase.from("user_roles").select("user_id, role");
        const rolesMap: Record<string, string[]> = {};
        roles?.forEach(r => { (rolesMap[r.user_id] ||= []).push(r.role); });
        setUsers(profiles.map(p => ({ ...p, roles: rolesMap[p.id] || [] })));
        setLoading(false);
      });
  }, [profile?.org_id]);

  if (loading) return <div className="p-8 text-muted-foreground">Loading users...</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Users className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Users</h1>
      </div>
      <div className="border rounded-lg overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Roles</TableHead>
              <TableHead>Joined</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map(u => (
              <TableRow key={u.id}>
                <TableCell className="font-medium">{u.full_name || "—"}</TableCell>
                <TableCell>
                  <div className="flex gap-1">{u.roles.map((r: string) => <Badge key={r} variant="outline">{r}</Badge>)}</div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AdminUsers;
