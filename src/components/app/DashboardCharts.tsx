import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { FlaskConical } from "lucide-react";
import type { TimeSeriesPoint, PiiCategoryPoint } from "@/hooks/useDashboardData";
import { useLanguage } from "@/context/LanguageContext";

const chartTooltipStyle = { contentStyle: { backgroundColor: "hsl(222, 40%, 9%)", border: "1px solid hsl(222, 20%, 18%)", borderRadius: "8px", fontSize: "12px", color: "hsl(210, 40%, 96%)" }, itemStyle: { color: "hsl(210, 40%, 96%)" } };
const axisProps = { fontSize: 11, fill: "hsl(215, 20%, 55%)" };
const gridStroke = "hsl(222, 20%, 18%)";

const ChartSkeleton = ({ height = 260 }: { height?: number }) => (<div className="space-y-3 py-2"><div className="flex gap-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-3 w-10" />)}</div><Skeleton className="w-full" style={{ height }} /></div>);
const EmptyChartState = ({ message }: { message: string }) => {
  const { t } = useLanguage();
  return (<div className="flex flex-col items-center justify-center py-12 text-center"><FlaskConical className="w-8 h-8 text-muted-foreground/30 mb-3" /><p className="text-sm text-muted-foreground">{message}</p><p className="text-xs text-muted-foreground/60 mt-1">{t("app.dashboard.chart.useSandbox")}</p></div>);
};

export const RequestsChart = ({ data, isLoading }: { data: TimeSeriesPoint[]; isLoading?: boolean }) => {
  const { t } = useLanguage();
  const hasData = data.some((d) => d.requests > 0);
  return (<Card className="border-border bg-card lg:col-span-2"><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">{t("app.dashboard.chart.requestsPii")}</CardTitle></CardHeader><CardContent>{isLoading ? <ChartSkeleton /> : !hasData ? <EmptyChartState message={t("app.dashboard.chart.noRequests14d")} /> : (<ResponsiveContainer width="100%" height={260}><AreaChart data={data}><defs><linearGradient id="gradRequests" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="hsl(190, 100%, 50%)" stopOpacity={0.3} /><stop offset="100%" stopColor="hsl(190, 100%, 50%)" stopOpacity={0} /></linearGradient><linearGradient id="gradPii" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="hsl(38, 92%, 50%)" stopOpacity={0.3} /><stop offset="100%" stopColor="hsl(38, 92%, 50%)" stopOpacity={0} /></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke={gridStroke} /><XAxis dataKey="date" tick={axisProps} axisLine={false} tickLine={false} /><YAxis tick={axisProps} axisLine={false} tickLine={false} /><Tooltip {...chartTooltipStyle} /><Legend wrapperStyle={{ fontSize: "11px", color: "hsl(215, 20%, 55%)" }} /><Area type="monotone" dataKey="requests" name={t("app.dashboard.chart.requests")} stroke="hsl(190, 100%, 50%)" fill="url(#gradRequests)" strokeWidth={2} /><Area type="monotone" dataKey="piiDetected" name={t("app.dashboard.chart.piiDetected")} stroke="hsl(38, 92%, 50%)" fill="url(#gradPii)" strokeWidth={2} /><Area type="monotone" dataKey="piiProtected" name={t("app.dashboard.chart.piiProtected")} stroke="hsl(160, 84%, 39%)" fill="transparent" strokeWidth={1.5} strokeDasharray="4 2" /></AreaChart></ResponsiveContainer>)}</CardContent></Card>);
};

export const PiiCategoryChart = ({ data, isLoading }: { data: PiiCategoryPoint[]; isLoading?: boolean }) => {
  const { t } = useLanguage();
  return (<Card className="border-border bg-card"><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">{t("app.dashboard.chart.piiByCategory")}</CardTitle></CardHeader><CardContent className="flex flex-col items-center">{isLoading ? <ChartSkeleton height={180} /> : data.length === 0 ? <EmptyChartState message={t("app.dashboard.chart.noPiiYet")} /> : (<><ResponsiveContainer width="100%" height={180}><PieChart><Pie data={data} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value" stroke="none">{data.map((entry, i) => <Cell key={i} fill={entry.color} />)}</Pie><Tooltip {...chartTooltipStyle} /></PieChart></ResponsiveContainer><div className="grid grid-cols-2 gap-x-6 gap-y-1.5 mt-2 w-full">{data.map((cat) => (<div key={cat.name} className="flex items-center gap-2 text-xs"><span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} /><span className="text-muted-foreground truncate">{cat.name}</span><span className="ml-auto font-medium">{cat.value.toLocaleString()}</span></div>))}</div></>)}</CardContent></Card>);
};

export const CoverageChart = ({ data, isLoading }: { data: { date: string; coverage: number; certified: number }[]; isLoading?: boolean }) => {
  const { t } = useLanguage();
  return (<Card className="border-border bg-card"><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">{t("app.dashboard.chart.coverageCertification")}</CardTitle></CardHeader><CardContent>{isLoading ? <ChartSkeleton height={220} /> : (<ResponsiveContainer width="100%" height={220}><LineChart data={data}><CartesianGrid strokeDasharray="3 3" stroke={gridStroke} /><XAxis dataKey="date" tick={axisProps} axisLine={false} tickLine={false} /><YAxis domain={[0, 100]} tick={axisProps} axisLine={false} tickLine={false} unit="%" /><Tooltip {...chartTooltipStyle} formatter={(v: number) => `${v}%`} /><Legend wrapperStyle={{ fontSize: "11px", color: "hsl(215, 20%, 55%)" }} /><Line type="monotone" dataKey="coverage" name={t("app.dashboard.chart.piiCoverage")} stroke="hsl(160, 84%, 39%)" strokeWidth={2} dot={false} /><Line type="monotone" dataKey="certified" name={t("app.dashboard.chart.blockchainCertified")} stroke="hsl(190, 100%, 50%)" strokeWidth={2} dot={false} strokeDasharray="6 3" /></LineChart></ResponsiveContainer>)}</CardContent></Card>);
};
