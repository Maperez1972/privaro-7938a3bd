import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Download, Loader2, FileText, RefreshCw } from "lucide-react";
import { formatDistanceToNow, format, startOfMonth } from "date-fns";

const statusConfig: Record<string, { label: string; className: string; animate?: boolean }> = {
  ready: { label: "Ready", className: "bg-green-500/15 text-green-400 border-green-500/20" },
  generating: { label: "Generating...", className: "bg-amber-500/15 text-amber-400 border-amber-500/20", animate: true },
  failed: { label: "Failed", className: "bg-destructive/15 text-destructive border-destructive/20" },
};

const ScheduledReports = () => {
  const { profile } = useAuth();
  const orgId = profile?.org_id;
  const queryClient = useQueryClient();
  const [generating, setGenerating] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const { data: reports, isLoading } = useQuery({
    queryKey: ["dpo-reports", orgId],
    enabled: !!orgId,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("dpo_reports")
        .select("id, period_label, period_start, period_end, status, event_count, certified_count, high_risk_count, file_size_bytes, generated_at, storage_path")
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
      const now = new Date();
      const periodStart = startOfMonth(now).toISOString().slice(0, 10);
      const periodEnd = now.toISOString().slice(0, 10);

      const { error } = await supabase.functions.invoke("generate-dpo-report", {
        body: { org_id: orgId, period_start: periodStart, period_end: periodEnd, force_regenerate: true },
      });
      if (error) throw error;

      toast.success("Generating report...");
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["dpo-reports"] });
      }, 3000);
    } catch {
      toast.error("Failed to trigger report generation");
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = async (report: any) => {
    if (!report.storage_path) return;
    setDownloadingId(report.id);
    try {
      const { data, error } = await supabase.storage
        .from("dpo-reports")
        .createSignedUrl(report.storage_path, 3600);
      if (error) throw error;
      window.open(data.signedUrl, "_blank");
    } catch {
      toast.error("Failed to get download link");
    } finally {
      setDownloadingId(null);
    }
  };

  const formatPeriod = (periodStart: string) => {
    try {
      return format(new Date(periodStart), "MMMM yyyy");
    } catch {
      return periodStart;
    }
  };

  const formatSize = (bytes: number | null) => {
    if (!bytes) return "—";
    return `${(bytes / 1024).toFixed(0)} KB`;
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
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-20" />
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
          <h2 className="text-lg font-semibold">Scheduled Reports</h2>
          <p className="text-xs text-muted-foreground">Monthly DPO compliance reports, auto-generated on the 1st</p>
        </div>
        <Button size="sm" variant="outline" className="gap-2" onClick={handleGenerate} disabled={generating}>
          {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          Generate Now
        </Button>
      </div>

      <Card className="border-border bg-card">
        <CardContent className="p-0">
          {!reports?.length ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <FileText className="w-12 h-12 text-muted-foreground/20 mb-4" />
              <p className="text-sm font-medium text-muted-foreground">No scheduled reports yet</p>
              <p className="text-xs text-muted-foreground/60 mt-1 max-w-[340px]">
                Reports are generated automatically on the 1st of each month.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-muted-foreground border-b border-border">
                    <th className="p-4 font-medium">Period</th>
                    <th className="p-4 font-medium">Events</th>
                    <th className="p-4 font-medium">Certified</th>
                    <th className="p-4 font-medium">High Risk</th>
                    <th className="p-4 font-medium">Size</th>
                    <th className="p-4 font-medium">Generated</th>
                    <th className="p-4 font-medium">Status</th>
                    <th className="p-4 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((report: any) => {
                    const st = statusConfig[report.status] ?? statusConfig.failed;
                    return (
                      <tr key={report.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                        <td className="p-4 font-medium text-sm">{formatPeriod(report.period_start)}</td>
                        <td className="p-4 text-sm font-mono">{report.event_count ?? "—"}</td>
                        <td className="p-4">
                          {report.certified_count != null ? (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-400">
                              ⛓️ {report.certified_count}
                            </span>
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
                          {report.generated_at
                            ? formatDistanceToNow(new Date(report.generated_at), { addSuffix: true })
                            : "—"}
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${st.className} ${st.animate ? "animate-pulse" : ""}`}>
                            {st.label}
                          </span>
                        </td>
                        <td className="p-4">
                          {report.status === "ready" ? (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="gap-1 h-7 text-xs"
                              disabled={downloadingId === report.id}
                              onClick={() => handleDownload(report)}
                            >
                              {downloadingId === report.id ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <Download className="w-3 h-3" />
                              )}
                              Download
                            </Button>
                          ) : null}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ScheduledReports;
