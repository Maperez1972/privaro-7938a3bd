import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface DashboardStats {
  totalRequests: number;
  piiDetected: number;
  piiProtected: number;
  piiLeaked: number;
  coveragePercent: number;
  avgLatencyMs: number;
  blockchainCertified: number;
}

export interface TimeSeriesPoint {
  date: string;
  requests: number;
  piiDetected: number;
  piiProtected: number;
}

export interface PiiCategoryPoint {
  name: string;
  value: number;
  color: string;
}

const categoryColors: Record<string, string> = {
  personal: "hsl(190, 100%, 50%)",
  financial: "hsl(38, 92%, 50%)",
  special: "hsl(0, 84%, 60%)",
  business: "hsl(217, 91%, 60%)",
};

export function useDashboardStats() {
  const { profile } = useAuth();
  const orgId = profile?.org_id;
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!orgId) return;
    const channel = supabase
      .channel("dashboard-pipelines-rt")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "pipelines", filter: `org_id=eq.${orgId}` },
        () => {
          queryClient.invalidateQueries({ queryKey: ["dashboard-stats", orgId] });
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [orgId, queryClient]);

  return useQuery({
    queryKey: ["dashboard-stats", orgId],
    enabled: !!orgId,
    refetchInterval: 30000,
    queryFn: async (): Promise<DashboardStats> => {
      const { data: pipelines } = await supabase
        .from("pipelines")
        .select("total_requests, total_pii_detected, total_pii_masked, total_leaked, avg_latency_ms")
        .eq("org_id", orgId!);

      const totals = (pipelines ?? []).reduce(
        (acc, p) => ({
          totalRequests: acc.totalRequests + Number(p.total_requests),
          piiDetected: acc.piiDetected + Number(p.total_pii_detected),
          piiProtected: acc.piiProtected + Number(p.total_pii_masked),
          piiLeaked: acc.piiLeaked + Number(p.total_leaked),
          latencySum: acc.latencySum + Number(p.avg_latency_ms),
          count: acc.count + 1,
        }),
        { totalRequests: 0, piiDetected: 0, piiProtected: 0, piiLeaked: 0, latencySum: 0, count: 0 }
      );

      const { count: totalLogs } = await supabase
        .from("audit_logs")
        .select("id", { count: "exact", head: true })
        .eq("org_id", orgId!);

      const { count: certifiedLogs } = await supabase
        .from("audit_logs")
        .select("id", { count: "exact", head: true })
        .eq("org_id", orgId!)
        .eq("ibs_status", "certified");

      const coverage = totals.piiDetected > 0
        ? +((totals.piiProtected / totals.piiDetected) * 100).toFixed(2)
        : 0;

      const blockchainCertified = (totalLogs ?? 0) > 0
        ? +(((certifiedLogs ?? 0) / (totalLogs ?? 1)) * 100).toFixed(1)
        : 0;

      return {
        totalRequests: totals.totalRequests,
        piiDetected: totals.piiDetected,
        piiProtected: totals.piiProtected,
        piiLeaked: totals.piiLeaked,
        coveragePercent: coverage,
        avgLatencyMs: totals.count > 0 ? Math.round(totals.latencySum / totals.count) : 0,
        blockchainCertified,
      };
    },
  });
}

