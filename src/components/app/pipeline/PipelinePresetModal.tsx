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

    const { data, error } = await (supabase as any).rpc("apply_preset_to_pipeline", {
      p_pipeline_id: pipelineId,
      p_sector: sector,
      p_org_id: profile.org_id,
    });

    setApplying(false);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Preset applied", description: `${data ?? 0} pipeline rules configured` });
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
