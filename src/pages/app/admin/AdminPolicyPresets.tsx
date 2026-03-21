import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Plus, Pencil, Trash2, Loader2, GripVertical } from "lucide-react";

interface PresetRule {
  entity_type: string;
  category: string;
  action: string;
  regulation_ref?: string;
  priority: number;
  custom_pattern?: string;
}

interface Preset {
  id: string;
  slug: string;
  name: string;
  description: string;
  sector: string;
  icon: string;
  color?: string;
  rules: PresetRule[];
  created_at?: string;
}

const SECTORS = ["legal", "healthcare", "fintech", "insurance", "general", "hr", "education"];
const ICONS = ["⚖️", "🏥", "💳", "🛡️", "📋", "🏢", "🎓", "🔒", "📊", "🤖"];
const ACTIONS = ["tokenise", "pseudonymise", "anonymise", "block", "log_only"];
const CATEGORIES = ["personal", "financial", "special", "business", "health", "legal"];

const emptyRule: PresetRule = {
  entity_type: "",
  category: "personal",
  action: "tokenise",
  regulation_ref: "",
  priority: 50,
  custom_pattern: "",
};

const AdminPolicyPresets = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [presets, setPresets] = useState<Preset[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Preset | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Form state
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    sector: "general",
    icon: "📋",
    color: "#3B82F6",
    rules: [{ ...emptyRule }] as PresetRule[],
  });

  const fetchPresets = useCallback(async () => {
    const { data } = await (supabase as any)
      .from("policy_presets")
      .select("*")
      .order("name");
    setPresets(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchPresets();
  }, [fetchPresets]);

  const openCreate = () => {
    setEditId(null);
    setForm({
      name: "",
      slug: "",
      description: "",
      sector: "general",
      icon: "📋",
      color: "#3B82F6",
      rules: [{ ...emptyRule }],
    });
    setDialogOpen(true);
  };

  const openEdit = (preset: Preset) => {
    setEditId(preset.id);
    setForm({
      name: preset.name,
      slug: preset.slug,
      description: preset.description,
      sector: preset.sector,
      icon: preset.icon,
      color: preset.color || "#3B82F6",
      rules: Array.isArray(preset.rules) && preset.rules.length > 0
        ? preset.rules
        : [{ ...emptyRule }],
    });
    setDialogOpen(true);
  };

  const autoSlug = (name: string) =>
    name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const updateForm = (field: string, value: string) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "name" && !editId) next.slug = autoSlug(value);
      return next;
    });
  };

  const updateRule = (index: number, field: keyof PresetRule, value: string | number) => {
    setForm((prev) => {
      const rules = [...prev.rules];
      rules[index] = { ...rules[index], [field]: value };
      return { ...prev, rules };
    });
  };

  const addRule = () => {
    setForm((prev) => ({
      ...prev,
      rules: [...prev.rules, { ...emptyRule, priority: prev.rules.length * 10 + 10 }],
    }));
  };

  const removeRule = (index: number) => {
    setForm((prev) => ({
      ...prev,
      rules: prev.rules.filter((_, i) => i !== index),
    }));
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.slug.trim()) {
      toast({ title: "Validation", description: "Name and slug are required", variant: "destructive" });
      return;
    }
    if (form.rules.some((r) => !r.entity_type.trim())) {
      toast({ title: "Validation", description: "All rules need an entity type", variant: "destructive" });
      return;
    }

    setSaving(true);
    const payload = {
      name: form.name.trim(),
      slug: form.slug.trim(),
      description: form.description.trim(),
      sector: form.sector,
      icon: form.icon,
      color: form.color,
      rules: form.rules.map((r) => ({
        entity_type: r.entity_type.trim(),
        category: r.category,
        action: r.action,
        regulation_ref: r.regulation_ref?.trim() || null,
        priority: Number(r.priority) || 50,
        custom_pattern: r.custom_pattern?.trim() || null,
      })),
    };

    let error;
    if (editId) {
      ({ error } = await (supabase as any)
        .from("policy_presets")
        .update(payload)
        .eq("id", editId));
    } else {
      ({ error } = await (supabase as any)
        .from("policy_presets")
        .insert(payload));
    }

    setSaving(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: editId ? "Preset updated" : "Preset created" });
      setDialogOpen(false);
      fetchPresets();
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const { error } = await (supabase as any)
      .from("policy_presets")
      .delete()
      .eq("id", deleteTarget.id);
    setDeleting(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Preset deleted" });
      setDeleteTarget(null);
      fetchPresets();
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Policy Presets</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage industry-specific policy templates
          </p>
        </div>
        <Button onClick={openCreate} size="sm" className="gap-1.5">
          <Plus className="w-4 h-4" /> New Preset
        </Button>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border-border bg-card">
              <CardContent className="p-5 space-y-3">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-4 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : presets.length === 0 ? (
        <Card className="border-border bg-card">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-muted-foreground text-sm">No presets yet</p>
            <Button onClick={openCreate} variant="outline" size="sm" className="mt-3 gap-1.5">
              <Plus className="w-4 h-4" /> Create first preset
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {presets.map((preset) => {
            const rules = Array.isArray(preset.rules) ? preset.rules : [];
            return (
              <Card key={preset.id} className="border-border bg-card hover:border-primary/30 transition-colors">
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{preset.icon}</span>
                      <div>
                        <p className="font-semibold text-sm text-foreground">{preset.name}</p>
                        <p className="text-[10px] font-mono text-muted-foreground">{preset.slug}</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(preset)}>
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => setDeleteTarget(preset)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">{preset.description}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="secondary" className="text-[10px] capitalize">{preset.sector}</Badge>
                    <span>·</span>
                    <span>{rules.length} rules</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {rules.slice(0, 5).map((r) => (
                      <Badge key={r.entity_type} variant="outline" className="text-[10px] px-1.5 py-0 font-mono">
                        {r.entity_type}
                      </Badge>
                    ))}
                    {rules.length > 5 && (
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">+{rules.length - 5}</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-card border-border max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editId ? "Edit Preset" : "New Preset"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Basic fields */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Name</Label>
                <Input
                  value={form.name}
                  onChange={(e) => updateForm("name", e.target.value)}
                  placeholder="Legal Mode"
                  className="h-9"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Slug</Label>
                <Input
                  value={form.slug}
                  onChange={(e) => updateForm("slug", e.target.value)}
                  placeholder="legal-mode"
                  className="h-9 font-mono text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => updateForm("description", e.target.value)}
                placeholder="Pre-configured rules for law firms and legal departments..."
                rows={2}
                className="text-sm"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Sector</Label>
                <Select value={form.sector} onValueChange={(v) => updateForm("sector", v)}>
                  <SelectTrigger className="h-9 capitalize">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SECTORS.map((s) => (
                      <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Icon</Label>
                <Select value={form.icon} onValueChange={(v) => updateForm("icon", v)}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ICONS.map((ic) => (
                      <SelectItem key={ic} value={ic}>{ic}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Color</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={form.color}
                    onChange={(e) => updateForm("color", e.target.value)}
                    className="w-9 h-9 rounded border border-border cursor-pointer"
                  />
                  <span className="text-xs font-mono text-muted-foreground">{form.color}</span>
                </div>
              </div>
            </div>

            {/* Rules editor */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold">Rules ({form.rules.length})</Label>
                <Button type="button" variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={addRule}>
                  <Plus className="w-3 h-3" /> Add Rule
                </Button>
              </div>

              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {form.rules.map((rule, idx) => (
                  <div key={idx} className="flex items-start gap-2 p-2.5 rounded-md border border-border bg-secondary/20">
                    <GripVertical className="w-3.5 h-3.5 mt-2.5 text-muted-foreground/40 flex-shrink-0" />
                    <div className="flex-1 grid grid-cols-4 gap-2">
                      <div className="space-y-1">
                        <Label className="text-[10px] text-muted-foreground">Entity Type</Label>
                        <Input
                          value={rule.entity_type}
                          onChange={(e) => updateRule(idx, "entity_type", e.target.value)}
                          placeholder="dni"
                          className="h-7 text-xs font-mono"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] text-muted-foreground">Category</Label>
                        <Select value={rule.category} onValueChange={(v) => updateRule(idx, "category", v)}>
                          <SelectTrigger className="h-7 text-xs capitalize">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {CATEGORIES.map((c) => (
                              <SelectItem key={c} value={c} className="capitalize text-xs">{c}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] text-muted-foreground">Action</Label>
                        <Select value={rule.action} onValueChange={(v) => updateRule(idx, "action", v)}>
                          <SelectTrigger className="h-7 text-xs capitalize">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ACTIONS.map((a) => (
                              <SelectItem key={a} value={a} className="capitalize text-xs">{a}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] text-muted-foreground">Regulation</Label>
                        <Input
                          value={rule.regulation_ref || ""}
                          onChange={(e) => updateRule(idx, "regulation_ref", e.target.value)}
                          placeholder="GDPR Art.5"
                          className="h-7 text-xs"
                        />
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 mt-4 text-destructive hover:text-destructive flex-shrink-0"
                      onClick={() => removeRule(idx)}
                      disabled={form.rules.length <= 1}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
              {editId ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleteTarget?.icon} {deleteTarget?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this preset. Organizations currently using these rules won't be affected, but the preset will no longer be available for quick setup.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {deleting && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminPolicyPresets;
