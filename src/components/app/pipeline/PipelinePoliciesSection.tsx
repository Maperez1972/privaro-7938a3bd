import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Plus, Trash2, Zap, Loader2 } from "lucide-react";
import PolicyDialog, { PolicyFormData } from "@/components/app/PolicyDialog";
import PipelinePresetModal from "./PipelinePresetModal";
import { PaginationControls, paginate } from "@/components/app/PaginationControls";

const categoryColors: Record<string, string> = {
  personal: "bg-primary/15 text-primary border-primary/30",
  financial: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  special: "bg-destructive/15 text-destructive border-destructive/30",
  business: "bg-amber-500/15 text-amber-400 border-amber-500/30",
};

const actionColors: Record<string, string> = {
  block: "bg-destructive/15 text-destructive border-destructive/30",
  anonymise: "bg-warning/15 text-warning border-warning/30",
  tokenise: "bg-primary/15 text-primary border-primary/30",
  pseudonymise: "bg-purple-500/15 text-purple-400 border-purple-500/30",
};

interface PipelineRule {
  id: string;
  entity_type: string;
  category: string;
  action: string;
  is_enabled: boolean;
  regulation_ref: string | null;
  priority: number;
  overrides_org: boolean;
  custom_pattern: string | null;
}

interface EffectivePolicy {
  id: string;
  entity_type: string;
  category: string;
  action: string;
  regulation_ref: string | null;
  effective_priority: number | null;
  pipeline_id: string | null;
  overrides_org: boolean;
  scope: string;
}

interface Props {
  pipelineId: string;
  pipelineName: string;
  pipelineSector: string;
}

