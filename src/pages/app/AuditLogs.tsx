import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScrollText } from "lucide-react";

const AuditLogs = () => {
  const { profile } = useAuth();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile?.org_id) return;
    supabase.from("audit_logs").select("*").eq("org_id", profile.org_id).order("created_at", { ascending: false }).limit(100)
      .then(({ data }) => { setLogs(data || []); setLoading(false); });
  }, [profile?.org_id]);

  if (loading) return <div className="p-8 text-muted-foreground">Loading audit logs...</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <ScrollText className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Audit Logs</h1>
      </div>
      <div className="border rounded-lg overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.length === 0 ? (
              <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground py-12">No audit logs found.</TableCell></TableRow>
            ) : logs.map(log => (
              <TableRow key={log.id}>
                <TableCell className="text-sm">{new Date(log.created_at).toLocaleString()}</TableCell>
                <TableCell><Badge variant="outline">{log.action}</Badge></TableCell>
                <TableCell className="text-sm text-muted-foreground max-w-md truncate">{log.details ? JSON.stringify(log.details) : "—"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AuditLogs;
