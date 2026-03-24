import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ShieldCheck, ShieldAlert, Loader2 } from "lucide-react";

type AgentStep = {
  id: string;
  step_index: number;
  role: string;
  step_type: string;
  pii_detected: number;
  pii_masked: number;
  risk_score: number;
  gdpr_compliant: boolean;
  processing_ms: number;
  created_at: string;
};

interface Props {
  agentRunId: string;
}

export default function AgentRunDetail({ agentRunId }: Props) {
  const [steps, setSteps] = useState<AgentStep[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (supabase as any)
      .from("agent_steps")
      .select("id, step_index, role, step_type, pii_detected, pii_masked, risk_score, gdpr_compliant, processing_ms, created_at")
      .eq("agent_run_id", agentRunId)
      .order("step_index", { ascending: true })
      .then(({ data, error }: { data: any[] | null; error: any }) => {
        if (data) setSteps(data);
        setLoading(false);
      });
  }, [agentRunId]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-4 px-6 text-sm text-muted-foreground">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading steps…
      </div>
    );
  }

  if (steps.length === 0) {
    return (
      <div className="py-4 px-6 text-sm text-muted-foreground">
        No steps recorded for this run.
      </div>
    );
  }

  return (
    <div className="px-6 py-4 space-y-2">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
        Agent Steps ({steps.length})
      </p>
      <div className="grid gap-2">
        {steps.map((step) => {
          const leaked = step.pii_detected - step.pii_masked;
          const riskLevel = step.risk_score >= 0.7 ? "high" : step.risk_score >= 0.4 ? "medium" : "low";
          return (
            <div
              key={step.id}
              className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-lg border border-border bg-secondary/30 px-4 py-2.5 text-xs"
            >
              {/* Step index */}
              <span className="font-mono font-semibold text-foreground w-8">
                #{step.step_index}
              </span>

              {/* Type & role */}
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 capitalize">
                {step.step_type}
              </Badge>
              <span className="text-muted-foreground capitalize">{step.role}</span>

              {/* PII stats */}
              <div className="flex items-center gap-1 ml-auto">
                <ShieldCheck className="w-3.5 h-3.5 text-success" />
                <span className="text-success font-medium">{step.pii_masked}</span>
                <span className="text-muted-foreground">/</span>
                <span className="font-medium">{step.pii_detected}</span>
              </div>

              {leaked > 0 && (
                <div className="flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5 text-destructive" />
                  <span className="text-destructive font-medium">{leaked} leaked</span>
                </div>
              )}

              {/* Risk */}
              <span
                className={cn(
                  "inline-flex items-center px-2 py-0.5 rounded-full font-medium border",
                  riskLevel === "high" && "bg-destructive/15 text-destructive border-destructive/30",
                  riskLevel === "medium" && "bg-warning/15 text-warning border-warning/30",
                  riskLevel === "low" && "bg-success/15 text-success border-success/30"
                )}
              >
                {(step.risk_score * 100).toFixed(0)}%
              </span>

              {/* GDPR */}
              <Badge
                variant={step.gdpr_compliant ? "outline" : "destructive"}
                className="text-[10px] px-1.5 py-0"
              >
                {step.gdpr_compliant ? "GDPR ✓" : "GDPR ✗"}
              </Badge>

              {/* Latency */}
              <span className="text-muted-foreground">{step.processing_ms}ms</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
