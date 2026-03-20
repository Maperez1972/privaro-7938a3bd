import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { StatusBadge, SeverityBadge } from "@/components/app/StatusBadge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Download, ChevronLeft, ChevronRight, Loader2, ExternalLink } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText } from "lucide-react";
import { toast } from "sonner";

const PAGE_SIZE = 25;

const SEVERITY_OPTIONS = ["all", "critical", "high", "medium", "low"] as const;
const IBS_STATUS_OPTIONS = ["all", "pending", "certified", "failed"] as const;
const SORT_OPTIONS = [
  { value: "desc", label: "Newest first" },
  { value: "asc", label: "Oldest first" },
];

const AuditLogs = () => {
  const { profile } = useAuth();
  const orgId = profile?.org_id;

  const [search, setSearch] = useState("");
  const [severity, setSeverity] = useState<string>("all");
  const [ibsStatus, setIbsStatus] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(0);

  const { data, isLoading } = useQuery({
    queryKey: ["audit-logs", orgId, search, severity, ibsStatus, sortOrder, page],
    enabled: !!orgId,
    queryFn: async () => {
      let query = supabase
        .from("audit_logs")
        .select(
          "id, event_type, entity_type, entity_category, action_taken, severity, pipeline_stage, ibs_status, ibs_certification_hash, ibs_network, processing_ms, created_at",
          { count: "exact" }
        )
        .eq("org_id", orgId!)
        .order("created_at", { ascending: sortOrder === "asc" })
        .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

      if (severity !== "all") {
        query = query.eq("severity", severity);
      }
      if (ibsStatus !== "all") {
        query = query.eq("ibs_status", ibsStatus);
      }
      if (search.trim()) {
        const s = search.trim().toLowerCase();
        query = query.or(
          `entity_type.ilike.%${s}%,event_type.ilike.%${s}%,action_taken.ilike.%${s}%`
        );
      }

      const { data: rows, count, error } = await query;
      if (error) throw error;
      return { rows: rows ?? [], total: count ?? 0 };
    },
  });

  // Realtime: auto-refresh when new logs arrive or iBS status changes
  const queryClient = useQueryClient();
  useEffect(() => {
    if (!orgId) return;
    const channel = supabase
      .channel("audit-logs-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "audit_logs", filter: `org_id=eq.${orgId}` },
        () => {
          queryClient.invalidateQueries({ queryKey: ["audit-logs"] });
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [orgId, queryClient]);

  const logs = data?.rows ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // Reset page when filters change
  const resetPage = () => setPage(0);

  const [exporting, setExporting] = useState(false);
  const handleExport = async () => {
    if (!orgId) return;
    setExporting(true);
    try {
      let query = supabase
        .from("audit_logs")
        .select("id, created_at, event_type, entity_type, entity_category, action_taken, severity, pipeline_stage, ibs_status, ibs_evidence_id, ibs_certification_hash, ibs_network, ibs_certified_at, processing_ms")
        .eq("org_id", orgId)
        .order("created_at", { ascending: false })
        .limit(10000);

      if (severity !== "all") query = query.eq("severity", severity);
      if (ibsStatus !== "all") query = query.eq("ibs_status", ibsStatus);
      if (search.trim()) {
        const s = search.trim().toLowerCase();
        query = query.or(`entity_type.ilike.%${s}%,event_type.ilike.%${s}%,action_taken.ilike.%${s}%`);
      }

      const { data: rows, error } = await query;
      if (error) throw error;
      if (!rows?.length) { toast.info("No logs to export"); return; }

      const headers = ["id", "created_at", "event_type", "entity_type", "entity_category", "action_taken", "severity", "pipeline_stage", "ibs_status", "ibs_evidence_id", "ibs_certification_hash", "ibs_network", "ibs_certified_at", "processing_ms"];
      const csv = [headers.join(","), ...rows.map((row) =>
        headers.map((h) => JSON.stringify((row as Record<string, unknown>)[h] ?? "")).join(",")
      )].join("\n");

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `privaro-audit-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`Exported ${rows.length} logs`);
    } catch {
      toast.error("Export failed");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Audit Logs</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Immutable record of every PII event — blockchain certified
          </p>
        </div>
        <Button size="sm" variant="outline" className="gap-2" onClick={handleExport} disabled={exporting}>
          {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search entity, event, action..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); resetPage(); }}
            className="pl-9"
          />
        </div>
        <Select value={severity} onValueChange={(v) => { setSeverity(v); resetPage(); }}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Severity" />
          </SelectTrigger>
          <SelectContent>
            {SEVERITY_OPTIONS.map((s) => (
              <SelectItem key={s} value={s}>
                {s === "all" ? "All severities" : s.charAt(0).toUpperCase() + s.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={ibsStatus} onValueChange={(v) => { setIbsStatus(v); resetPage(); }}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Blockchain" />
          </SelectTrigger>
          <SelectContent>
            {IBS_STATUS_OPTIONS.map((s) => (
              <SelectItem key={s} value={s}>
                {s === "all" ? "All statuses" : s.charAt(0).toUpperCase() + s.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sortOrder} onValueChange={(v) => { setSortOrder(v as "asc" | "desc"); resetPage(); }}>
          <SelectTrigger className="w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card className="border-border bg-card">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-3 p-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex gap-4">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-14" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-12" />
                </div>
              ))}
            </div>
          ) : logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <FileText className="w-12 h-12 text-muted-foreground/20 mb-4" />
              <p className="text-sm font-medium text-muted-foreground">No audit logs found</p>
              <p className="text-xs text-muted-foreground/60 mt-1 max-w-[300px]">
                {search || severity !== "all" || ibsStatus !== "all"
                  ? "Try adjusting your filters to see more results."
                  : "Go to the PII Sandbox to detect and protect sensitive data — events will appear here automatically."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-muted-foreground border-b border-border">
                    <th className="p-4 font-medium">Time</th>
                    <th className="p-4 font-medium">Event</th>
                    <th className="p-4 font-medium">Entity</th>
                    <th className="p-4 font-medium">Category</th>
                    <th className="p-4 font-medium">Action</th>
                    <th className="p-4 font-medium">Severity</th>
                    <th className="p-4 font-medium">Stage</th>
                    <th className="p-4 font-medium">Blockchain</th>
                    <th className="p-4 font-medium">Latency</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                      <td className="p-4 text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                      <td className="p-4 font-mono text-xs">{log.event_type}</td>
                      <td className="p-4">
                        <span className="text-xs bg-secondary px-2 py-0.5 rounded font-mono">{log.entity_type}</span>
                      </td>
                      <td className="p-4 text-xs capitalize">{log.entity_category}</td>
                      <td className="p-4 text-xs">{log.action_taken}</td>
                      <td className="p-4"><SeverityBadge severity={log.severity} /></td>
                      <td className="p-4 text-xs text-muted-foreground">{log.pipeline_stage}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <StatusBadge status={log.ibs_status} />
                          {log.ibs_status === "certified" && log.ibs_certification_hash && (
                            <a
                              href={`https://checker.icommunitylabs.com/check/${log.ibs_network || "fantom_opera_mainnet"}/${log.ibs_certification_hash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                            >
                              <ExternalLink className="w-3 h-3" />
                              verify
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-xs font-mono">{log.processing_ms}ms</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {total > PAGE_SIZE && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, total)} of {total}
          </p>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" disabled={page === 0} onClick={() => setPage(page - 1)}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm flex items-center px-2">
              {page + 1} / {totalPages}
            </span>
            <Button size="sm" variant="outline" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditLogs;
