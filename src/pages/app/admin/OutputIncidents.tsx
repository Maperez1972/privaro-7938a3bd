import React, { useEffect, useMemo, useState } from "react";
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
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Search, Download, Loader2, ExternalLink, AlertTriangle, ChevronDown, ShieldCheck, Radio, Info } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { AuditLogDetail } from "@/components/app/AuditLogDetail";
import { PaginationControls } from "@/components/app/PaginationControls";
import { useLanguage } from "@/context/LanguageContext";

const DEFAULT_PAGE_SIZE = 15;

const SEVERITY_OPTIONS = ["all", "critical", "high", "medium", "low"] as const;
const IBS_STATUS_OPTIONS = ["all", "pending", "certified", "failed"] as const;
const RISK_OPTION_VALUES = ["all", "high", "medium", "low", "none"] as const;
const SORT_OPTION_VALUES = ["desc", "asc"] as const;
const CHANNEL_OPTIONS = ["all", "streaming", "masked"] as const;

const STREAMING_STAGES = ["relay_stream_output"];
const MASKED_STAGES = ["relay_output", "proxy_output", "agent_output"];

const PROTECTED_ACTIONS = ["tokenised", "tokenized", "anonymised", "anonymized", "blocked"];

const isStreamingStage = (stage?: string | null) =>
  !!stage && (STREAMING_STAGES.includes(stage) || stage.includes("stream"));

const SELECT_COLUMNS =
  "id, event_type, entity_type, entity_category, action_taken, severity, pipeline_stage, ibs_status, ibs_evidence_id, ibs_certification_hash, ibs_network, ibs_certified_at, processing_ms, created_at, risk_score, pipeline_id, pipelines(name, sector, llm_provider, output_scanning_mode)";

