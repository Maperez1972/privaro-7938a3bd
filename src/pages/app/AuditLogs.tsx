import React, { useState, useEffect } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Download, Loader2, ExternalLink, FileText, ChevronDown, CalendarClock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { generateDpoReportHtml, downloadHtml } from "@/lib/dpo-report";
import { AuditLogDetail } from "@/components/app/AuditLogDetail";
import { PaginationControls } from "@/components/app/PaginationControls";
import ScheduledReports from "@/components/app/ScheduledReports";
import { useLanguage } from "@/context/LanguageContext";

const DEFAULT_pageSize = 15;

const SEVERITY_OPTIONS = ["all", "critical", "high", "medium", "low"] as const;
const IBS_STATUS_OPTIONS = ["all", "pending", "certified", "failed"] as const;
const RISK_OPTION_VALUES = ["all", "high", "medium", "low", "none"] as const;
const SORT_OPTION_VALUES = ["desc", "asc"] as const;

const AuditLogs = () => {
  const { t } = useLanguage();
  const { profile } = useAuth();
  const orgId = profile?.org_id;

  const [search, setSearch] = useState("");
  const [severity, setSeverity] = useState<string>("all");
  const [ibsStatus, setIbsStatus] = useState<string>("all");
  const [riskFilter, setRiskFilter] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_pageSize);

  const { data, isLoading } = useQuery({
    queryKey: ["audit-logs", orgId, search, severity, ibsStatus, riskFilter, sortOrder, page],
    enabled: !!orgId,
    queryFn: async () => {
      let query = (supabase
        .from("audit_logs")
        .select(
          "id, event_type, entity_type, entity_category, action_taken, severity, pipeline_stage, ibs_status, ibs_evidence_id, ibs_certification_hash, ibs_network, ibs_certified_at, processing_ms, created_at, pipeline_id, pipelines(name, sector, llm_provider), organizations(name, gdpr_dpo_email)",
          { count: "exact" }
        ) as any)
        .eq("org_id", orgId!)
        .order("created_at", { ascending: sortOrder === "asc" })
        .range(page * pageSize, (page + 1) * pageSize - 1);

      if (severity !== "all") {
        query = query.eq("severity", severity);
      }
      if (ibsStatus !== "all") {
        query = query.eq("ibs_status", ibsStatus);
      }
      if (riskFilter === "high") {
        query = query.gte("risk_score", 0.7);
      } else if (riskFilter === "medium") {
        query = query.gte("risk_score", 0.4).lt("risk_score", 0.7);
      } else if (riskFilter === "low") {
        query = query.lt("risk_score", 0.4).not("risk_score", "is", null);
      } else if (riskFilter === "none") {
        query = query.is("risk_score", null);
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
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  // Reset page when filters change
  const resetPage = () => setPage(0);

  const [exporting, setExporting] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [reportFrom, setReportFrom] = useState(() => {
    const d = new Date();
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d.toISOString().slice(0, 10);
  });
  const [reportTo, setReportTo] = useState(() => {
    return new Date().toISOString().slice(0, 10);
  });

  const handleExport = async () => {
    if (!orgId) return;
    setExporting(true);
    try {
      let query = (supabase
        .from("audit_logs")
        .select("id, created_at, event_type, entity_type, entity_category, action_taken, severity, pipeline_stage, ibs_status, ibs_evidence_id, ibs_certification_hash, ibs_network, ibs_certified_at, processing_ms, pipelines(name, sector, llm_provider)") as any)
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
      if (!rows?.length) { toast.info(t("app.audit.toast.noExport")); return; }

      const headers = ["id", "timestamp", "event_type", "entity_type", "entity_category", "action_taken", "severity", "risk_score", "pipeline_name", "sector", "llm_provider", "pipeline_stage", "processing_ms", "ibs_status", "ibs_evidence_id", "ibs_certification_hash", "ibs_network", "ibs_certified_at", "blockchain_checker_url"];
      const csv = [headers.join(","), ...rows.map((row: any) => {
        const pipeline = row.pipelines as any;
        const values: Record<string, unknown> = {
          id: row.id,
          timestamp: row.created_at,
          event_type: row.event_type,
          entity_type: row.entity_type,
          entity_category: row.entity_category,
          action_taken: row.action_taken,
          severity: row.severity,
          risk_score: (row as any).risk_score ?? "",
          pipeline_name: pipeline?.name || "",
          sector: pipeline?.sector || "",
          llm_provider: pipeline?.llm_provider || "",
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
      a.download = `privaro-audit-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`${t("app.audit.toast.exported")} ${rows.length}`);
    } catch {
      toast.error(t("app.audit.toast.exportFailed"));
    } finally {
      setExporting(false);
    }
  };

  const handleDpoReport = async () => {
    if (!orgId) return;
    setGeneratingReport(true);
    try {
      let query = (supabase
        .from("audit_logs")
        .select("id, created_at, event_type, entity_type, entity_category, action_taken, severity, pipeline_stage, ibs_status, ibs_evidence_id, ibs_certification_hash, ibs_network, ibs_certified_at, processing_ms, pipelines(name, sector, llm_provider), organizations(name, gdpr_dpo_email)") as any)
        .eq("org_id", orgId)
        .order("created_at", { ascending: false })
        .limit(10000);

      if (severity !== "all") query = query.eq("severity", severity);
      if (ibsStatus !== "all") query = query.eq("ibs_status", ibsStatus);
      if (search.trim()) {
        const s = search.trim().toLowerCase();
        query = query.or(`entity_type.ilike.%${s}%,event_type.ilike.%${s}%,action_taken.ilike.%${s}%`);
      }

      // Filter by selected period
      const fromDate = new Date(reportFrom);
      fromDate.setHours(0, 0, 0, 0);
      const toDate = new Date(reportTo);
      toDate.setHours(23, 59, 59, 999);
      query = query
        .gte("created_at", fromDate.toISOString())
        .lte("created_at", toDate.toISOString());

      const { data: rows, error } = await query;
      if (error) throw error;
      if (!rows?.length) { toast.info(t("app.audit.toast.noReport")); return; }

      const org = (rows[0] as any).organizations;
      const html = generateDpoReportHtml({
        logs: rows as any,
        orgName: org?.name || "Unknown",
        dpoEmail: org?.gdpr_dpo_email || "",
      });

      downloadHtml(html, `privaro-dpo-report-${reportFrom}-to-${reportTo}.html`);
      toast.success(t("app.audit.toast.reportDownloaded"));
    } catch {
      toast.error(t("app.audit.toast.reportFailed"));
    } finally {
      setGeneratingReport(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("app.audit.title")}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t("app.audit.subtitle")}
          </p>
        </div>
      </div>

      <Tabs defaultValue="logs" className="space-y-4">
        <TabsList>
          <TabsTrigger value="logs" className="gap-2"><FileText className="w-4 h-4" /> {t("app.audit.tab.eventLog")}</TabsTrigger>
          <TabsTrigger value="reports" className="gap-2"><CalendarClock className="w-4 h-4" /> {t("app.audit.tab.scheduledReports")}</TabsTrigger>
        </TabsList>

        <TabsContent value="logs" className="space-y-4">
          <div className="flex flex-wrap items-center justify-end gap-2">
            <div className="flex items-center gap-2">
              <Input
                type="date"
                value={reportFrom}
                onChange={(e) => setReportFrom(e.target.value)}
                className="w-36 text-xs"
              />
              <span className="text-muted-foreground text-xs">→</span>
              <Input
                type="date"
                value={reportTo}
                onChange={(e) => setReportTo(e.target.value)}
                className="w-36 text-xs"
              />
              <Button
                size="sm"
                variant="outline"
                className="gap-2"
                onClick={handleDpoReport}
                disabled={generatingReport}
              >
                {generatingReport ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                {t("app.audit.button.dpoReport")}
              </Button>
            </div>
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
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder={t("app.audit.filter.severity")} />
          </SelectTrigger>
          <SelectContent>
            {SEVERITY_OPTIONS.map((s) => (
              <SelectItem key={s} value={s}>
                {s === "all" ? t("app.audit.filter.allSeverities") : s.charAt(0).toUpperCase() + s.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={ibsStatus} onValueChange={(v) => { setIbsStatus(v); resetPage(); }}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder={t("app.audit.filter.blockchain")} />
          </SelectTrigger>
          <SelectContent>
            {IBS_STATUS_OPTIONS.map((s) => (
              <SelectItem key={s} value={s}>
                {s === "all" ? t("app.audit.filter.allStatuses") : s.charAt(0).toUpperCase() + s.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={riskFilter} onValueChange={(v) => { setRiskFilter(v); resetPage(); }}>
          <SelectTrigger className="w-[170px]">
            <SelectValue placeholder={t("app.audit.filter.riskScore")} />
          </SelectTrigger>
          <SelectContent>
            {RISK_OPTION_VALUES.map((v) => (
              <SelectItem key={v} value={v}>{t(`app.audit.risk.${v}`)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sortOrder} onValueChange={(v) => { setSortOrder(v as "asc" | "desc"); resetPage(); }}>
          <SelectTrigger className="w-[150px]">
            <SelectValue />
          </SelectTrigger>
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
              <FileText className="w-12 h-12 text-muted-foreground/20 mb-4" />
              <p className="text-sm font-medium text-muted-foreground">{t("app.audit.empty.title")}</p>
              <p className="text-xs text-muted-foreground/60 mt-1 max-w-[300px]">
                {search || severity !== "all" || ibsStatus !== "all"
                  ? t("app.audit.empty.filtered")
                  : t("app.audit.empty.noFilter")}
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
                    <th className="p-4 font-medium">{t("app.audit.col.stage")}</th>
                    <th className="p-4 font-medium">{t("app.audit.col.blockchain")}</th>
                    <th className="p-4 font-medium">{t("app.audit.col.latency")}</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
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
                        <td className="p-4 text-xs">{log.action_taken}</td>
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
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <PaginationControls page={page} totalPages={totalPages} totalItems={total} pageSize={pageSize} onPageChange={setPage} onPageSizeChange={setPageSize} />
        </TabsContent>

        <TabsContent value="reports">
          <ScheduledReports />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AuditLogs;
