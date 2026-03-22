import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { mockPolicyRules } from "@/lib/mock-data";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import PolicyDialog, { PolicyFormData } from "@/components/app/PolicyDialog";
import PolicyPresetPanel from "@/components/app/PolicyPresetPanel";
import { useToast } from "@/hooks/use-toast";
import { Plus, MoreVertical, Pencil, Trash2, Download, Upload, Info, Zap } from "lucide-react";
import { PaginationControls, paginate } from "@/components/app/PaginationControls";

const actionColors: Record<string, string> = {
  tokenise: "bg-primary/15 text-primary border-primary/30",
  pseudonymise: "bg-purple-500/15 text-purple-400 border-purple-500/30",
  anonymise: "bg-warning/15 text-warning border-warning/30",
  block: "bg-destructive/15 text-destructive border-destructive/30",
};

interface PolicyRule {
  id: string;
  entity_type: string;
  category: string;
  action: string;
  is_enabled: boolean;
  regulation_ref: string | null;
  priority: number;
  custom_pattern: string | null;
  pipeline_id: string | null;
  scope: string | null;
  overrides_org: boolean;
}

interface PipelineRuleRow extends PolicyRule {
  pipeline_name: string;
}

const Policies = () => {
  const { profile, user } = useAuth();
  const { toast } = useToast();
  const [rules, setRules] = useState<PolicyRule[]>([]);
  const [pipelineRules, setPipelineRules] = useState<PipelineRuleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [pipelineRulesLoading, setPipelineRulesLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editRule, setEditRule] = useState<PolicyRule | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<PolicyRule | null>(null);
  const [policyPage, setPolicyPage] = useState(0);
  const [policyPageSize, setPolicyPageSize] = useState(10);
  const [pipePage, setPipePage] = useState(0);
  const [pipePageSize, setPipePageSize] = useState(10);
  const [activePreset, setActivePreset] = useState<string | null>(
    localStorage.getItem("privaro-lastPreset")
  );
  const [pipelineFilter, setPipelineFilter] = useState<string>("all");
  const [pipelines, setPipelines] = useState<{ id: string; name: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch org-level rules only (pipeline_id IS NULL)
  const fetchRules = useCallback(async () => {
    if (!profile?.org_id) {
      setRules(mockPolicyRules as PolicyRule[]);
      setLoading(false);
      return;
    }
    const { data, error } = await (supabase as any)
      .from("policy_rules")
      .select("id, entity_type, category, action, is_enabled, regulation_ref, priority, custom_pattern, pipeline_id, scope, overrides_org")
      .eq("org_id", profile.org_id)
      .is("pipeline_id", null)
      .order("priority", { ascending: true });

    if (error) {
      console.error(error);
      setRules(mockPolicyRules as PolicyRule[]);
    } else {
      setRules(data as PolicyRule[]);
    }
    setLoading(false);
  }, [profile?.org_id]);

  // Fetch pipeline-scoped rules
  const fetchPipelineRules = useCallback(async () => {
    if (!profile?.org_id) {
      setPipelineRulesLoading(false);
      return;
    }
    const { data, error } = await (supabase as any)
      .from("policy_rules")
      .select("id, entity_type, category, action, is_enabled, regulation_ref, priority, custom_pattern, pipeline_id, scope, overrides_org, pipelines!inner(name)")
      .eq("org_id", profile.org_id)
      .eq("scope", "pipeline")
      .order("priority", { ascending: true });

    if (error) {
      console.error(error);
      // Fallback: try without join
      const { data: fallback } = await (supabase as any)
        .from("policy_rules")
        .select("id, entity_type, category, action, is_enabled, regulation_ref, priority, custom_pattern, pipeline_id, scope, overrides_org")
        .eq("org_id", profile.org_id)
        .eq("scope", "pipeline")
        .order("priority", { ascending: true });
      setPipelineRules((fallback ?? []).map((r: any) => ({ ...r, pipeline_name: r.pipeline_id?.slice(0, 8) ?? "Unknown" })));
    } else {
      setPipelineRules((data ?? []).map((r: any) => ({
        ...r,
        pipeline_name: r.pipelines?.name ?? "Unknown",
        pipelines: undefined,
      })));
    }
    setPipelineRulesLoading(false);
  }, [profile?.org_id]);

  // Fetch pipelines for filter dropdown
  const fetchPipelines = useCallback(async () => {
    if (!profile?.org_id) return;
    const { data } = await supabase
      .from("pipelines")
      .select("id, name")
      .eq("org_id", profile.org_id)
      .order("name");
    setPipelines(data ?? []);
  }, [profile?.org_id]);

  useEffect(() => { fetchRules(); fetchPipelineRules(); fetchPipelines(); }, [fetchRules, fetchPipelineRules, fetchPipelines]);

  const activePresetSlug = activePreset || localStorage.getItem("privaro-lastPreset") || null;

  const handleCreate = async (form: PolicyFormData) => {
    if (!profile?.org_id) return;
    setSaving(true);
    const { error } = await (supabase as any).from("policy_rules").insert({
      org_id: profile.org_id,
      pipeline_id: null,
      scope: "org",
      entity_type: form.entity_type,
      category: form.category,
      action: form.action,
      regulation_ref: form.regulation_ref || null,
      priority: form.priority,
      custom_pattern: form.custom_pattern || null,
      updated_by: user?.id,
    });
    setSaving(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Rule created" });
      setDialogOpen(false);
      localStorage.removeItem("privaro-lastPreset");
      setActivePreset(null);
      fetchRules();
    }
  };

  const handleEdit = async (form: PolicyFormData) => {
    if (!editRule || !profile?.org_id || !user?.id) return;
    setSaving(true);
    const { data: updatedRule, error } = await supabase
      .from("policy_rules")
      .update({
        entity_type: form.entity_type,
        category: form.category,
        action: form.action,
        regulation_ref: form.regulation_ref || null,
        priority: form.priority,
        custom_pattern: form.custom_pattern || null,
        updated_by: user.id,
      })
      .eq("id", editRule.id)
      .eq("org_id", profile.org_id)
      .select("id")
      .maybeSingle();

    setSaving(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    if (!updatedRule) {
      toast({ title: "Update blocked", description: "No tienes permisos UPDATE para esta regla (RLS).", variant: "destructive" });
      return;
    }
    toast({ title: "Rule updated" });
    setEditRule(null);
    localStorage.removeItem("privaro-lastPreset");
    setActivePreset(null);
    fetchRules();
  };

  const handleToggle = async (rule: PolicyRule) => {
    if (!profile?.org_id || !user?.id) return;
    const { data: updatedRule, error } = await supabase
      .from("policy_rules")
      .update({ is_enabled: !rule.is_enabled, updated_by: user.id })
      .eq("id", rule.id)
      .eq("org_id", profile.org_id)
      .select("id")
      .maybeSingle();

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    if (!updatedRule) {
      toast({ title: "Update blocked", description: "No tienes permisos UPDATE para esta regla (RLS).", variant: "destructive" });
      return;
    }
    setRules((prev) => prev.map((r) => r.id === rule.id ? { ...r, is_enabled: !r.is_enabled } : r));
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const { error } = await supabase.from("policy_rules").delete().eq("id", deleteTarget.id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Rule deleted" });
      localStorage.removeItem("privaro-lastPreset");
      setActivePreset(null);
      fetchRules();
      fetchPipelineRules();
    }
    setDeleteTarget(null);
  };

  const handlePresetApplied = (presetSlug: string) => {
    setActivePreset(presetSlug);
    fetchRules();
  };

  const handleExport = () => {
    const exportData = rules.map(({ id, ...rest }) => rest);
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `privaro-policy-rules-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Rules exported", description: `${rules.length} rules downloaded as JSON` });
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile?.org_id) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const imported = JSON.parse(ev.target?.result as string);
        if (!Array.isArray(imported)) throw new Error("Invalid format");
        // Only delete org-level rules
        await (supabase as any).from("policy_rules").delete().eq("org_id", profile.org_id).is("pipeline_id", null);
        const rows = imported.map((r: any) => ({
          org_id: profile.org_id,
          pipeline_id: null,
          scope: "org",
          entity_type: r.entity_type,
          category: r.category,
          action: r.action,
          regulation_ref: r.regulation_ref || null,
          priority: r.priority ?? 10,
          custom_pattern: r.custom_pattern || null,
          is_enabled: r.is_enabled ?? true,
          updated_by: user?.id,
        }));
        const { error } = await supabase.from("policy_rules").insert(rows);
        if (error) {
          toast({ title: "Import error", description: error.message, variant: "destructive" });
        } else {
          localStorage.removeItem("privaro-lastPreset");
          setActivePreset(null);
          toast({ title: "Rules imported", description: `${rows.length} rules loaded` });
          fetchRules();
        }
      } catch {
        toast({ title: "Invalid file", description: "Could not parse the JSON file", variant: "destructive" });
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Pipeline rules filtered
  const filteredPipelineRules = pipelineFilter === "all"
    ? pipelineRules
    : pipelineRules.filter(r => r.pipeline_id === pipelineFilter);

  // Group by pipeline for display
  const groupedByPipeline = filteredPipelineRules.reduce<Record<string, PipelineRuleRow[]>>((acc, r) => {
    const key = r.pipeline_name;
    if (!acc[key]) acc[key] = [];
    acc[key].push(r);
    return acc;
  }, {});

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Policy Engine</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Configure GDPR-aligned privacy rules for PII handling
          </p>
        </div>
      </div>

      <Tabs defaultValue="org-rules" className="w-full">
        <TabsList>
          <TabsTrigger value="org-rules">Org Rules</TabsTrigger>
          <TabsTrigger value="pipeline-rules">Pipeline Rules</TabsTrigger>
        </TabsList>

        {/* ─── ORG RULES TAB ─── */}
        <TabsContent value="org-rules" className="space-y-5 mt-4">
          {/* Info banner */}
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-primary/5 border border-primary/20">
            <Info className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
            <p className="text-xs text-muted-foreground">
              These rules apply to <strong className="text-foreground">all pipelines</strong> as fallback. Pipeline-specific rules take precedence. Use the Pipelines section to configure per-pipeline policies.
            </p>
          </div>

          {/* Action bar */}
          <div className="flex items-center justify-end gap-2">
            {rules.length > 0 && (
              <>
                <Button size="sm" variant="outline" className="gap-2" onClick={handleExport}>
                  <Download className="w-4 h-4" /> Export
                </Button>
                <Button size="sm" variant="outline" className="gap-2" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="w-4 h-4" /> Import
                </Button>
              </>
            )}
            <Button size="sm" className="gap-2" onClick={() => setDialogOpen(true)}>
              <Plus className="w-4 h-4" /> New Rule
            </Button>
            <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
          </div>

          {/* Quick Setup Presets */}
          {profile?.org_id && user?.id && (
            <PolicyPresetPanel orgId={profile.org_id} userId={user.id} onApplied={handlePresetApplied} />
          )}

          {loading ? (
            <div className="text-center py-12 text-muted-foreground text-sm">Loading rules…</div>
          ) : rules.length === 0 ? (
            <Card className="border-border bg-card">
              <CardContent className="flex flex-col items-center justify-center py-16 gap-3">
                <p className="text-muted-foreground text-sm">No org-level rules configured</p>
                <p className="text-xs text-muted-foreground">Apply a preset above or create a custom rule</p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="flex items-center gap-2">
                {activePresetSlug ? (
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 text-xs">
                    {activePresetSlug} active
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-secondary text-muted-foreground border-border text-xs">
                    Custom configuration
                  </Badge>
                )}
                <span className="text-xs text-muted-foreground">{rules.length} rules</span>
              </div>

              <Card className="border-border bg-card">
                <CardContent className="p-0">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-muted-foreground border-b border-border">
                        <th className="p-4 font-medium">Enabled</th>
                        <th className="p-4 font-medium">Priority</th>
                        <th className="p-4 font-medium">Entity Type</th>
                        <th className="p-4 font-medium">Category</th>
                        <th className="p-4 font-medium">Action</th>
                        <th className="p-4 font-medium">Regulation</th>
                        <th className="p-4 font-medium w-10"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginate(rules, policyPage, policyPageSize).paged.map((rule) => (
                        <tr key={rule.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                          <td className="p-4">
                            <Switch checked={rule.is_enabled} onCheckedChange={() => handleToggle(rule)} />
                          </td>
                          <td className="p-4 font-mono text-xs text-muted-foreground">#{rule.priority}</td>
                          <td className="p-4">
                            <span className="font-mono text-xs bg-secondary px-2 py-1 rounded">{rule.entity_type}</span>
                          </td>
                          <td className="p-4 text-xs capitalize">{rule.category}</td>
                          <td className="p-4">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border capitalize ${actionColors[rule.action] ?? "bg-muted text-muted-foreground border-border"}`}>
                              {rule.action}
                            </span>
                          </td>
                          <td className="p-4 text-xs text-muted-foreground">{rule.regulation_ref ?? "—"}</td>
                          <td className="p-4">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-36">
                                <DropdownMenuItem onClick={() => setEditRule(rule)}>
                                  <Pencil className="w-3.5 h-3.5 mr-2" /> Edit
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => setDeleteTarget(rule)} className="text-destructive focus:text-destructive">
                                  <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
              <PaginationControls page={policyPage} totalPages={Math.max(1, Math.ceil(rules.length / policyPageSize))} totalItems={rules.length} pageSize={policyPageSize} onPageChange={setPolicyPage} onPageSizeChange={setPolicyPageSize} />
            </>
          )}
        </TabsContent>

        {/* ─── PIPELINE RULES TAB ─── */}
        <TabsContent value="pipeline-rules" className="space-y-5 mt-4">
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">Filter by pipeline:</span>
            <Select value={pipelineFilter} onValueChange={(v) => { setPipelineFilter(v); setPipePage(0); }}>
              <SelectTrigger className="w-[200px] h-8 text-xs">
                <SelectValue placeholder="All pipelines" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Pipelines</SelectItem>
                {pipelines.map(p => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-xs text-muted-foreground ml-auto">{filteredPipelineRules.length} rules</span>
          </div>

          {pipelineRulesLoading ? (
            <div className="text-center py-12 text-muted-foreground text-sm">Loading pipeline rules…</div>
          ) : filteredPipelineRules.length === 0 ? (
            <Card className="border-border bg-card">
              <CardContent className="flex flex-col items-center justify-center py-16 gap-3">
                <p className="text-muted-foreground text-sm">No pipeline-specific rules</p>
                <p className="text-xs text-muted-foreground">Configure per-pipeline rules from the Pipelines section</p>
              </CardContent>
            </Card>
          ) : (
            <>
              {Object.entries(groupedByPipeline).map(([pipelineName, pipeRules]) => (
                <div key={pipelineName} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-blue-700/20 text-blue-400 border-blue-500/30 text-xs">{pipelineName}</Badge>
                    <span className="text-xs text-muted-foreground">{pipeRules.length} rules</span>
                  </div>
                  <Card className="border-border bg-card">
                    <CardContent className="p-0">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-left text-muted-foreground border-b border-border">
                            <th className="p-3 font-medium text-xs">Entity Type</th>
                            <th className="p-3 font-medium text-xs">Action</th>
                            <th className="p-3 font-medium text-xs">Overrides Org</th>
                            <th className="p-3 font-medium text-xs">Priority</th>
                            <th className="p-3 font-medium text-xs">Regulation</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pipeRules.map(rule => (
                            <tr key={rule.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                              <td className="p-3">
                                <span className="font-mono text-xs bg-secondary px-2 py-1 rounded">{rule.entity_type}</span>
                              </td>
                              <td className="p-3">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border capitalize ${actionColors[rule.action] ?? "bg-muted text-muted-foreground border-border"}`}>
                                  {rule.action}
                                </span>
                              </td>
                              <td className="p-3">
                                {rule.overrides_org ? (
                                  <Zap className="w-4 h-4 text-warning" />
                                ) : (
                                  <span className="text-muted-foreground text-xs">—</span>
                                )}
                              </td>
                              <td className="p-3 font-mono text-xs text-muted-foreground">#{rule.priority}</td>
                              <td className="p-3 text-xs text-muted-foreground">{rule.regulation_ref ?? "—"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </CardContent>
                  </Card>
                </div>
              ))}
              <PaginationControls page={pipePage} totalPages={Math.max(1, Math.ceil(filteredPipelineRules.length / pipePageSize))} totalItems={filteredPipelineRules.length} pageSize={pipePageSize} onPageChange={setPipePage} onPageSizeChange={setPipePageSize} />
            </>
          )}
        </TabsContent>
      </Tabs>

      <PolicyDialog open={dialogOpen} onOpenChange={setDialogOpen} onSubmit={handleCreate} loading={saving} />

      <PolicyDialog
        open={!!editRule}
        onOpenChange={(open) => !open && setEditRule(null)}
        onSubmit={handleEdit}
        loading={saving}
        initialData={editRule ? {
          entity_type: editRule.entity_type,
          category: editRule.category,
          action: editRule.action,
          regulation_ref: editRule.regulation_ref ?? "",
          priority: editRule.priority,
          custom_pattern: editRule.custom_pattern ?? "",
        } : null}
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete rule?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the <strong>{deleteTarget?.entity_type}</strong> rule.
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

export default Policies;