const OutputIncidents = () => {
  const { t } = useLanguage();
  const { profile } = useAuth();
  const orgId = profile?.org_id;

  const [search, setSearch] = useState("");
  const [severity, setSeverity] = useState<string>("all");
  const [ibsStatus, setIbsStatus] = useState<string>("all");
  const [riskFilter, setRiskFilter] = useState<string>("all");
  const [channel, setChannel] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  const applyFilters = (query: any) => {
    let q = query;
    if (severity !== "all") q = q.eq("severity", severity);
    if (ibsStatus !== "all") q = q.eq("ibs_status", ibsStatus);
    if (channel === "streaming") q = q.in("pipeline_stage", STREAMING_STAGES);
    if (channel === "masked") q = q.in("pipeline_stage", MASKED_STAGES);
    if (riskFilter === "high") q = q.gte("risk_score", 0.7);
    else if (riskFilter === "medium") q = q.gte("risk_score", 0.4).lt("risk_score", 0.7);
    else if (riskFilter === "low") q = q.lt("risk_score", 0.4).not("risk_score", "is", null);
    else if (riskFilter === "none") q = q.is("risk_score", null);
    if (search.trim()) {
      const s = search.trim().toLowerCase();
      q = q.or(`entity_type.ilike.%${s}%,event_type.ilike.%${s}%,action_taken.ilike.%${s}%`);
    }
    return q;
  };

  const { data, isLoading } = useQuery({
    queryKey: ["audit-logs-output", orgId, search, severity, ibsStatus, riskFilter, channel, sortOrder, page, pageSize],
    enabled: !!orgId,
    queryFn: async () => {
      let query = (supabase
        .from("audit_logs")
        .select(SELECT_COLUMNS, { count: "exact" }) as any)
        .eq("org_id", orgId!)
        .eq("direction", "output")
        .order("created_at", { ascending: sortOrder === "asc" })
        .range(page * pageSize, (page + 1) * pageSize - 1);
      query = applyFilters(query);
      const { data: rows, count, error } = await query;
      if (error) throw error;
      return { rows: (rows ?? []) as any[], total: count ?? 0 };
    },
  });

  // Stats over the whole filtered set (not just current page)
  const { data: statsRows } = useQuery({
    queryKey: ["audit-logs-output-stats", orgId, search, severity, ibsStatus, riskFilter, channel],
    enabled: !!orgId,
    queryFn: async () => {
      let query = (supabase
        .from("audit_logs")
        .select("action_taken, pipeline_stage") as any)
        .eq("org_id", orgId!)
        .eq("direction", "output")
        .limit(10000);
      query = applyFilters(query);
      const { data: rows, error } = await query;
      if (error) throw error;
      return (rows ?? []) as { action_taken: string | null; pipeline_stage: string | null }[];
    },
  });

  const stats = useMemo(() => {
    const rows = statsRows ?? [];
    const byStage: Record<string, number> = {};
    let leaked = 0;
    let protectedCount = 0;
    for (const r of rows) {
      const stage = r.pipeline_stage || "—";
      byStage[stage] = (byStage[stage] ?? 0) + 1;
      const action = (r.action_taken || "").toLowerCase();
      if (action === "leaked") leaked++;
      if (PROTECTED_ACTIONS.includes(action)) protectedCount++;
    }
    return {
      total: rows.length,
      leaked,
      protected: protectedCount,
      byStage: Object.entries(byStage).sort((a, b) => b[1] - a[1]),
    };
  }, [statsRows]);

  const queryClient = useQueryClient();
  useEffect(() => {
    if (!orgId) return;
    const channelSub = supabase
      .channel("audit-logs-output-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "audit_logs", filter: `org_id=eq.${orgId}` },
        () => {
          queryClient.invalidateQueries({ queryKey: ["audit-logs-output"] });
          queryClient.invalidateQueries({ queryKey: ["audit-logs-output-stats"] });
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channelSub); };
  }, [orgId, queryClient]);

  const logs = data?.rows ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const resetPage = () => setPage(0);

  const handleExport = async () => {
    if (!orgId) return;
    setExporting(true);
    try {
      let query = (supabase
        .from("audit_logs")
        .select(SELECT_COLUMNS) as any)
        .eq("org_id", orgId)
        .eq("direction", "output")
        .order("created_at", { ascending: false })
        .limit(10000);
      query = applyFilters(query);

      const { data: rows, error } = await query;
      if (error) throw error;
      if (!rows?.length) { toast.info(t("app.audit.toast.noExport")); return; }

      const headers = ["id", "timestamp", "direction", "event_type", "entity_type", "entity_category", "action_taken", "severity", "risk_score", "pipeline_name", "sector", "llm_provider", "output_scanning_mode", "pipeline_stage", "processing_ms", "ibs_status", "ibs_evidence_id", "ibs_certification_hash", "ibs_network", "ibs_certified_at", "blockchain_checker_url"];
      const csv = [headers.join(","), ...rows.map((row: any) => {
        const pipeline = row.pipelines as any;
        const values: Record<string, unknown> = {
          id: row.id,
          timestamp: row.created_at,
          direction: "output",
          event_type: row.event_type,
          entity_type: row.entity_type,
          entity_category: row.entity_category,
          action_taken: row.action_taken,
          severity: row.severity,
          risk_score: row.risk_score ?? "",
          pipeline_name: pipeline?.name || "",
          sector: pipeline?.sector || "",
          llm_provider: pipeline?.llm_provider || "",
          output_scanning_mode: pipeline?.output_scanning_mode || "",
          pipeline_stage: row.pipeline_stage || "",
          processing_ms: row.processing_ms,
          ibs_status: row.ibs_status,
          ibs_evidence_id: row.ibs_evidence_id || "",
          ibs_certification_hash: row.ibs_certification_hash || "",
          ibs_network: row.ibs_network || "",
          ibs_certified_at: row.ibs_certified_at || "",
          blockchain_checker_url: row.ibs_certification_hash
            ? `https://checker.icommunitylabs.com/check/${row.ibs_network || "fantom_opera_mainnet"}/${row.ibs_certification_hash}`
            : "",
        };
        return headers.map((h) => JSON.stringify(values[h] ?? "")).join(",");
      })].join("\n");

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `privaro-output-incidents-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`${t("app.audit.toast.exported")} ${rows.length}`);
    } catch {
      toast.error(t("app.audit.toast.exportFailed"));
    } finally {
      setExporting(false);
    }
  };

  const statCard = (
    key: string,
    label: string,
    value: React.ReactNode,
    icon: React.ReactNode,
    tooltip?: string,
    valueClass?: string
  ) => (
    <Card key={key} className="border-border bg-card">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {icon}
          <span>{label}</span>
          {tooltip && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button type="button" className="text-muted-foreground/70 hover:text-foreground">
                  <Info className="w-3 h-3" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="max-w-[260px] text-xs">{tooltip}</TooltipContent>
            </Tooltip>
          )}
        </div>
        <div className={`mt-2 text-2xl font-bold ${valueClass ?? ""}`}>{value}</div>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("app.outputIncidents.title")}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t("app.outputIncidents.subtitle")}</p>
      </div>

      {/* Stat cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {statCard("total", t("app.outputIncidents.stat.total"), stats.total, <AlertTriangle className="w-3.5 h-3.5" />, t("app.outputIncidents.stat.total.tooltip"))}
        {statCard("leaked", t("app.outputIncidents.stat.leaked"), stats.leaked, <AlertTriangle className="w-3.5 h-3.5 text-destructive" />, t("app.outputIncidents.stat.leaked.tooltip"), "text-destructive")}
        {statCard("protected", t("app.outputIncidents.stat.protected"), stats.protected, <ShieldCheck className="w-3.5 h-3.5 text-green-400" />, t("app.outputIncidents.stat.protected.tooltip"), "text-green-400")}
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Radio className="w-3.5 h-3.5" />
              <span>{t("app.outputIncidents.stat.byChannel")}</span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button type="button" className="text-muted-foreground/70 hover:text-foreground">
                    <Info className="w-3 h-3" />
                  </button>
                </TooltipTrigger>
                <TooltipContent className="max-w-[260px] text-xs">{t("app.outputIncidents.stat.byChannel.tooltip")}</TooltipContent>
              </Tooltip>
            </div>
            <div className="mt-2 space-y-1">
              {stats.byStage.length === 0 ? (
                <span className="text-sm text-muted-foreground">—</span>
              ) : (
                stats.byStage.slice(0, 4).map(([stage, count]) => (
                  <div key={stage} className="flex items-center justify-between text-xs">
                    <span className="font-mono text-muted-foreground truncate">{stage}</span>
                    <span className="font-semibold">{count}</span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2">
        <Button size="sm" variant="outline" className="gap-2" onClick={handleExport} disabled={exporting}>
          {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          {t("app.audit.button.exportCsv")}
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={t("app.audit.search.placeholder")}
            value={search}
            onChange={(e) => { setSearch(e.target.value); resetPage(); }}
            className="pl-9"
          />
        </div>
        <Select value={severity} onValueChange={(v) => { setSeverity(v); resetPage(); }}>
          <SelectTrigger className="w-[150px]"><SelectValue placeholder={t("app.audit.filter.severity")} /></SelectTrigger>
          <SelectContent>
            {SEVERITY_OPTIONS.map((s) => (
              <SelectItem key={s} value={s}>{s === "all" ? t("app.audit.filter.allSeverities") : s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={channel} onValueChange={(v) => { setChannel(v); resetPage(); }}>
          <SelectTrigger className="w-[210px]"><SelectValue placeholder={t("app.outputIncidents.filter.channel")} /></SelectTrigger>
          <SelectContent>
            {CHANNEL_OPTIONS.map((v) => (
              <SelectItem key={v} value={v}>{t(`app.outputIncidents.channel.${v}`)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={ibsStatus} onValueChange={(v) => { setIbsStatus(v); resetPage(); }}>
          <SelectTrigger className="w-[150px]"><SelectValue placeholder={t("app.audit.filter.blockchain")} /></SelectTrigger>
          <SelectContent>
            {IBS_STATUS_OPTIONS.map((s) => (
              <SelectItem key={s} value={s}>{s === "all" ? t("app.audit.filter.allStatuses") : s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={riskFilter} onValueChange={(v) => { setRiskFilter(v); resetPage(); }}>
          <SelectTrigger className="w-[170px]"><SelectValue placeholder={t("app.audit.filter.riskScore")} /></SelectTrigger>
          <SelectContent>
            {RISK_OPTION_VALUES.map((v) => (
              <SelectItem key={v} value={v}>{t(`app.audit.risk.${v}`)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sortOrder} onValueChange={(v) => { setSortOrder(v as "asc" | "desc"); resetPage(); }}>
          <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            {SORT_OPTION_VALUES.map((v) => (
              <SelectItem key={v} value={v}>{t(`app.audit.sort.${v}`)}</SelectItem>
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
              <AlertTriangle className="w-12 h-12 text-muted-foreground/20 mb-4" />
              <p className="text-sm font-medium text-muted-foreground">{t("app.outputIncidents.empty.title")}</p>
              <p className="text-xs text-muted-foreground/60 mt-1 max-w-[320px]">
                {search || severity !== "all" || ibsStatus !== "all" || channel !== "all"
                  ? t("app.audit.empty.filtered")
                  : t("app.outputIncidents.empty.noFilter")}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-muted-foreground border-b border-border">
                    <th className="p-4 font-medium">{t("app.audit.col.time")}</th>
                    <th className="p-4 font-medium">{t("app.audit.col.event")}</th>
                    <th className="p-4 font-medium">{t("app.audit.col.entity")}</th>
                    <th className="p-4 font-medium">{t("app.audit.col.category")}</th>
                    <th className="p-4 font-medium">{t("app.audit.col.action")}</th>
                    <th className="p-4 font-medium">{t("app.audit.col.severity")}</th>
                    <th className="p-4 font-medium">{t("app.audit.col.riskScore")}</th>
                    <th className="p-4 font-medium">{t("app.outputIncidents.col.channel")}</th>
                    <th className="p-4 font-medium">{t("app.audit.col.blockchain")}</th>
                    <th className="p-4 font-medium">{t("app.audit.col.latency")}</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log: any) => {
                    const action = (log.action_taken || "").toLowerCase();
                    const streaming = isStreamingStage(log.pipeline_stage);
                    return (
                      <React.Fragment key={log.id}>
                        <tr
                          className="border-b border-border/50 hover:bg-secondary/30 transition-colors cursor-pointer"
                          onClick={() => setExpandedLogId(expandedLogId === log.id ? null : log.id)}
                        >
                          <td className="p-4 text-xs text-muted-foreground whitespace-nowrap">
                            <div className="flex items-center gap-1">
                              <ChevronDown className={`w-3 h-3 transition-transform ${expandedLogId === log.id ? "rotate-180" : ""}`} />
                              {new Date(log.created_at).toLocaleString()}
                            </div>
                          </td>
                          <td className="p-4 font-mono text-xs">{log.event_type}</td>
                          <td className="p-4">
                            <span className="text-xs bg-secondary px-2 py-0.5 rounded font-mono">{log.entity_type}</span>
                          </td>
                          <td className="p-4 text-xs capitalize">{log.entity_category}</td>
                          <td className="p-4 text-xs">
                            {action === "leaked" && streaming ? (
                              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border bg-warning/15 text-warning border-warning/30">
                                <AlertTriangle className="w-3 h-3" />
                                {t("app.outputIncidents.badge.notInterceptable")}
                              </span>
                            ) : action === "leaked" ? (
                              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border bg-destructive/15 text-destructive border-destructive/30">
                                <AlertTriangle className="w-3 h-3" />
                                {t("app.outputIncidents.badge.leaked")}
                              </span>
                            ) : (
                              log.action_taken
                            )}
                          </td>
                          <td className="p-4"><SeverityBadge severity={log.severity} /></td>
                          <td className="p-4">
                            {log.risk_score != null ? (
                              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                                log.risk_score >= 0.7 ? "bg-destructive/15 text-destructive" :
                                log.risk_score >= 0.4 ? "bg-amber-500/15 text-amber-400" :
                                "bg-green-500/15 text-green-400"
                              }`}>
                                {log.risk_score >= 0.7 ? t("app.audit.risk.highLabel") : log.risk_score >= 0.4 ? t("app.audit.risk.mediumLabel") : t("app.audit.risk.lowLabel")} ({(log.risk_score * 100).toFixed(0)}%)
                              </span>
                            ) : (
                              <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold bg-muted text-muted-foreground">—</span>
                            )}
                          </td>
                          <td className="p-4 text-xs text-muted-foreground font-mono">{log.pipeline_stage}</td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <StatusBadge status={log.ibs_status} />
                              {log.ibs_status === "certified" && log.ibs_certification_hash && (
                                <a
                                  href={`https://checker.icommunitylabs.com/check/${log.ibs_network || "fantom_opera_mainnet"}/${log.ibs_certification_hash}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <ExternalLink className="w-3 h-3" />
                                  {t("app.audit.verify")}
                                </a>
                              )}
                            </div>
                          </td>
                          <td className="p-4 text-xs font-mono">{log.processing_ms}ms</td>
                        </tr>
                        {expandedLogId === log.id && (
                          <tr>
                            <td colSpan={10} className="p-0">
                              <AuditLogDetail logId={log.id} riskScore={log.risk_score ?? null} />
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <PaginationControls page={page} totalPages={totalPages} totalItems={total} pageSize={pageSize} onPageChange={setPage} onPageSizeChange={setPageSize} />
    </div>
  );
};

export default OutputIncidents;
