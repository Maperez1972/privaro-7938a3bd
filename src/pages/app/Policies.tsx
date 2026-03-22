import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { mockPolicyRules } from "@/lib/mock-data";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
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
import PolicyDialog, { PolicyFormData } from "@/components/app/PolicyDialog";
import PolicyPresetPanel from "@/components/app/PolicyPresetPanel";
import { useToast } from "@/hooks/use-toast";
import { Plus, MoreVertical, Pencil, Trash2, Download, Upload } from "lucide-react";
import { useState as usePaginationState } from "react";
import { PaginationControls, paginate } from "@/components/app/PaginationControls";

const actionColors: Record<string, string> = {
  tokenise: "bg-primary/15 text-primary border-primary/30",
  pseudonymise: "bg-info/15 text-info border-info/30",
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
}

const Policies = () => {
  const { profile, user } = useAuth();
  const { toast } = useToast();
  const [rules, setRules] = useState<PolicyRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editRule, setEditRule] = useState<PolicyRule | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<PolicyRule | null>(null);
  const [policyPage, setPolicyPage] = useState(0);
  const [activePreset, setActivePreset] = useState<string | null>(
    localStorage.getItem("privaro-lastPreset")
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchRules = useCallback(async () => {
    if (!profile?.org_id) {
      setRules(mockPolicyRules as PolicyRule[]);
      setLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from("policy_rules")
      .select("id, entity_type, category, action, is_enabled, regulation_ref, priority, custom_pattern")
      .eq("org_id", profile.org_id)
      .order("priority", { ascending: true });

    if (error) {
      console.error(error);
      setRules(mockPolicyRules as PolicyRule[]);
    } else {
      setRules(data as PolicyRule[]);
    }
    setLoading(false);
  }, [profile?.org_id]);

  useEffect(() => { fetchRules(); }, [fetchRules]);

  // Detect active preset from localStorage
  const activePresetSlug = activePreset || localStorage.getItem("privaro-lastPreset") || null;

  const handleCreate = async (form: PolicyFormData) => {
    if (!profile?.org_id) return;
    setSaving(true);
    const { error } = await supabase.from("policy_rules").insert({
      org_id: profile.org_id,
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
    }
    setDeleteTarget(null);
  };

  const handlePresetApplied = (presetSlug: string) => {
    setActivePreset(presetSlug);
    fetchRules();
  };

  // Export rules as JSON
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

  // Import rules from JSON
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile?.org_id) return;

    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const imported = JSON.parse(ev.target?.result as string);
        if (!Array.isArray(imported)) throw new Error("Invalid format");

        // Delete existing then insert
        await supabase.from("policy_rules").delete().eq("org_id", profile.org_id);

        const rows = imported.map((r: any) => ({
          org_id: profile.org_id,
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

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Policy Engine</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Configure GDPR-aligned privacy rules for PII handling
          </p>
        </div>
        <div className="flex items-center gap-2">
          {rules.length > 0 && (
            <>
              <Button size="sm" variant="outline" className="gap-2" onClick={handleExport}>
                <Download className="w-4 h-4" />
                Export
              </Button>
              <Button size="sm" variant="outline" className="gap-2" onClick={() => fileInputRef.current?.click()}>
                <Upload className="w-4 h-4" />
                Import
              </Button>
            </>
          )}
          <Button size="sm" className="gap-2" onClick={() => setDialogOpen(true)}>
            <Plus className="w-4 h-4" />
            New Rule
          </Button>
          <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
        </div>
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
            <p className="text-muted-foreground text-sm">No privacy rules configured</p>
            <p className="text-xs text-muted-foreground">Apply a preset above or create a custom rule</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Active preset indicator */}
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
                  {(() => { const { paged } = paginate(rules, policyPage, 10); return paged; })().map((rule) => (
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
          <PaginationControls page={policyPage} totalPages={Math.max(1, Math.ceil(rules.length / 10))} totalItems={rules.length} pageSize={10} onPageChange={setPolicyPage} />
        </>
      )}

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
