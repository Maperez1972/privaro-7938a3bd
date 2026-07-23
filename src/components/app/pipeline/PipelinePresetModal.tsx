import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/context/LanguageContext";

interface PolicyPreset {
  id: string;
  name: string;
  slug: string;
  sector: string;
  icon: string;
  color: string;
  description: string;
  rules: unknown[] | null;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pipelineId: string;
  pipelineName: string;
  pipelineSector: string;
  onApplied: () => void;
}

const PipelinePresetModal = ({ open, onOpenChange, pipelineId, pipelineName, pipelineSector, onApplied }: Props) => {
  const { t } = useLanguage();
  const { profile, user } = useAuth();
  const { toast } = useToast();
  const [sector, setSector] = useState(pipelineSector);
  const [applying, setApplying] = useState(false);
  const [presets, setPresets] = useState<PolicyPreset[]>([]);
  const [loadingPresets, setLoadingPresets] = useState(false);

  useEffect(() => {
    if (!open) return;
    setSector(pipelineSector);
    setLoadingPresets(true);
    (supabase as any)
      .from("policy_presets")
      .select("id, name, slug, sector, icon, color, description, rules")
      .order("name", { ascending: true })
      .then(({ data }: { data: PolicyPreset[] | null }) => {
        const list = data ?? [];
        setPresets(list);
        if (!list.some((p) => p.sector === pipelineSector) && list.length > 0) {
          setSector(list[0].sector);
        }
        setLoadingPresets(false);
      });
  }, [open, pipelineSector]);

  const selectedPreset = presets.find((p) => p.sector === sector);

  const handleApply = async () => {
    if (!profile?.org_id || !user?.id) return;
    setApplying(true);

    const { data, error } = await (supabase as any).rpc("apply_preset_to_pipeline", {
      p_pipeline_id: pipelineId,
      p_sector: sector,
      p_org_id: profile.org_id,
    });

    setApplying(false);

    if (error) {
      toast({ title: t("app.pipelines.presetModal.error"), description: error.message, variant: "destructive" });
    } else {
      toast({ title: t("app.pipelines.presetModal.applied"), description: `${data ?? 0} ${t("app.pipelines.presetModal.rulesConfigured")}` });
      onApplied();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("app.pipelines.presetModal.title")} {pipelineName}</DialogTitle>
          <DialogDescription>
            {t("app.pipelines.presetModal.description")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 mt-2">
          <div className="space-y-2">
            <Label>{t("app.pipelines.presetModal.preset")}</Label>
            {loadingPresets ? (
              <Skeleton className="h-10 w-full rounded-md" />
            ) : (
              <>
                <Select value={sector} onValueChange={setSector}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {presets.map((p) => (
                      <SelectItem key={p.sector} value={p.sector}>
                        <span>{p.icon} {p.name}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedPreset?.description && (
                  <p className="text-xs text-muted-foreground mt-1">{selectedPreset.description}</p>
                )}
                {selectedPreset && Array.isArray(selectedPreset.rules) && selectedPreset.rules.length > 0 && (() => {
                  const rules = selectedPreset.rules as Array<{ action?: string }>;
                  const counts: Record<string, number> = {};
                  rules.forEach(r => { const a = r.action || "other"; counts[a] = (counts[a] || 0) + 1; });
                  const actionColors: Record<string, string> = {
                    block: "bg-destructive text-destructive-foreground",
                    anonymise: "bg-[hsl(38,92%,50%)] text-white",
                    tokenise: "bg-primary text-primary-foreground",
                    pseudonymise: "bg-[hsl(258,56%,52%)] text-white",
                  };
                  return (
                    <div className="flex flex-wrap items-center gap-1.5 mt-1">
                      <span className="text-xs font-medium text-primary">{rules.length} {t("app.pipelines.presetModal.rulesColon")}</span>
                      {Object.entries(counts).map(([action, count]) => (
                        <span key={action} className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${actionColors[action] || "bg-muted text-muted-foreground"}`}>
                          {count} {action}
                        </span>
                      ))}
                    </div>
                  );
                })()}
              </>
            )}
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={applying}>{t("app.pipelines.presetModal.cancel")}</Button>
          <Button onClick={handleApply} disabled={applying || loadingPresets || presets.length === 0}>
            {applying && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
            {t("app.pipelines.presetModal.applyPreset")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PipelinePresetModal;
