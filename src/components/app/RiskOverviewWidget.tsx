import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { AlertTriangle, ShieldAlert } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

const RISK_COLORS = {
  high: "#EF4444",
  medium: "#F59E0B",
  low: "#10B981",
  none: "#64748B",
};

const chartTooltipStyle = {
  contentStyle: {
    backgroundColor: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    fontSize: "12px",
    color: "#1e293b",
  },
  itemStyle: {
    color: "#334155",
  },
};

interface RiskDistribution {
  name: string;
  value: number;
  color: string;
}

interface TopRiskEvent {
  id: string;
  entity_type: string;
  risk_score: number;
  created_at: string;
  pipeline_name: string;
}

export function useRiskOverview() {
  const { profile } = useAuth();
  const orgId = profile?.org_id;

  const distribution = useQuery({
    queryKey: ["risk-distribution", orgId],
    enabled: !!orgId,
    refetchInterval: 30000,
    queryFn: async (): Promise<RiskDistribution[]> => {
      const { data: logs } = await (supabase
        .from("audit_logs")
        .select("risk_score") as any)
        .eq("org_id", orgId!);

      let high = 0, medium = 0, low = 0, none = 0;
      for (const log of logs ?? []) {
        if (log.risk_score == null) none++;
        else if (log.risk_score >= 0.7) high++;
        else if (log.risk_score >= 0.4) medium++;
        else low++;
      }

      return [
        { name: "High Risk", value: high, color: RISK_COLORS.high },
        { name: "Medium", value: medium, color: RISK_COLORS.medium },
        { name: "Low", value: low, color: RISK_COLORS.low },
        { name: "No Score", value: none, color: RISK_COLORS.none },
      ].filter((d) => d.value > 0);
    },
  });

  const topRisk = useQuery({
    queryKey: ["top-risk-events", orgId],
    enabled: !!orgId,
    refetchInterval: 30000,
    queryFn: async (): Promise<TopRiskEvent[]> => {
      const { data } = await (supabase
        .from("audit_logs")
        .select("id, entity_type, risk_score, created_at, pipelines(name)") as any)
        .eq("org_id", orgId!)
        .gte("risk_score", 0.7)
        .order("created_at", { ascending: false })
        .limit(5);

      return (data ?? []).map((row: any) => ({
        id: row.id,
        entity_type: row.entity_type,
        risk_score: row.risk_score,
        created_at: row.created_at,
        pipeline_name: row.pipelines?.name || "—",
      }));
    },
  });

  return { distribution, topRisk };
}

export const RiskOverviewWidget = () => {
  const { distribution, topRisk } = useRiskOverview();
  const navigate = useNavigate();

  return (
    <div className="grid lg:grid-cols-2 gap-4">
      {/* Donut Chart */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Risk Distribution</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          {distribution.isLoading ? (
            <div className="space-y-3 py-2">
              <Skeleton className="w-full h-[200px]" />
            </div>
          ) : (distribution.data?.length ?? 0) === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ShieldAlert className="w-8 h-8 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">No risk data yet</p>
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={distribution.data}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {(distribution.data ?? []).map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip {...chartTooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 mt-2 w-full">
                {(distribution.data ?? []).map((d) => (
                  <div key={d.name} className="flex items-center gap-2 text-xs">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
                    <span className="text-muted-foreground truncate">{d.name}</span>
                    <span className="ml-auto font-medium">{d.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Top Risk Events */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Top Risk Events</CardTitle>
        </CardHeader>
        <CardContent>
          {topRisk.isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : (topRisk.data?.length ?? 0) === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertTriangle className="w-8 h-8 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">No high-risk events</p>
            </div>
          ) : (
            <div className="space-y-2">
              {(topRisk.data ?? []).map((evt) => (
                <button
                  key={evt.id}
                  onClick={() => navigate("/app/audit-logs")}
                  className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-secondary/50 transition-colors text-left"
                >
                  <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="w-4 h-4 text-destructive" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono bg-secondary px-1.5 py-0.5 rounded">{evt.entity_type}</span>
                      <span className="text-xs text-muted-foreground truncate">· {evt.pipeline_name}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatDistanceToNow(new Date(evt.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold bg-destructive/15 text-destructive flex-shrink-0">
                    {(evt.risk_score * 100).toFixed(0)}%
                  </span>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
