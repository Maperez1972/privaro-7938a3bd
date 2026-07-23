import { Shield, Activity, AlertTriangle, Link2, Zap, TrendingUp, Info, Gauge, ShieldAlert } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { DashboardStats } from "@/hooks/useDashboardData";
import { useLanguage } from "@/context/LanguageContext";

interface Props { stats: DashboardStats | undefined; isLoading: boolean; }

const kpiDefs = [
  { key: "totalRequests" as const, labelKey: "app.dashboard.kpi.totalRequests", icon: Activity, color: "text-primary", format: (v: number) => v.toLocaleString(), tooltipKey: "app.dashboard.kpi.totalRequests.tooltip" },
  { key: "piiDetected" as const, labelKey: "app.dashboard.kpi.piiDetected", icon: Shield, color: "text-warning", format: (v: number) => v.toLocaleString(), tooltipKey: "app.dashboard.kpi.piiDetected.tooltip" },
  { key: "coveragePercent" as const, labelKey: "app.dashboard.kpi.coverage", icon: TrendingUp, color: "text-success", format: (v: number) => `${v}%`, tooltipKey: "app.dashboard.kpi.coverage.tooltip" },
  { key: "piiLeaked" as const, labelKey: "app.dashboard.kpi.incidents", icon: AlertTriangle, color: "text-destructive", format: (v: number) => v.toLocaleString(), tooltipKey: "app.dashboard.kpi.incidents.tooltip" },
  { key: "avgLatencyMs" as const, labelKey: "app.dashboard.kpi.avgLatency", icon: Zap, color: "text-primary", format: (v: number) => `${v}ms`, tooltipKey: "app.dashboard.kpi.avgLatency.tooltip" },
  { key: "blockchainCertified" as const, labelKey: "app.dashboard.kpi.blockchainCertified", icon: Link2, color: "text-success", format: (v: number) => `${v}%`, tooltipKey: "app.dashboard.kpi.blockchainCertified.tooltip" },
  { key: "avgRiskScore" as const, labelKey: "app.dashboard.kpi.avgRisk", icon: Gauge, color: "text-warning", format: (v: number) => `${(v * 100).toFixed(0)}%`, tooltipKey: "app.dashboard.kpi.avgRisk.tooltip" },
  { key: "highRiskEvents" as const, labelKey: "app.dashboard.kpi.highRisk", icon: ShieldAlert, color: "text-destructive", format: (v: number) => v.toLocaleString(), tooltipKey: "app.dashboard.kpi.highRisk.tooltip" },
];

const KpiSkeleton = () => (<Card className="border-border bg-card"><CardContent className="p-4"><div className="flex items-center gap-2 mb-3"><Skeleton className="w-4 h-4 rounded" /><Skeleton className="h-3 w-20" /></div><Skeleton className="h-8 w-16" /></CardContent></Card>);

export const DashboardKpis = ({ stats, isLoading }: Props) => {
  const { t } = useLanguage();
  return (
  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
    {isLoading ? Array.from({ length: 8 }).map((_, i) => <KpiSkeleton key={i} />) : kpiDefs.map((kpi) => {
      const Icon = kpi.icon;
      return (<Card key={kpi.key} className="border-border bg-card"><CardContent className="p-4"><div className="flex items-center gap-2 mb-2"><Icon className={`w-4 h-4 ${kpi.color}`} /><span className="text-xs text-muted-foreground">{t(kpi.labelKey)}</span><Tooltip><TooltipTrigger asChild><Info className="w-3 h-3 text-muted-foreground/50 cursor-help" /></TooltipTrigger><TooltipContent side="top" className="max-w-[200px] text-xs">{t(kpi.tooltipKey)}</TooltipContent></Tooltip></div><p className="text-2xl font-bold">{stats ? kpi.format(stats[kpi.key]) : "0"}</p></CardContent></Card>);
    })}
  </div>
  );
};
