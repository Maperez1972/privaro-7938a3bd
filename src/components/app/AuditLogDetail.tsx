import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

interface Props {
  logId: string;
  riskScore: number | null;
}

interface PiiDetection {
  entity_type: string;
  confidence_score: number;
  detector_version: string;
  risk_score: number | null;
  decision_reason: string | null;
  token_ref: string | null;
}

export const AuditLogDetail = ({ logId, riskScore }: Props) => {
  const { data: detections, isLoading } = useQuery({
    queryKey: ["pii-detections", logId],
    queryFn: async (): Promise<PiiDetection[]> => {
      const { data } = await (supabase
        .from("pii_detections")
        .select("entity_type, confidence_score, detector_version, risk_score, decision_reason, token_ref") as any)
        .eq("audit_log_id", logId);
      return data ?? [];
    },
  });

  const riskLabel = riskScore == null ? "—" : riskScore >= 0.7 ? "HIGH RISK" : riskScore >= 0.4 ? "MEDIUM" : "LOW";
  const riskColor = riskScore == null ? "text-muted-foreground" : riskScore >= 0.7 ? "text-destructive" : riskScore >= 0.4 ? "text-amber-400" : "text-green-400";
  const riskBg = riskScore == null ? "bg-muted" : riskScore >= 0.7 ? "bg-destructive/15" : riskScore >= 0.4 ? "bg-amber-500/15" : "bg-green-500/15";

  return (
    <div className="px-6 py-4 bg-secondary/20 border-b border-border">
      <div className="max-w-4xl space-y-4">
        {/* Risk Analysis Header */}
        <div>
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Risk Analysis</h4>
          <div className="flex items-center gap-3">
            <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-bold ${riskBg} ${riskColor}`}>
              {riskScore != null ? `${(riskScore * 100).toFixed(1)}%` : "—"}
            </span>
            <span className={`text-sm font-semibold ${riskColor}`}>{riskLabel}</span>
          </div>
        </div>

        {/* PII Detections */}
        <div>
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">PII Detections</h4>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-6 w-full max-w-md" />
              ))}
            </div>
          ) : detections && detections.length > 0 ? (
            <div className="space-y-1.5">
              {detections.map((det, i) => (
                <div key={i} className="flex items-center gap-3 text-xs">
                  {det.token_ref && (
                    <span className="font-mono text-muted-foreground">[{det.token_ref}]</span>
                  )}
                  <span className="font-mono bg-secondary px-1.5 py-0.5 rounded">{det.entity_type}</span>
                  <span className="text-muted-foreground">
                    · weight {(det.confidence_score * 100).toFixed(0)}%
                    · {det.detector_version || "unknown"}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">No PII detections recorded for this event</p>
          )}
        </div>

        {/* Decision */}
        {detections && detections.length > 0 && detections[0].decision_reason && (
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Decision</h4>
            <p className="text-xs text-muted-foreground font-mono">{detections[0].decision_reason}</p>
          </div>
        )}
      </div>
    </div>
  );
};
