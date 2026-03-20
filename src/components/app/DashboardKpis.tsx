import { Shield, Activity, AlertTriangle, Link2, Zap, TrendingUp, Info, Gauge, ShieldAlert } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { DashboardStats } from "@/hooks/useDashboardData";

interface Props { stats: DashboardStats | undefined; isLoading: boolean; }

const kpiDefs = [
  { key: "totalRequests" as const, label: "Total Requests", icon: Activity, color: "text-primary", format: (v: number) => v.toLocaleString(), tooltip: "Total API requests processed across all active pipelines." },
  { key: "piiDetected" as const, label: "PII Detected", icon: Shield, color: "text-warning", format: (v: number) => v.toLocaleString(), tooltip: "Total PII entities detected." },
  { key: "coveragePercent" as const, label: "Coverage", icon: TrendingUp, color: "text-success", format: (v: number) => `${v}%`, tooltip: "Percentage of detected PII that was successfully protected." },
  { key: "piiLeaked" as const, label: "Incidents", icon: AlertTriangle, color: "text-destructive", format: (v: number) => v.toLocaleString(), tooltip: "PII entities that leaked to the LLM provider." },
  { key: "avgLatencyMs" as const, label: "Avg Latency", icon: Zap, color: "text-primary", format: (v: number) => `${v}ms`, tooltip: "Average processing latency." },
  { key: "blockchainCertified" as const, label: "Blockchain Certified", icon: Link2, color: "text-success", format: (v: number) => `${v}%`, tooltip: "Percentage of audit logs certified on iBS blockchain." },
  { key: "avgRiskScore" as const, label: "Avg Risk", icon: Gauge, color: "text-warning", format: (v: number) => `${(v * 100).toFixed(0)}%`, tooltip: "Average risk score across all evaluated events." },
  { key: "highRiskEvents" as const, label: "High Risk", icon: ShieldAlert, color: "text-destructive", format: (v: number) => v.toLocaleString(), tooltip: "Events with risk score ≥ 70%." },
];

const KpiSkeleton = () => (<Card className="border-border bg-card"><CardContent className="p-4"><div className="flex items-center gap-2 mb-3"><Skeleton className="w-4 h-4 rounded" /><Skeleton className="h-3 w-20" /></div><Skeleton className="h-8 w-16" /></CardContent></Card>);

export const DashboardKpis = ({ stats, isLoading }: Props) => (
  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
    {isLoading ? Array.from({ length: 8 }).map((_, i) => <KpiSkeleton key={i} />) : kpiDefs.map((kpi) => {
      const Icon = kpi.icon;
      return (<Card key={kpi.key} className="border-border bg-card"><CardContent className="p-4"><div className="flex items-center gap-2 mb-2"><Icon className={`w-4 h-4 ${kpi.color}`} /><span className="text-xs text-muted-foreground">{kpi.label}</span><Tooltip><TooltipTrigger asChild><Info className="w-3 h-3 text-muted-foreground/50 cursor-help" /></TooltipTrigger><TooltipContent side="top" className="max-w-[200px] text-xs">{kpi.tooltip}</TooltipContent></Tooltip></div><p className="text-2xl font-bold">{stats ? kpi.format(stats[kpi.key]) : "0"}</p></CardContent></Card>);
    })}
  </div>
);
