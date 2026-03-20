import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { mockPipelines } from "@/lib/mock-data";
import { StatusBadge } from "@/components/app/StatusBadge";
import PipelineDialog, { PipelineFormData } from "@/components/app/PipelineDialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, GitBranch, MoreVertical, Pencil, Play, Pause, Archive, Trash2 } from "lucide-react";

interface Pipeline {
  id: string;
  name: string;
  sector: string;
  llm_provider: string;
  llm_model: string;
  llm_endpoint_url: string | null;
  status: string;
  total_requests: number;
  total_pii_detected: number;
  total_pii_masked: number;
  total_leaked: number;
  avg_latency_ms: number;
}

const Pipelines = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [loading, setLoading] = useState(true);

  // Avg risk scores per pipeline (last 30 days)
  const thirtyDaysAgo = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString();
  }, []);

  const { data: riskScores } = useQuery({
    queryKey: ["pipeline-risk-scores", profile?.org_id, thirtyDaysAgo],
    enabled: !!profile?.org_id,
    queryFn: async () => {
      const { data } = await (supabase
        .from("audit_logs")
        .select("pipeline_id, risk_score") as any)
        .eq("org_id", profile!.org_id)
        .not("risk_score", "is", null)
        .gte("created_at", thirtyDaysAgo);

      const map: Record<string, { sum: number; count: number }> = {};
      for (const row of data ?? []) {
        if (!row.pipeline_id) continue;
        if (!map[row.pipeline_id]) map[row.pipeline_id] = { sum: 0, count: 0 };
        map[row.pipeline_id].sum += row.risk_score;
        map[row.pipeline_id].count++;
      }
      const result: Record<string, number> = {};
      for (const [id, v] of Object.entries(map)) {
        result[id] = v.sum / v.count;
      }
      return result;
    },
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editPipeline, setEditPipeline] = useState<Pipeline | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Pipeline | null>(null);

  const fetchPipelines = useCallback(async () => {
    if (!profile?.org_id) {
      // Use mock data if no org
      setPipelines(mockPipelines as Pipeline[]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("pipelines")
      .select("*")
      .eq("org_id", profile.org_id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching pipelines:", error);
      setPipelines(mockPipelines as Pipeline[]);
    } else {
      setPipelines(data as Pipeline[]);
    }
    setLoading(false);
  }, [profile?.org_id]);

  useEffect(() => {
    fetchPipelines();
  }, [fetchPipelines]);

  const handleCreate = async (form: PipelineFormData) => {
    if (!profile?.org_id) {
      toast({ title: "Error", description: "No organization found", variant: "destructive" });
      return;
    }

    setSaving(true);
    const { error } = await supabase.from("pipelines").insert({
      org_id: profile.org_id,
      name: form.name,
      sector: form.sector,
      llm_provider: form.llm_provider,
      llm_model: form.llm_model,
      llm_endpoint_url: form.llm_endpoint_url || null,
      policy_set_id: form.policy_set_id || null,
    });

    setSaving(false);
    if (error) {
      toast({ title: "Error creating pipeline", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Pipeline created" });
      setDialogOpen(false);
      fetchPipelines();
    }
  };

  const handleEdit = async (form: PipelineFormData) => {
    if (!editPipeline) return;

    setSaving(true);
    const { error } = await supabase
      .from("pipelines")
      .update({
        name: form.name,
        sector: form.sector,
        llm_provider: form.llm_provider,
        llm_model: form.llm_model,
        llm_endpoint_url: form.llm_endpoint_url || null,
        policy_set_id: form.policy_set_id || null,
      })
      .eq("id", editPipeline.id);

    setSaving(false);
    if (error) {
      toast({ title: "Error updating pipeline", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Pipeline updated" });
      setEditPipeline(null);
      fetchPipelines();
    }
  };

  const handleStatusChange = async (pipe: Pipeline, newStatus: string) => {
    const { error } = await supabase
      .from("pipelines")
      .update({ status: newStatus })
      .eq("id", pipe.id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: `Pipeline ${newStatus}` });
      fetchPipelines();
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const { error } = await supabase.from("pipelines").delete().eq("id", deleteTarget.id);
    if (error) {
      toast({ title: "Error deleting pipeline", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Pipeline deleted" });
      fetchPipelines();
    }
    setDeleteTarget(null);
  };

  const openEdit = (pipe: Pipeline) => {
    setEditPipeline(pipe);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">AI Pipelines</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your AI integrations and privacy configurations
          </p>
        </div>
        <Button size="sm" className="gap-2" onClick={() => setDialogOpen(true)}>
          <Plus className="w-4 h-4" />
          New Pipeline
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground text-sm">Loading pipelines…</div>
      ) : pipelines.length === 0 ? (
        <Card className="border-border bg-card">
          <CardContent className="flex flex-col items-center justify-center py-16 gap-3">
            <GitBranch className="w-10 h-10 text-muted-foreground" />
            <p className="text-muted-foreground text-sm">No pipelines yet</p>
            <Button size="sm" onClick={() => setDialogOpen(true)}>
              Create your first pipeline
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {pipelines.map((pipe) => {
            const coverage =
              pipe.total_pii_detected > 0
                ? ((pipe.total_pii_masked / pipe.total_pii_detected) * 100).toFixed(1)
                : "100";
            return (
              <Card key={pipe.id} className="border-border bg-card hover:border-primary/30 transition-colors">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <GitBranch className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{pipe.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs bg-secondary px-2 py-0.5 rounded capitalize">
                            {pipe.sector}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {pipe.llm_provider}/{pipe.llm_model}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <StatusBadge status={pipe.status} />
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                          <DropdownMenuItem onClick={() => openEdit(pipe)}>
                            <Pencil className="w-3.5 h-3.5 mr-2" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {pipe.status !== "active" && (
                            <DropdownMenuItem onClick={() => handleStatusChange(pipe, "active")}>
                              <Play className="w-3.5 h-3.5 mr-2" /> Activate
                            </DropdownMenuItem>
                          )}
                          {pipe.status !== "paused" && pipe.status !== "archived" && (
                            <DropdownMenuItem onClick={() => handleStatusChange(pipe, "paused")}>
                              <Pause className="w-3.5 h-3.5 mr-2" /> Pause
                            </DropdownMenuItem>
                          )}
                          {pipe.status !== "archived" && (
                            <DropdownMenuItem onClick={() => handleStatusChange(pipe, "archived")}>
                              <Archive className="w-3.5 h-3.5 mr-2" /> Archive
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => setDeleteTarget(pipe)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  <div className="grid grid-cols-6 gap-4 mt-5 pt-4 border-t border-border">
                    <div>
                      <p className="text-xs text-muted-foreground">Requests</p>
                      <p className="text-sm font-semibold">{pipe.total_requests.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">PII Detected</p>
                      <p className="text-sm font-semibold">{pipe.total_pii_detected.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Protected</p>
                      <p className="text-sm font-semibold">{pipe.total_pii_masked.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Coverage</p>
                      <p className="text-sm font-semibold text-success">{coverage}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Avg Risk</p>
                      {(() => {
                        const avgRisk = riskScores?.[pipe.id];
                        if (avgRisk == null) return <p className="text-sm font-semibold text-muted-foreground">—</p>;
                        const pct = (avgRisk * 100).toFixed(0);
                        const color = avgRisk >= 0.7 ? "text-destructive" : avgRisk >= 0.4 ? "text-amber-400" : "text-green-400";
                        return <p className={`text-sm font-semibold ${color}`}>{pct}%</p>;
                      })()}
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Latency</p>
                      <p className="text-sm font-semibold">{pipe.avg_latency_ms}ms</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create dialog */}
      <PipelineDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleCreate}
        loading={saving}
      />

      {/* Edit dialog */}
      <PipelineDialog
        open={!!editPipeline}
        onOpenChange={(open) => !open && setEditPipeline(null)}
        onSubmit={handleEdit}
        loading={saving}
        initialData={
          editPipeline
            ? {
                name: editPipeline.name,
                sector: editPipeline.sector,
                llm_provider: editPipeline.llm_provider,
                llm_model: editPipeline.llm_model,
                llm_endpoint_url: editPipeline.llm_endpoint_url ?? "",
                policy_set_id: (editPipeline as any).policy_set_id ?? null,
              }
            : null
        }
      />

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete pipeline?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <strong>{deleteTarget?.name}</strong> and all associated data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Pipelines;
