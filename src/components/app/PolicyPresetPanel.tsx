import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { ChevronDown, Loader2 } from "lucide-react";

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
  name: string;
  slug: string;
  description: string;
  sector: string;
  icon: string;
  color: string;
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
  onApplied: () => void;
}

const PolicyPresetPanel = ({ orgId, userId, onApplied }: PolicyPresetPanelProps) => {
  const [presets, setPresets] = useState<Preset[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmPreset, setConfirmPreset] = useState<Preset | null>(null);
  const [applying, setApplying] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("policy_presets")
        .select("id, name, slug, description, sector, icon, color, rules")
        .order("name");
      setPresets((data as Preset[]) ?? []);
      setLoading(false);
    };
    fetch();
  }, []);

  const handleApply = async () => {
    if (!confirmPreset) return;
    setApplying(true);

    // Delete existing rules
    await supabase.from("policy_rules").delete().eq("org_id", orgId);

    // Insert preset rules
    const rows = confirmPreset.rules.map((r) => ({
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

    if (!error) {
      localStorage.setItem("privaro-lastPreset", JSON.stringify({
        slug: confirmPreset.slug,
        name: confirmPreset.name,
        icon: confirmPreset.icon,
        rulesCount: confirmPreset.rules.length,
      }));
      onApplied();
    }

    setConfirmPreset(null);
    return error;
  };

  if (loading) return null;
  if (presets.length === 0) return null;

  return (
    <>
      <div className="space-y-3">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Quick Setup</h2>
          <p className="text-xs text-muted-foreground">Apply a pre-configured policy set for your industry vertical</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {presets.map((preset) => (
            <Card key={preset.id} className="border-border bg-card hover:border-primary/30 transition-colors">
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
                  <span>{preset.rules.length} rules</span>
                  <span>·</span>
                  <span>{preset.sector}</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {preset.rules.slice(0, 4).map((r) => (
                    <Badge key={r.entity_type} variant="secondary" className="text-[10px] px-1.5 py-0 font-mono">
                      {r.entity_type}
                    </Badge>
                  ))}
                  {preset.rules.length > 4 && (
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                      +{preset.rules.length - 4}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Confirmation dialog with preview */}
      <AlertDialog open={!!confirmPreset} onOpenChange={(open) => !open && setConfirmPreset(null)}>
        <AlertDialogContent className="bg-card border-border max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Apply {confirmPreset?.icon} {confirmPreset?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will <strong>replace all current policy rules</strong> with the {confirmPreset?.name} preset ({confirmPreset?.rules.length} rules). This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {/* Rules preview */}
          <Collapsible open={previewOpen} onOpenChange={setPreviewOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1 text-xs text-muted-foreground px-0 h-auto">
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${previewOpen ? "rotate-180" : ""}`} />
                Rules that will be applied
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="mt-2 space-y-1 max-h-48 overflow-y-auto rounded-md border border-border bg-secondary/30 p-2">
                {confirmPreset?.rules.map((r, i) => (
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