export function useDashboardTimeSeries() {
  const { profile } = useAuth();
  const orgId = profile?.org_id;

  return useQuery({
    queryKey: ["dashboard-timeseries", orgId],
    enabled: !!orgId,
    refetchInterval: 30000,
    queryFn: async (): Promise<TimeSeriesPoint[]> => {
      const since = new Date();
      since.setDate(since.getDate() - 13);
      since.setHours(0, 0, 0, 0);

      const { data: logs } = await supabase
        .from("audit_logs")
        .select("created_at, event_type, action_taken")
        .eq("org_id", orgId!)
        .gte("created_at", since.toISOString())
        .order("created_at", { ascending: true });

      const dayMap = new Map<string, { requests: number; detected: number; protected: number }>();

      for (let i = 0; i < 14; i++) {
        const d = new Date();
        d.setDate(d.getDate() - (13 - i));
        const key = d.toLocaleDateString("en", { month: "short", day: "numeric" });
        dayMap.set(key, { requests: 0, detected: 0, protected: 0 });
      }

      for (const log of logs ?? []) {
        const key = new Date(log.created_at).toLocaleDateString("en", { month: "short", day: "numeric" });
        const entry = dayMap.get(key);
        if (entry) {
          entry.requests++;
          if (log.event_type === "pii_masked" || log.event_type === "pii_leaked") {
            entry.detected++;
          }
          if (log.action_taken !== "leaked") {
            entry.protected++;
          }
        }
      }

      return Array.from(dayMap.entries()).map(([date, v]) => ({
        date,
        requests: v.requests,
        piiDetected: v.detected,
        piiProtected: v.protected,
      }));
    },
  });
}

export function usePiiByCategory() {
  const { profile } = useAuth();
  const orgId = profile?.org_id;

  return useQuery({
    queryKey: ["dashboard-pii-category", orgId],
    enabled: !!orgId,
    refetchInterval: 30000,
    queryFn: async (): Promise<PiiCategoryPoint[]> => {
      const { data: logs } = await supabase
        .from("audit_logs")
        .select("entity_category")
        .eq("org_id", orgId!);

      const counts: Record<string, number> = {};
      for (const log of logs ?? []) {
        const cat = log.entity_category || "personal";
        counts[cat] = (counts[cat] || 0) + 1;
      }

      return Object.entries(counts)
        .map(([name, value]) => ({
          name: name.charAt(0).toUpperCase() + name.slice(1),
          value,
          color: categoryColors[name] ?? "hsl(215, 20%, 55%)",
        }))
        .sort((a, b) => b.value - a.value);
    },
  });
}

export function useCoverageOverTime() {
  const { profile } = useAuth();
  const orgId = profile?.org_id;

  return useQuery({
    queryKey: ["dashboard-coverage", orgId],
    enabled: !!orgId,
    refetchInterval: 30000,
    queryFn: async () => {
      const since = new Date();
      since.setDate(since.getDate() - 13);
      since.setHours(0, 0, 0, 0);

      const { data: logs } = await supabase
        .from("audit_logs")
        .select("created_at, action_taken, ibs_status")
        .eq("org_id", orgId!)
        .gte("created_at", since.toISOString())
        .order("created_at", { ascending: true });

      const dayMap = new Map<string, { total: number; protected: number; certified: number }>();

      for (let i = 0; i < 14; i++) {
        const d = new Date();
        d.setDate(d.getDate() - (13 - i));
        const key = d.toLocaleDateString("en", { month: "short", day: "numeric" });
        dayMap.set(key, { total: 0, protected: 0, certified: 0 });
      }

      for (const log of logs ?? []) {
        const key = new Date(log.created_at).toLocaleDateString("en", { month: "short", day: "numeric" });
        const entry = dayMap.get(key);
        if (entry) {
          entry.total++;
          if (log.action_taken !== "leaked") entry.protected++;
          if (log.ibs_status === "certified") entry.certified++;
        }
      }

      return Array.from(dayMap.entries()).map(([date, v]) => ({
        date,
        coverage: v.total > 0 ? +((v.protected / v.total) * 100).toFixed(1) : 100,
        certified: v.total > 0 ? +((v.certified / v.total) * 100).toFixed(1) : 100,
      }));
    },
  });
}

export function useRecentActivity() {
  const { profile } = useAuth();
  const orgId = profile?.org_id;

  return useQuery({
    queryKey: ["dashboard-recent", orgId],
    enabled: !!orgId,
    refetchInterval: 30000,
    queryFn: async () => {
      const { data } = await supabase
        .from("audit_logs")
        .select("id, event_type, entity_type, entity_category, action_taken, severity, pipeline_stage, ibs_status, processing_ms, created_at")
        .eq("org_id", orgId!)
        .order("created_at", { ascending: false })
        .limit(20);
      return data ?? [];
    },
  });
}
