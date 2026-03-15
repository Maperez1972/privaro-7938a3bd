import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { mockPolicyRules } from "@/lib/mock-data";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
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
import PolicyDialog, { PolicyFormData, SECTOR_PRESETS } from "@/components/app/PolicyDialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, ShieldCheck, MoreVertical, Pencil, Trash2, Download, Upload } from "lucide-react";

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
      fetchRules();
    }
  };

  const handleEdit = async (form: PolicyFormData) => {
    if (!editRule) return;
    setSaving(true);
    const { error } = await supabase.from("policy_rules").update({
      entity_type: form.entity_type,
      category: form.category,
      action: form.action,
      regulation_ref: form.regulation_ref || null,
      priority: form.priority,
      custom_pattern: form.custom_pattern || null,
      updated_by: user?.id,
    }).eq("id", editRule.id);
    setSaving(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Rule updated" });
      setEditRule(null);
      fetchRules();
    }
  };

  const handleToggle = async (rule: PolicyRule) => {
    const { error } = await supabase
      .from("policy_rules")
      .update({ is_enabled: !rule.is_enabled, updated_by: user?.id })
      .eq("id", rule.id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setRules((prev) => prev.map((r) => r.id === rule.id ? { ...r, is_enabled: !r.is_enabled } : r));
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const { error } = await supabase.from("policy_rules").delete().eq("id", deleteTarget.id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Rule deleted" });
      fetchRules();
    }
    setDeleteTarget(null);
  };

  const loadPreset = async (sector: string) => {
    if (!profile?.org_id) return;
    const preset = SECTOR_PRESETS[sector];
    if (!preset) return;

    const rows = preset.map((p) => ({
      org_id: profile.org_id,
      entity_type: p.entity_type,
      category: p.category,
      action: p.action,
      regulation_ref: p.regulation_ref || null,
      priority: p.priority,
      custom_pattern: p.custom_pattern || null,
      updated_by: user?.id,
    }));

    const { error } = await supabase.from("policy_rules").insert(rows);
    if (error) {
      toast({ title: "Error loading preset", description: error.message, variant: "destructive" });
    } else {
      toast({ title: `${sector} preset loaded (${preset.length} rules)` });
      fetchRules();
    }
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="outline" className="gap-2">
                <Download className="w-4 h-4" />
                Load Preset
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => loadPreset("legal")}>
                <ShieldCheck className="w-3.5 h-3.5 mr-2" /> Legal
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => loadPreset("healthcare")}>
                <ShieldCheck className="w-3.5 h-3.5 mr-2" /> Healthcare
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => loadPreset("fintech")}>
                <ShieldCheck className="w-3.5 h-3.5 mr-2" /> Fintech
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button size="sm" className="gap-2" onClick={() => setDialogOpen(true)}>
            <Plus className="w-4 h-4" />
            New Rule
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground text-sm">Loading rules…</div>
      ) : rules.length === 0 ? (
        <Card className="border-border bg-card">
          <CardContent className="flex flex-col items-center justify-center py-16 gap-3">
            <ShieldCheck className="w-10 h-10 text-muted-foreground" />
            <p className="text-muted-foreground text-sm">No privacy rules configured</p>
            <p className="text-xs text-muted-foreground">Load a sector preset or create a custom rule</p>
            <div className="flex gap-2 mt-2">
              <Button size="sm" variant="outline" onClick={() => loadPreset("legal")}>Legal Preset</Button>
              <Button size="sm" variant="outline" onClick={() => loadPreset("healthcare")}>Healthcare Preset</Button>
              <Button size="sm" variant="outline" onClick={() => loadPreset("fintech")}>Fintech Preset</Button>
            </div>
          </CardContent>
        </Card>
      ) : (
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
                {rules.map((rule) => (
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
      )}

      {/* Create dialog */}
      <PolicyDialog open={dialogOpen} onOpenChange={setDialogOpen} onSubmit={handleCreate} loading={saving} />

      {/* Edit dialog */}
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

      {/* Delete confirmation */}
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
