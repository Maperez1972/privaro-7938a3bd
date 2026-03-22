import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { Shield, Zap, Ban } from "lucide-react";

interface Props {
  pipelineId: string;
}

interface EffectivePolicy {
  action: string;
  pipeline_id: string | null;
  overrides_org: boolean;
  scope: string;
}

export function PolicySummaryBadge({ pipelineId }: Props) {
  const [policies, setPolicies] = useState<EffectivePolicy[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!pipelineId) return;
    (supabase as any)
      .from("pipeline_effective_policies")
      .select("action, pipeline_id, overrides_org, scope")
      .eq("pipeline_id", pipelineId)
      .then(({ data }: { data: EffectivePolicy[] | null }) => {
        setPolicies(data ?? []);
        setLoading(false);
      });
  }, [pipelineId]);

  if (loading || policies.length === 0) return null;

  const total = policies.length;
  const pipelineSpecific = policies.filter(p => p.pipeline_id === pipelineId && p.scope === "pipeline").length;
  const orgFallback = total - pipelineSpecific;
  const blocked = policies.filter(p => p.action === "block").length;
  const overrides = policies.filter(p => p.overrides_org).length;

  return (
    <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
      <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
        <Shield className="w-3 h-3" />
        <span>{total} rules · {pipelineSpecific} pipeline · {orgFallback} org</span>
      </div>
      {blocked > 0 && (
        <Badge variant="outline" className="text-[9px] px-1.5 py-0 bg-destructive/15 text-destructive border-destructive/30">
          <Ban className="w-2.5 h-2.5 mr-0.5" /> {blocked} blocked
        </Badge>
      )}
      {overrides > 0 && (
        <Badge variant="outline" className="text-[9px] px-1.5 py-0 bg-primary/15 text-primary border-primary/30">
          <Zap className="w-2.5 h-2.5 mr-0.5" /> {overrides} overrides
        </Badge>
      )}
      <button
        onClick={() => navigate("/app/pipelines")}
        className="text-[10px] text-primary hover:underline"
      >
        View policies →
      </button>
    </div>
  );
}
