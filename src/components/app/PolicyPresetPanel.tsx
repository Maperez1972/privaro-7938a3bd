import { useState } from "react";
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
  slug: string;
  name: string;
  description: string;
  sector: string;
  icon: string;
  rules: PresetRule[];
}

export const PRESETS: Preset[] = [
  {
    slug: "legal",
    name: "Legal Mode",
    description: "Privacy rules for law firms and legal departments. Covers personal identifiers, financial data, and contact information with GDPR-aligned actions.",
    sector: "Legal",
    icon: "⚖️",
    rules: [
      { entity_type: "full_name", category: "personal", action: "tokenise", regulation_ref: "GDPR Art.5", priority: 10 },
      { entity_type: "dni", category: "personal", action: "tokenise", regulation_ref: "GDPR Art.9", priority: 5 },
      { entity_type: "iban", category: "financial", action: "tokenise", regulation_ref: "PSD2", priority: 5 },
      { entity_type: "email", category: "personal", action: "pseudonymise", regulation_ref: "GDPR Art.5", priority: 15 },
      { entity_type: "phone", category: "personal", action: "pseudonymise", regulation_ref: "GDPR Art.5", priority: 15 },
      { entity_type: "address", category: "personal", action: "anonymise", regulation_ref: "GDPR Art.5", priority: 20 },
    ],
  },
  {
    slug: "healthcare",
    name: "Healthcare Mode",
    description: "Strict privacy rules for healthcare organizations. Blocks special category data and tokenises personal identifiers per HIPAA and GDPR Art.9.",
    sector: "Healthcare",
    icon: "🏥",
    rules: [
      { entity_type: "full_name", category: "personal", action: "tokenise", regulation_ref: "HIPAA §164.502", priority: 5 },
      { entity_type: "medical_record", category: "special", action: "block", regulation_ref: "GDPR Art.9", priority: 1 },
      { entity_type: "diagnosis", category: "special", action: "anonymise", regulation_ref: "GDPR Art.9", priority: 3 },
      { entity_type: "ssn", category: "personal", action: "tokenise", regulation_ref: "HIPAA", priority: 5 },
      { entity_type: "email", category: "personal", action: "pseudonymise", regulation_ref: "GDPR Art.5", priority: 15 },
    ],
  },
  {
    slug: "fintech",
    name: "Fintech Mode",
    description: "Financial-grade privacy rules for banks, payment processors, and fintech companies. Prioritizes tokenisation with PSD2 and PCI-DSS compliance.",
    sector: "Fintech",
    icon: "🏦",
    rules: [
      { entity_type: "iban", category: "financial", action: "tokenise", regulation_ref: "PSD2 Art.94", priority: 1 },
      { entity_type: "credit_card", category: "financial", action: "tokenise", regulation_ref: "PCI-DSS", priority: 1 },
      { entity_type: "full_name", category: "personal", action: "pseudonymise", regulation_ref: "GDPR Art.5", priority: 10 },
      { entity_type: "dni", category: "personal", action: "tokenise", regulation_ref: "AML Directive", priority: 5 },
      { entity_type: "email", category: "personal", action: "pseudonymise", regulation_ref: "GDPR Art.5", priority: 15 },
      { entity_type: "phone", category: "personal", action: "pseudonymise", regulation_ref: "GDPR Art.5", priority: 15 },
    ],
  },
];

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
  const [confirmPreset, setConfirmPreset] = useState<Preset | null>(null);
  const [applying, setApplying] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const handleApply = async () => {
    if (!confirmPreset) return;
    setApplying(true);

    // Delete existing rules
    const { error: delErr } = await supabase
      .from("policy_rules")
      .delete()
      .eq("org_id", orgId);

    if (delErr) {
      toast({ title: "Error", description: delErr.message, variant: "destructive" });
      setApplying(false);
      return;
    }

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

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      localStorage.setItem("privaro-lastPreset", confirmPreset.slug);
      toast({ title: `${confirmPreset.name} applied`, description: `${confirmPreset.rules.length} rules configured` });
      onApplied(confirmPreset.slug);
    }

    setConfirmPreset(null);
    setPreviewOpen(false);
  };

  return (
    <>
      <div className="space-y-3">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Quick Setup</h2>
          <p className="text-xs text-muted-foreground">Apply a pre-configured policy set for your industry vertical</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {PRESETS.map((preset) => (
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
            <AlertDialogDescription asChild>
              <div>
                This will <strong>replace all current policy rules</strong> with the {confirmPreset?.name} preset ({confirmPreset?.rules.length} rules). This action cannot be undone.
              </div>
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
