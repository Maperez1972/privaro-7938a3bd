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

const SECTORS = ["legal", "healthcare", "fintech", "hr", "general"];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pipelineId: string;
  pipelineName: string;
  pipelineSector: string;
  onApplied: () => void;
}

const PipelinePresetModal = ({ open, onOpenChange, pipelineId, pipelineName, pipelineSector, onApplied }: Props) => {
  const { profile, user } = useAuth();
  const { toast } = useToast();
  const [sector, setSector] = useState(pipelineSector);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    if (open) setSector(pipelineSector);
  }, [open, pipelineSector]);

  const handleApply = async () => {
    if (!profile?.org_id || !user?.id) return;
    setApplying(true);

    // Step 1: Delete existing pipeline rules
    const { error: delErr } = await (supabase as any)
      .from("policy_rules")
      .delete()
      .eq("pipeline_id", pipelineId)
      .eq("org_id", profile.org_id);

    if (delErr) {
      toast({ title: "Error", description: delErr.message, variant: "destructive" });
      setApplying(false);
      return;
    }

    // Step 2: Fetch preset rules
    const { data: presetData, error: presetErr } = await (supabase as any)
      .from("policy_presets")
      .select("rules")
      .eq("sector", sector)
      .limit(1)
      .maybeSingle();

    if (presetErr || !presetData) {
      toast({ title: "Error", description: presetErr?.message || "Preset not found", variant: "destructive" });
      setApplying(false);
      return;
    }

    const presetRules = Array.isArray(presetData.rules) ? presetData.rules : [];

    // Step 3: Insert new pipeline rules
    const rows = presetRules.map((r: any) => ({
      org_id: profile.org_id,
      pipeline_id: pipelineId,
      scope: "pipeline",
      entity_type: r.entity_type,
      category: r.category,
      action: r.action,
      is_enabled: true,
      priority: r.priority ?? 10,
      regulation_ref: r.regulation_ref || null,
      custom_pattern: r.custom_pattern || null,
      overrides_org: false,
      updated_by: user.id,
    }));

    const { error: insertErr } = await (supabase as any).from("policy_rules").insert(rows);
    setApplying(false);

    if (insertErr) {
      toast({ title: "Error", description: insertErr.message, variant: "destructive" });
    } else {
      toast({ title: "Preset applied", description: `${rows.length} pipeline rules configured` });
      onApplied();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Apply Policy Preset to {pipelineName}</DialogTitle>
          <DialogDescription>
            This will replace all pipeline-specific rules for this pipeline with the preset rules. Org-level rules are not affected.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 mt-2">
          <div className="space-y-2">
            <Label>Sector</Label>
            <Select value={sector} onValueChange={setSector}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {SECTORS.map(s => (
                  <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={applying}>Cancel</Button>
          <Button onClick={handleApply} disabled={applying}>
            {applying && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
            Apply Preset
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PipelinePresetModal;
