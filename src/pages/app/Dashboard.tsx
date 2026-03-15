import { DashboardKpis } from "@/components/app/DashboardKpis";
import { RequestsChart, PiiCategoryChart, CoverageChart } from "@/components/app/DashboardCharts";
import { RecentActivityTable } from "@/components/app/RecentActivityTable";
import { useDashboardStats, useDashboardTimeSeries, usePiiByCategory, useCoverageOverTime, useRecentActivity } from "@/hooks/useDashboardData";

const Dashboard = () => {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: timeSeries, isLoading: tsLoading } = useDashboardTimeSeries();
  const { data: piiCategories, isLoading: catLoading } = usePiiByCategory();
  const { data: coverage, isLoading: covLoading } = useCoverageOverTime();
  const { data: recentLogs, isLoading: logsLoading } = useRecentActivity();

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Real-time privacy operations overview</p>
      </div>
      <DashboardKpis stats={stats} isLoading={statsLoading} />
      <div className="grid lg:grid-cols-3 gap-4">
        <RequestsChart data={timeSeries ?? []} isLoading={tsLoading} />
        <PiiCategoryChart data={piiCategories ?? []} isLoading={catLoading} />
      </div>
      <CoverageChart data={coverage ?? []} isLoading={covLoading} />
      <RecentActivityTable logs={recentLogs ?? []} isLoading={logsLoading} />
    </div>
  );
};

export default Dashboard;
