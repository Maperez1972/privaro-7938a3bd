import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Download, Loader2, FileText, RefreshCw, History, ChevronDown, ChevronUp } from "lucide-react";
import { PaginationControls, paginate } from "@/components/app/PaginationControls";
import { formatDistanceToNow, format } from "date-fns";
import { useLanguage } from "@/context/LanguageContext";

const statusConfig = (report: any): { label: string; className: string; animate?: boolean } => {
  if (report.status === "ready" && report.contains_raw_data === false) {
    return { label: "app.reports.status.anonymized", className: "bg-amber-500/15 text-amber-400 border-amber-500/20" };
  }
  const map: Record<string, { label: string; className: string; animate?: boolean }> = {
    ready: { label: "app.reports.status.ready", className: "bg-green-500/15 text-green-400 border-green-500/20" },
    generating: { label: "app.reports.status.generating", className: "bg-amber-500/15 text-amber-400 border-amber-500/20", animate: true },
    failed: { label: "app.reports.status.failed", className: "bg-destructive/15 text-destructive border-destructive/20" },
    expired: { label: "app.reports.status.expired", className: "bg-muted text-muted-foreground border-border" },
  };
  return map[report.status] ?? map.failed;
};

const versionBadge = (v: any, t: (k: string) => string) => {
  if (v.is_latest) return <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">{t("app.reports.version.latest")}</Badge>;
  if (v.generation_type === "original") return <Badge variant="outline" className="text-xs bg-green-500/10 text-green-400 border-green-500/20">{t("app.reports.version.original")} ✅</Badge>;
  if (v.generation_type === "regenerated" && !v.contains_raw_data) return <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-400 border-amber-500/20">⚠ {t("app.reports.version.anonymized")}</Badge>;
  if (v.generation_type === "regenerated") return <Badge variant="outline" className="text-xs bg-muted text-muted-foreground border-border">{t("app.reports.version.regenerated")}</Badge>;
  return null;
};

const formatPeriod = (periodStart: string) => {
  try { return format(new Date(periodStart), "MMMM yyyy"); }
  catch { return periodStart; }
};

const formatSize = (bytes: number | null) => {
  if (!bytes) return "—";
  return `${(bytes / 1024).toFixed(0)} KB`;
};

