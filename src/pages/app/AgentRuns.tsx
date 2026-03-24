import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/app/StatusBadge";
import { PaginationControls, paginate } from "@/components/app/PaginationControls";
import { Bot, ShieldCheck, ShieldAlert, Activity, Clock, AlertTriangle, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import AgentRunDetail from "@/components/app/agent-runs/AgentRunDetail";
import { supabase } from "@/integrations/supabase/client";
import AgentRunsFilters, { EMPTY_FILTERS, type AgentRunFilters } from "@/components/app/agent-runs/AgentRunsFilters";

type AgentRun = {
  id: string;
  agent_name: string;
  pipeline_name: string;
  sector_preset: string;
  status: "running" | "completed" | "failed" | "aborted";
  total_steps: number;
  pii_detected: number;
  pii_masked: number;
  pii_leaked: number;
  risk_score: number;
  ibs_status: string;
  ibs_evidence_id: string | null;
  ibs_certification_hash: string | null;
  started_at: string;
  ended_at: string | null;
  duration_ms: number;
};

function useAgentRuns() {
  const [runs, setRuns] = useState<AgentRun[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRuns() {
      const { data, error } = await (supabase as any)
        .from("agent_runs")
        .select(`
          id,
          agent_name,
          status,
          step_count,
          total_pii_detected,
          total_pii_masked,
          max_risk_score,
          ibs_status,
          ibs_evidence_id,
          ibs_certification_hash,
          started_at,
          ended_at,
          pipelines ( name, sector )
        `)
        .order("started_at", { ascending: false })
        .limit(100);

      if (!error && data) {
        setRuns(
          data.map((r: any) => ({
            id: r.id,
            agent_name: r.agent_name ?? "unnamed",
            pipeline_name: r.pipelines?.name ?? "—",
            sector_preset: r.pipelines?.sector ?? "general",
            status: (r.status ?? "completed") as AgentRun["status"],
            total_steps: r.step_count ?? 0,
            pii_detected: r.total_pii_detected ?? 0,
            pii_masked: r.total_pii_masked ?? 0,
            pii_leaked: (r.total_pii_detected ?? 0) - (r.total_pii_masked ?? 0),
            risk_score: r.max_risk_score ?? 0,
            ibs_status: r.ibs_status ?? "pending",
            ibs_evidence_id: r.ibs_evidence_id ?? null,
            ibs_certification_hash: r.ibs_certification_hash ?? null,
            started_at: r.started_at,
            ended_at: r.ended_at,
            duration_ms: r.ended_at
              ? new Date(r.ended_at).getTime() - new Date(r.started_at).getTime()
              : Date.now() - new Date(r.started_at).getTime(),
          }))
        );
      }
      setLoading(false);
    }

    fetchRuns();

    const channel = supabase
      .channel("agent_runs_realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "agent_runs" }, fetchRuns)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  return { runs, loading };
}

function usePipelineNames() {
  const [pipelines, setPipelines] = useState<string[]>([]);
  useEffect(() => {
    (supabase as any)
      .from("pipelines")
      .select("name")
      .order("name")
      .then(({ data }: { data: any[] | null }) => {
        if (data) setPipelines(data.map((p: any) => p.name));
      });
  }, []);
  return pipelines;
}

const statusStyles: Record<AgentRun["status"], string> = {
  running: "bg-info/15 text-info border-info/30",
  completed: "bg-success/15 text-success border-success/30",
  failed: "bg-destructive/15 text-destructive border-destructive/30",
  aborted: "bg-warning/15 text-warning border-warning/30",
};

function RiskScoreBadge({ score }: { score: number }) {
  const level = score >= 0.7 ? "high" : score >= 0.4 ? "medium" : "low";
  const styles = {
    high: "bg-destructive/15 text-destructive border-destructive/30",
    medium: "bg-warning/15 text-warning border-warning/30",
    low: "bg-success/15 text-success border-success/30",
  };
  return (
    <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border", styles[level])}>
      {score >= 0.7 && <AlertTriangle className="w-3 h-3" />}
      {(score * 100).toFixed(0)}%
    </span>
  );
}

function formatDuration(ms: number) {
  if (ms < 1000) return `${ms}ms`;
  const s = Math.floor(ms / 1000);
  if (s < 60) return `${s}s`;
  return `${Math.floor(s / 60)}m ${s % 60}s`;
}

function buildCheckerUrl(run: AgentRun): string | null {
  if (run.ibs_certification_hash) {
    return `https://checker.icommunitylabs.com/check/fantom_opera_mainnet/${run.ibs_certification_hash}`;
  }
  if (run.ibs_evidence_id) {
    return `https://checker.icommunitylabs.com/?evidence_id=${run.ibs_evidence_id}`;
  }
  return null;
}

const DEFAULT_PAGE_SIZE = 10;

const AgentRuns = () => {
  const { runs, loading } = useAgentRuns();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [filters, setFilters] = useState<AgentRunFilters>(EMPTY_FILTERS);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const pipelines = usePipelineNames();

  const filtered = useMemo(() => {
    return runs.filter((r) => {
      if (filters.status !== "all" && r.status !== filters.status) return false;
      if (filters.pipeline !== "all" && r.pipeline_name !== filters.pipeline) return false;
      if (filters.dateFrom) {
        const start = new Date(r.started_at);
        if (start < filters.dateFrom) return false;
      }
      if (filters.dateTo) {
        const end = new Date(filters.dateTo);
        end.setHours(23, 59, 59, 999);
        const start = new Date(r.started_at);
        if (start > end) return false;
      }
      return true;
    });
  }, [runs, filters]);

  const { paged, totalPages } = paginate(filtered, page, pageSize);

  // Reset page when filters change
  useEffect(() => { setPage(0); }, [filters]);

  const totalPii = filtered.reduce((a, r) => a + r.pii_detected, 0);
  const totalMasked = filtered.reduce((a, r) => a + r.pii_masked, 0);
  const totalLeaked = filtered.reduce((a, r) => a + r.pii_leaked, 0);
  const avgRisk = filtered.length > 0 ? filtered.reduce((a, r) => a + r.risk_score, 0) / filtered.length : 0;
  const certified = filtered.filter((r) => r.ibs_status === "certified").length;

  if (loading) return <p className="p-6 text-muted-foreground">Cargando agent runs...</p>;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Bot className="w-6 h-6 text-primary" /> Agent Runs
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Monitor AI agent sessions — PII governance, risk scoring &amp; blockchain certification
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total Runs</p>
            <p className="text-2xl font-bold">{filtered.length}{filtered.length !== runs.length && <span className="text-xs text-muted-foreground ml-1">/ {runs.length}</span>}</p>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="p-4 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-success" />
            <div>
              <p className="text-xs text-muted-foreground">PII Masked</p>
              <p className="text-2xl font-bold">{totalMasked}<span className="text-xs text-muted-foreground ml-1">/ {totalPii}</span></p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="p-4 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-destructive" />
            <div>
              <p className="text-xs text-muted-foreground">PII Leaked</p>
              <p className="text-2xl font-bold">{totalLeaked}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="p-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-warning" />
            <div>
              <p className="text-xs text-muted-foreground">Avg Risk</p>
              <p className="text-2xl font-bold">{(avgRisk * 100).toFixed(0)}%</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="p-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">iBS Certified</p>
              <p className="text-2xl font-bold">{certified}<span className="text-xs text-muted-foreground ml-1">/ {filtered.length}</span></p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <AgentRunsFilters filters={filters} onChange={setFilters} pipelines={pipelines} />

      {/* Table */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-lg">Run History</CardTitle>
          <CardDescription>All agent sessions with PII governance metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Agent</TableHead>
                <TableHead>Pipeline</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Steps</TableHead>
                <TableHead className="text-center">PII Detected</TableHead>
                <TableHead className="text-center">Masked</TableHead>
                <TableHead className="text-center">Leaked</TableHead>
                <TableHead>Risk Score</TableHead>
                <TableHead>Blockchain</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Started</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paged.map((run) => (
                <>
                  <TableRow
                    key={run.id}
                    className="hover:bg-secondary/30 transition-colors cursor-pointer"
                    onClick={() => setExpandedId(expandedId === run.id ? null : run.id)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <ChevronRight className={cn("w-4 h-4 text-muted-foreground transition-transform", expandedId === run.id && "rotate-90")} />
                        <span className="font-medium text-sm">{run.agent_name}</span>
                        <Badge variant="outline" className="ml-1 text-[10px] px-1.5 py-0">{run.sector_preset}</Badge>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{run.pipeline_name}</TableCell>
                    <TableCell>
                      <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border capitalize", statusStyles[run.status])}>
                        {run.status === "running" && <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 animate-pulse" />}
                        {run.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-center text-sm">{run.total_steps}</TableCell>
                    <TableCell className="text-center text-sm font-medium">{run.pii_detected}</TableCell>
                    <TableCell className="text-center">
                      <span className="text-sm font-medium text-success">{run.pii_masked}</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={cn("text-sm font-medium", run.pii_leaked > 0 ? "text-destructive" : "text-muted-foreground")}>
                        {run.pii_leaked}
                      </span>
                    </TableCell>
                    <TableCell><RiskScoreBadge score={run.risk_score} /></TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <StatusBadge status={run.ibs_status} />
                        {run.ibs_status === "certified" && buildCheckerUrl(run) && (
                          <a
                            href={buildCheckerUrl(run)!}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] text-primary hover:underline"
                            title="Verify on blockchain"
                            onClick={(e) => e.stopPropagation()}
                          >
                            🔗 Verify
                          </a>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{formatDuration(run.duration_ms)}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{new Date(run.started_at).toLocaleString()}</TableCell>
                  </TableRow>
                  {expandedId === run.id && (
                    <TableRow key={`${run.id}-detail`}>
                      <TableCell colSpan={11} className="p-0 bg-secondary/10">
                        <AgentRunDetail agentRunId={run.id} />
                      </TableCell>
                    </TableRow>
                  )}
                </>
              ))}
            </TableBody>
          </Table>
          <PaginationControls page={page} totalPages={totalPages} totalItems={filtered.length} pageSize={pageSize} onPageChange={setPage} onPageSizeChange={setPageSize} />
        </CardContent>
      </Card>
    </div>
  );
};

export default AgentRuns;