const PipelinePoliciesSection = ({ pipelineId, pipelineName, pipelineSector }: Props) => {
  const { profile, user } = useAuth();
  const { toast } = useToast();
  const [rules, setRules] = useState<PipelineRule[]>([]);
  const [effective, setEffective] = useState<EffectivePolicy[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [presetModalOpen, setPresetModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [rulesPage, setRulesPage] = useState(0);
  const [rulesPageSize, setRulesPageSize] = useState(5);
  const [effectivePage, setEffectivePage] = useState(0);
  const [effectivePageSize, setEffectivePageSize] = useState(5);

  const fetchRules = useCallback(async () => {
    if (!profile?.org_id) return;
    const [rulesRes, effectiveRes] = await Promise.all([
      (supabase as any)
        .from("policy_rules")
        .select("id, entity_type, category, action, is_enabled, regulation_ref, priority, overrides_org, custom_pattern")
        .eq("pipeline_id", pipelineId)
        .eq("is_enabled", true)
        .order("priority", { ascending: true }),
      (supabase as any)
        .from("pipeline_effective_policies")
        .select("id, entity_type, category, action, regulation_ref, effective_priority, pipeline_id, overrides_org, scope")
        .eq("pipeline_id", pipelineId)
        .order("effective_priority", { ascending: true, nullsFirst: false }),
    ]);
    setRules(rulesRes.data ?? []);
    setEffective(effectiveRes.data ?? []);
    setLoading(false);
  }, [profile?.org_id, pipelineId]);

  useEffect(() => { fetchRules(); }, [fetchRules]);

  // Realtime subscription — listen to both pipeline-specific and org-level rule changes
  useEffect(() => {
    const channel = supabase
      .channel(`pipeline-policies-${pipelineId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "policy_rules", filter: `pipeline_id=eq.${pipelineId}` }, () => {
        fetchRules();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "policy_rules", filter: `scope=eq.org` }, () => {
        // Org-level changes affect effective policies view
        fetchRules();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [pipelineId, fetchRules]);

  const handleAddRule = async (form: PolicyFormData) => {
    if (!profile?.org_id || !user?.id) return;
    setSaving(true);
    const { error } = await (supabase as any).from("policy_rules").insert({
      org_id: profile.org_id,
      pipeline_id: pipelineId,
      scope: "pipeline",
      entity_type: form.entity_type,
      category: form.category,
      action: form.action,
      is_enabled: true,
      priority: form.priority,
      regulation_ref: form.regulation_ref || null,
      custom_pattern: form.custom_pattern || null,
      overrides_org: false,
      updated_by: user.id,
    });
    setSaving(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Pipeline rule created" });
      setDialogOpen(false);
      fetchRules();
    }
  };

  const handleToggle = async (rule: PipelineRule) => {
    if (!profile?.org_id || !user?.id) return;
    const { error } = await (supabase as any)
      .from("policy_rules")
      .update({ is_enabled: !rule.is_enabled, updated_by: user.id })
      .eq("id", rule.id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setRules(prev => prev.map(r => r.id === rule.id ? { ...r, is_enabled: !r.is_enabled } : r));
    }
  };

  const handleDelete = async (ruleId: string) => {
    const { error } = await (supabase as any).from("policy_rules").delete().eq("id", ruleId);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Rule deleted" });
      fetchRules();
    }
  };

  const handleToggleOverride = async (rule: PipelineRule) => {
    if (!user?.id) return;
    const { error } = await (supabase as any)
      .from("policy_rules")
      .update({ overrides_org: !rule.overrides_org, updated_by: user.id })
      .eq("id", rule.id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setRules(prev => prev.map(r => r.id === rule.id ? { ...r, overrides_org: !r.overrides_org } : r));
      fetchRules();
    }
  };

  if (loading) {
    return <div className="text-xs text-muted-foreground py-4 text-center">Loading pipeline policies…</div>;
  }

  const { paged: pagedRules, totalPages: rulesTotalPages } = paginate(rules, rulesPage, rulesPageSize);
  const { paged: pagedEffective, totalPages: effectiveTotalPages } = paginate(effective, effectivePage, effectivePageSize);

  return (
    <div className="mt-4 pt-4 border-t border-border">
      <h4 className="text-sm font-semibold mb-3">Pipeline Policies</h4>
      <Tabs defaultValue="pipeline-rules" className="w-full">
        <TabsList className="h-8">
          <TabsTrigger value="pipeline-rules" className="text-xs">Pipeline Rules</TabsTrigger>
          <TabsTrigger value="effective" className="text-xs">Effective Policies</TabsTrigger>
        </TabsList>

        <TabsContent value="pipeline-rules" className="mt-3">
          <div className="flex items-center gap-2 mb-3">
            <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => setPresetModalOpen(true)}>
              Apply Preset
            </Button>
            <Button size="sm" className="text-xs h-7 gap-1" onClick={() => setDialogOpen(true)}>
              <Plus className="w-3 h-3" /> Add Rule
            </Button>
          </div>

          {rules.length === 0 ? (
            <p className="text-xs text-muted-foreground py-6 text-center">
              No pipeline-specific rules. Org-level rules apply as fallback.
            </p>
          ) : (
            <>
              <Card className="border-border bg-card">
                <CardContent className="p-0">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-left text-muted-foreground border-b border-border">
                        <th className="p-3 font-medium">Entity Type</th>
                        <th className="p-3 font-medium">Action</th>
                        <th className="p-3 font-medium">Priority</th>
                        <th className="p-3 font-medium">Overrides Org</th>
                        <th className="p-3 font-medium">Regulation</th>
                        <th className="p-3 font-medium">Enabled</th>
                        <th className="p-3 font-medium w-8"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {pagedRules.map(rule => (
                        <tr key={rule.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                          <td className="p-3">
                            <Badge variant="outline" className={`text-[10px] capitalize ${categoryColors[rule.category] ?? ""}`}>
                              {rule.entity_type}
                            </Badge>
                          </td>
                          <td className="p-3">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border capitalize ${actionColors[rule.action] ?? "bg-muted text-muted-foreground border-border"}`}>
                              {rule.action}
                            </span>
                          </td>
                          <td className="p-3 font-mono text-muted-foreground">#{rule.priority}</td>
                          <td className="p-3">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button onClick={() => handleToggleOverride(rule)} className="hover:opacity-80">
                                    {rule.overrides_org ? (
                                      <Zap className="w-4 h-4 text-warning" />
                                    ) : (
                                      <span className="text-muted-foreground">—</span>
                                    )}
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  {rule.overrides_org
                                    ? "This rule overrides the org-level rule for the same entity type. Click to disable."
                                    : "Click to override org-level rule for this entity type."}
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </td>
                          <td className="p-3 text-muted-foreground">{rule.regulation_ref ?? "—"}</td>
                          <td className="p-3">
                            <Switch checked={rule.is_enabled} onCheckedChange={() => handleToggle(rule)} />
                          </td>
                          <td className="p-3">
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleDelete(rule.id)}>
                              <Trash2 className="w-3 h-3 text-destructive" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
              <PaginationControls page={rulesPage} totalPages={rulesTotalPages} totalItems={rules.length} pageSize={rulesPageSize} onPageChange={setRulesPage} onPageSizeChange={setRulesPageSize} />
            </>
          )}
        </TabsContent>

        <TabsContent value="effective" className="mt-3">
          {effective.length === 0 ? (
            <p className="text-xs text-muted-foreground py-6 text-center">No effective policies found for this pipeline.</p>
          ) : (
            <>
              <Card className="border-border bg-card">
                <CardContent className="p-0">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-left text-muted-foreground border-b border-border">
                        <th className="p-3 font-medium">Source</th>
                        <th className="p-3 font-medium">Entity Type</th>
                        <th className="p-3 font-medium">Action</th>
                        <th className="p-3 font-medium">Priority</th>
                        <th className="p-3 font-medium">Regulation</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pagedEffective.map(ep => {
                        const isSuppressed = ep.effective_priority === null;
                        const source = ep.pipeline_id ? "pipeline" : "org";
                        return (
                          <TooltipProvider key={ep.id}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <tr className={`border-b border-border/50 transition-colors ${isSuppressed ? "opacity-40 line-through" : "hover:bg-secondary/30"}`}>
                                  <td className="p-3">
                                    <Badge variant="outline" className={source === "pipeline" ? "bg-blue-700/20 text-blue-400 border-blue-500/30 text-[10px]" : "bg-secondary text-muted-foreground border-border text-[10px]"}>
                                      {source === "pipeline" ? "Pipeline" : "Org Fallback"}
                                    </Badge>
                                  </td>
                                  <td className="p-3">
                                    <Badge variant="outline" className={`text-[10px] capitalize ${categoryColors[ep.category] ?? ""}`}>
                                      {ep.entity_type}
                                    </Badge>
                                  </td>
                                  <td className="p-3">
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border capitalize ${actionColors[ep.action] ?? "bg-muted text-muted-foreground border-border"}`}>
                                      {ep.action}
                                    </span>
                                  </td>
                                  <td className="p-3 font-mono text-muted-foreground">
                                    {ep.effective_priority != null ? `#${ep.effective_priority}` : "—"}
                                  </td>
                                  <td className="p-3 text-muted-foreground">{ep.regulation_ref ?? "—"}</td>
                                </tr>
                              </TooltipTrigger>
                              {isSuppressed && (
                                <TooltipContent>Suppressed by pipeline override</TooltipContent>
                              )}
                            </Tooltip>
                          </TooltipProvider>
                        );
                      })}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
              <PaginationControls page={effectivePage} totalPages={effectiveTotalPages} totalItems={effective.length} pageSize={effectivePageSize} onPageChange={setEffectivePage} onPageSizeChange={setEffectivePageSize} />
            </>
          )}
        </TabsContent>
      </Tabs>

      <PolicyDialog open={dialogOpen} onOpenChange={setDialogOpen} onSubmit={handleAddRule} loading={saving} />
      <PipelinePresetModal
        open={presetModalOpen}
        onOpenChange={setPresetModalOpen}
        pipelineId={pipelineId}
        pipelineName={pipelineName}
        pipelineSector={pipelineSector}
        onApplied={fetchRules}
      />
    </div>
  );
};

export default PipelinePoliciesSection;
