import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";
import { ChevronDown, Loader2 } from "lucide-react";

interface PresetRule {
  entity_type: string;
  category: string;
  action: string;
  regulation_ref?: string;
  priority: number;
  custom_pattern?: string;
}

export interface Preset {
  id: string;
  slug: string;
  name: string;
  description: string;
  sector: string;
  icon: string;
  color?: string;
  rules: PresetRule[];
}

const actionColors: Record<string, string> = {
  tokenise: "bg-primary/15 text-primary border-primary/30",
  pseudonymise: "bg-info/15 text-info border-info/30",
  anonymise: "bg-warning/15 text-warning border-warning/30",
  block: "bg-destructive/15 text-destructive border-destructive/30",
};

interface PolicyPresetPanelProps {
  orgId: string;
  userId: string;
  onApplied: (presetSlug: string) => void;
}

const PolicyPresetPanel = ({ orgId, userId, onApplied }: PolicyPresetPanelProps) => {
  const { toast } = useToast();
  const [presets, setPresets] = useState<Preset[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmPreset, setConfirmPreset] = useState<Preset | null>(null);
  const [applying, setApplying] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    (supabase as any)
      .from("policy_presets")
      .select("id, name, slug, description, sector, icon, color, rules")
      .order("name")
      .then(({ data }: { data: Preset[] | null }) => {
        setPresets(data ?? []);
        setLoading(false);
      });
  }, []);

  const handleApply = async () => {
    if (!confirmPreset) return;
    setApplying(true);

    const { error: delErr } = await supabase
      .from("policy_rules")
      .delete()
      .eq("org_id", orgId);

    if (delErr) {
      toast({ title: "Error", description: delErr.message, variant: "destructive" });
      setApplying(false);
      return;
    }

    const rules = Array.isArray(confirmPreset.rules) ? confirmPreset.rules : [];
    const rows = rules.map((r) => ({
      org_id: orgId,
      entity_type: r.entity_type,
      category: r.category,
      action: r.action,
      regulation_ref: r.regulation_ref || null,
      priority: r.priority,
      custom_pattern: r.custom_pattern || null,
      is_enabled: true,
      updated_by: userId,
    }));

    const { error } = await supabase.from("policy_rules").insert(rows);
    setApplying(false);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      localStorage.setItem("privaro-lastPreset", confirmPreset.slug);
      toast({ title: `${confirmPreset.name} applied`, description: `${rules.length} rules configured` });
      onApplied(confirmPreset.slug);
    }

    setConfirmPreset(null);
    setPreviewOpen(false);
  };

  if (loading) {
    return (
      <div className="space-y-3">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Quick Setup</h2>
          <p className="text-xs text-muted-foreground">Apply a pre-configured policy set for your industry vertical</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border-border bg-card">
              <CardContent className="p-4 space-y-2.5">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-4 w-24" />
                <div className="flex gap-1">
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-4 w-12" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (presets.length === 0) return null;

  return (
    <>
      <div className="space-y-3">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Quick Setup</h2>
          <p className="text-xs text-muted-foreground">Apply a pre-configured policy set for your industry vertical</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {presets.map((preset) => {
            const rules = Array.isArray(preset.rules) ? preset.rules : [];
            return (
              <Card key={preset.slug} className="border-border bg-card hover:border-primary/30 transition-colors">
                <CardContent className="p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{preset.icon}</span>
                      <span className="font-semibold text-sm text-foreground">{preset.name}</span>
                    </div>
                    <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setConfirmPreset(preset)}>
                      Apply
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">{preset.description}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{rules.length} rules</span>
                    <span>·</span>
                    <span>{preset.sector}</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {rules.slice(0, 4).map((r) => (
                      <Badge key={r.entity_type} variant="secondary" className="text-[10px] px-1.5 py-0 font-mono">
                        {r.entity_type}
                      </Badge>
                    ))}
                    {rules.length > 4 && (
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                        +{rules.length - 4}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <AlertDialog open={!!confirmPreset} onOpenChange={(open) => !open && setConfirmPreset(null)}>
        <AlertDialogContent className="bg-card border-border max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Apply {confirmPreset?.icon} {confirmPreset?.name}?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div>
                This will <strong>replace all current policy rules</strong> with the {confirmPreset?.name} preset ({Array.isArray(confirmPreset?.rules) ? confirmPreset.rules.length : 0} rules). This action cannot be undone.
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>

          <Collapsible open={previewOpen} onOpenChange={setPreviewOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1 text-xs text-muted-foreground px-0 h-auto">
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${previewOpen ? "rotate-180" : ""}`} />
                Rules that will be applied
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="mt-2 space-y-1 max-h-48 overflow-y-auto rounded-md border border-border bg-secondary/30 p-2">
                {(Array.isArray(confirmPreset?.rules) ? confirmPreset.rules : []).map((r, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <span className="font-mono text-muted-foreground">{r.entity_type}</span>
                    <span className="text-muted-foreground">→</span>
                    <span className={`inline-flex items-center px-1.5 py-0 rounded-full text-[10px] font-medium border capitalize ${actionColors[r.action] ?? "bg-muted text-muted-foreground border-border"}`}>
                      {r.action}
                    </span>
                    {r.regulation_ref && (
                      <span className="text-muted-foreground">· {r.regulation_ref}</span>
                    )}
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={applying}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleApply} disabled={applying}>
              {applying && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
              Apply Preset
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default PolicyPresetPanel;