/* ── History sub-row ── */
const HistorySubTable = ({ orgId, periodLabel, onDownload, downloadingId, t }: {
  orgId: string; periodLabel: string;
  onDownload: (r: any) => void; downloadingId: string | null; t: (k: string) => string;
}) => {
  const { data: versions, isLoading } = useQuery({
    queryKey: ["dpo-report-history", orgId, periodLabel],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("dpo_reports")
        .select("id, generation_type, contains_raw_data, generated_at, event_count, storage_path, is_latest")
        .eq("org_id", orgId)
        .eq("period_label", periodLabel)
        .order("generated_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  if (isLoading) return (
    <tr><td colSpan={10} className="p-4"><Skeleton className="h-8 w-full" /></td></tr>
  );

  if (!versions?.length) return (
    <tr><td colSpan={10} className="p-4 text-xs text-muted-foreground text-center">{t("app.reports.history.empty")}</td></tr>
  );

  return (
    <tr>
      <td colSpan={10} className="p-0">
        <div className="bg-secondary/20 border-y border-border/30 px-8 py-3">
          <p className="text-xs font-semibold text-muted-foreground mb-2">{t("app.reports.history.title")} — {periodLabel}</p>
          <table className="w-full text-xs">
            <thead>
              <tr className="text-muted-foreground">
                <th className="text-left pb-2 font-medium">{t("app.reports.history.col.type")}</th>
                <th className="text-left pb-2 font-medium">{t("app.reports.history.col.events")}</th>
                <th className="text-left pb-2 font-medium">{t("app.reports.history.col.generated")}</th>
                <th className="text-left pb-2 font-medium">{t("app.reports.history.col.status")}</th>
                <th className="text-left pb-2 font-medium">{t("app.reports.history.col.action")}</th>
              </tr>
            </thead>
            <tbody>
              {versions.map((v: any) => (
                <tr key={v.id} className="border-t border-border/20">
                  <td className="py-2 pr-4">{versionBadge(v, t)}</td>
                  <td className="py-2 pr-4 font-mono">{v.event_count ?? "—"}</td>
                  <td className="py-2 pr-4 text-muted-foreground">
                    {v.generated_at ? formatDistanceToNow(new Date(v.generated_at), { addSuffix: true }) : "—"}
                  </td>
                  <td className="py-2 pr-4">
                    {v.is_latest && <span className="text-primary font-semibold">● {t("app.reports.history.current")}</span>}
                  </td>
                  <td className="py-2">
                    {v.storage_path ? (
                      <Button size="sm" variant="ghost" className="gap-1 h-6 text-xs"
                        disabled={downloadingId === v.id} onClick={() => onDownload(v)}>
                        {downloadingId === v.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
                        {t("app.reports.button.download")}
                      </Button>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </td>
    </tr>
  );
};

/* ── Main component ── */
const ScheduledReports = () => {
  const { t } = useLanguage();
  const { profile } = useAuth();
  const orgId = profile?.org_id;
  const queryClient = useQueryClient();
  const [generating, setGenerating] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [expandedPeriod, setExpandedPeriod] = useState<string | null>(null);
  const [reportPage, setReportPage] = useState(0);
  const [reportPageSize, setReportPageSize] = useState(10);

  const { data: reports, isLoading } = useQuery({
    queryKey: ["dpo-reports", orgId],
    enabled: !!orgId,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("dpo_reports")
        .select("id, period_label, period_start, period_end, status, event_count, certified_count, high_risk_count, file_size_bytes, generated_at, storage_path, contains_raw_data, logs_anonymized_at, is_latest")
        .eq("org_id", orgId!)
        .order("period_start", { ascending: false })
        .limit(24);
      if (error) throw error;
      return data ?? [];
    },
  });

  const handleGenerate = async () => {
    if (!orgId) return;
    setGenerating(true);
    try {
      const today = new Date().toISOString().split("T")[0];
      const firstDay = today.slice(0, 7) + "-01";
      const { data, error } = await supabase.functions.invoke("generate-dpo-report", {
        body: { org_id: orgId, period_start: firstDay, period_end: today, force_regenerate: true },
      });
      if (error) {
        console.error("generate-dpo-report error:", error);
        throw error;
      }
      console.log("generate-dpo-report response:", data);
      toast.success(t("app.reports.toast.generating"));
      setTimeout(() => queryClient.invalidateQueries({ queryKey: ["dpo-reports"] }), 4000);
    } catch {
      toast.error(t("app.reports.toast.generateFailed"));
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = async (report: any) => {
    if (!report.storage_path) return;
    setDownloadingId(report.id);
    try {
      const { data, error } = await supabase.storage.from("dpo-reports").download(report.storage_path);
      if (error) throw error;
      const blob = data;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const filename = report.storage_path.split("/").pop() || "dpo-report.html";
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      toast.error(t("app.reports.toast.downloadFailed"));
    } finally {
      setDownloadingId(null);
    }
  };

  const toggleHistory = (periodLabel: string) => {
    setExpandedPeriod((prev) => (prev === periodLabel ? null : periodLabel));
  };

  if (isLoading) {
    return (
      <Card className="border-border bg-card">
        <CardContent className="p-4 space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex gap-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">{t("app.reports.title")}</h2>
          <p className="text-xs text-muted-foreground">{t("app.reports.subtitle")}</p>
        </div>
        <Button size="sm" variant="outline" className="gap-2" onClick={handleGenerate} disabled={generating}>
          {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          {t("app.reports.button.generateNow")}
        </Button>
      </div>

      <Card className="border-border bg-card">
        <CardContent className="p-0">
          {!reports?.length ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <FileText className="w-12 h-12 text-muted-foreground/20 mb-4" />
              <p className="text-sm font-medium text-muted-foreground">{t("app.reports.empty.title")}</p>
              <p className="text-xs text-muted-foreground/60 mt-1 max-w-[340px]">
                {t("app.reports.empty.desc")}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-muted-foreground border-b border-border">
                    <th className="p-4 font-medium">{t("app.reports.col.period")}</th>
                    <th className="p-4 font-medium">{t("app.reports.col.events")}</th>
                    <th className="p-4 font-medium">{t("app.reports.col.certified")}</th>
                    <th className="p-4 font-medium">{t("app.reports.col.highRisk")}</th>
                    <th className="p-4 font-medium">{t("app.reports.col.size")}</th>
                    <th className="p-4 font-medium">{t("app.reports.col.generated")}</th>
                    <th className="p-4 font-medium">{t("app.reports.col.status")}</th>
                    <th className="p-4 font-medium">{t("app.reports.col.anonymized")}</th>
                    <th className="p-4 font-medium">{t("app.reports.col.action")}</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => { const { paged } = paginate(reports, reportPage, reportPageSize); return paged; })().map((report: any) => {
                    const st = statusConfig(report);
                    const isExpanded = expandedPeriod === report.period_label;
                    return (
                      <>
                        <tr key={report.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                          <td className="p-4 font-medium text-sm">{formatPeriod(report.period_start)}</td>
                          <td className="p-4 text-sm font-mono">{report.event_count ?? "—"}</td>
                          <td className="p-4">
                            {report.certified_count != null ? (
                              <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-400">⛓️ {report.certified_count}</span>
                            ) : "—"}
                          </td>
                          <td className="p-4">
                            {report.high_risk_count != null && report.high_risk_count > 0 ? (
                              <Badge variant="destructive" className="text-xs">{report.high_risk_count}</Badge>
                            ) : (
                              <span className="text-xs text-muted-foreground">{report.high_risk_count ?? "—"}</span>
                            )}
                          </td>
                          <td className="p-4 text-xs text-muted-foreground font-mono">{formatSize(report.file_size_bytes)}</td>
                          <td className="p-4 text-xs text-muted-foreground">
                            {report.generated_at ? formatDistanceToNow(new Date(report.generated_at), { addSuffix: true }) : "—"}
                          </td>
                          <td className="p-4">
                            <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${st.className} ${st.animate ? "animate-pulse" : ""}`}>
                              {t(st.label)}
                            </span>
                          </td>
                          <td className="p-4 text-xs text-muted-foreground">
                            {report.logs_anonymized_at ? formatDistanceToNow(new Date(report.logs_anonymized_at), { addSuffix: true }) : "—"}
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-1">
                              {report.status === "ready" && report.storage_path ? (
                                <Button size="sm" variant="ghost" className="gap-1 h-7 text-xs"
                                  disabled={downloadingId === report.id} onClick={() => handleDownload(report)}>
                                  {downloadingId === report.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
                                  {t("app.reports.button.download")}
                                </Button>
                              ) : null}
                              {report.is_latest && (
                                <Button size="sm" variant="ghost" className="gap-1 h-7 text-xs"
                                  onClick={() => toggleHistory(report.period_label)}>
                                  {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                  <History className="w-3 h-3" />
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                        {isExpanded && orgId && (
                          <HistorySubTable
                            key={`history-${report.period_label}`}
                            orgId={orgId}
                            periodLabel={report.period_label}
                            onDownload={handleDownload}
                            downloadingId={downloadingId}
                            t={t}
                          />
                        )}
                      </>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
      {reports?.length ? <PaginationControls page={reportPage} totalPages={Math.max(1, Math.ceil(reports.length / reportPageSize))} totalItems={reports.length} pageSize={reportPageSize} onPageChange={setReportPage} onPageSizeChange={setReportPageSize} /> : null}
    </div>
  );
};

export default ScheduledReports;
