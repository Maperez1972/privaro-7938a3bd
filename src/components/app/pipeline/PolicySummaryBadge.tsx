import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { Shield, Zap, Ban } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface Props {
  pipelineId: string;
}

interface PolicySummary {
  total_rules: number;
  pipeline_rules: number;
  org_fallback: number;
  blocked_count: number;
  override_count: number;
  has_custom: boolean;
}

export function PolicySummaryBadge({ pipelineId }: Props) {
  const { t } = useLanguage();
  const [summary, setSummary] = useState<PolicySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!pipelineId) return;
    (supabase as any)
      .rpc("get_pipeline_policy_summary", { p_pipeline_id: pipelineId })
      .then(({ data, error }: { data: PolicySummary | null; error: any }) => {
        if (!error && data) setSummary(data);
        setLoading(false);
      });
  }, [pipelineId]);

  if (loading || !summary || summary.total_rules === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
      <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
        <Shield className="w-3 h-3" />
        <span>{summary.total_rules} {t("app.pipelines.policySummary.rules")} · {summary.pipeline_rules} {t("app.pipelines.policySummary.pipeline")} · {summary.org_fallback} {t("app.pipelines.policySummary.org")}</span>
      </div>
      {summary.blocked_count > 0 && (
        <Badge variant="outline" className="text-[9px] px-1.5 py-0 bg-destructive/15 text-destructive border-destructive/30">
          <Ban className="w-2.5 h-2.5 mr-0.5" /> {summary.blocked_count} {t("app.pipelines.policySummary.blocked")}
        </Badge>
      )}
      {summary.override_count > 0 && (
        <Badge variant="outline" className="text-[9px] px-1.5 py-0 bg-primary/15 text-primary border-primary/30">
          <Zap className="w-2.5 h-2.5 mr-0.5" /> {summary.override_count} {t("app.pipelines.policySummary.overrides")}
        </Badge>
      )}
      <button
        onClick={() => navigate("/app/pipelines")}
        className="text-[10px] text-primary hover:underline"
      >
        {t("app.pipelines.policySummary.viewPolicies")}
      </button>
    </div>
  );
}
