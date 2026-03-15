import { useState, useEffect } from "react";
import { proxyDetect, proxyProtect } from "@/lib/proxy-client";
import { SeverityBadge, StatusBadge } from "@/components/app/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Shield, Search, FlaskConical, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const SAMPLE_TEXT = `Dear Dr. García,

Patient María López Fernández (DNI: 12345678Z) was admitted on March 5th. Please transfer €2,500 to IBAN ES91 2100 0418 4502 0005 1332 for the consultation fee.

Her email is maria.lopez@gmail.com and she can be reached at 612-34-5678 for follow-up.

Best regards,
Juan Martínez`;

interface AuditLogEntry {
  id: string;
  event_type: string;
  entity_type: string;
  entity_category: string;
  action_taken: string;
  severity: string;
  ibs_status: string;
  processing_ms: number;
  created_at: string;
}

const Sandbox = () => {
  const { profile } = useAuth();
  const [text, setText] = useState(SAMPLE_TEXT);
  const [mode, setMode] = useState<"detect" | "protect">("detect");
  const [result, setResult] = useState<{ protectedText: string; detections: any[]; tokenMap: Record<string, string> } | null>(null);
  const [detections, setDetections] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Subscribe to realtime updates on audit_logs for iBS certification
  useEffect(() => {
    if (!profile?.org_id) return;

    const channel = supabase
      .channel("sandbox-ibs")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "audit_logs",
          filter: `org_id=eq.${profile.org_id}`,
        },
        (payload) => {
          const updated = payload.new as AuditLogEntry;
          setAuditLogs((prev) =>
            prev.map((log) =>
              log.id === updated.id ? { ...log, ibs_status: updated.ibs_status } : log
            )
          );
          if (updated.ibs_status === "certified") {
            toast.success(`iBS certified: ${updated.entity_type}`, {
              description: "Blockchain evidence recorded",
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.org_id]);

  const isProxyReal = !!import.meta.env.VITE_PROXY_URL;

  const insertClientAuditLogs = async (eventType: string, actionTaken: string, dets: any[], startMs: number) => {
    if (!profile?.org_id || dets.length === 0) return;
    const processingMs = Math.round(performance.now() - startMs);
    const rows = dets.map((det: any) => ({
      org_id: profile.org_id,
      event_type: eventType,
      entity_type: det.type,
      entity_category: det.category,
      action_taken: actionTaken,
      severity: det.severity,
      pipeline_stage: "sandbox",
      ibs_status: "pending",
      processing_ms: processingMs,
      metadata: { source: "sandbox", mode: eventType === "pii_detected" ? "detect" : "protect" },
    }));

    const { data: inserted, error } = await supabase
      .from("audit_logs")
      .insert(rows)
      .select("id, event_type, entity_type, entity_category, action_taken, severity, ibs_status, processing_ms, created_at");

    if (error) {
      toast.error("Error saving audit logs");
      console.error(error);
    } else if (inserted) {
      setAuditLogs(inserted as AuditLogEntry[]);
      simulateIbsCertification(inserted.map((l: any) => l.id));
    }
  };

  const handleAnalyze = async () => {
    setIsProcessing(true);
    const startMs = performance.now();
    try {
      if (mode === "detect") {
        const d = await proxyDetect(text);
        setDetections(d);
        setResult(null);

        // Only insert audit_logs from client in mock mode
        if (!isProxyReal) {
          await insertClientAuditLogs("pii_detected", "detected", d, startMs);
        }
      } else {
        const r = await proxyProtect(text);
        setResult(r);
        setDetections(r.detections);

        // Only insert audit_logs from client in mock mode
        if (!isProxyReal) {
          await insertClientAuditLogs("pii_masked", "tokenised", r.detections, startMs);
        }

        // In real proxy mode, use audit_log_id from response for iBS status
        if (isProxyReal && (r as any).audit_log_id) {
          const { data: logData } = await supabase
            .from("audit_logs")
            .select("id, event_type, entity_type, entity_category, action_taken, severity, ibs_status, processing_ms, created_at")
            .eq("id", (r as any).audit_log_id);
          if (logData) setAuditLogs(logData as AuditLogEntry[]);
        }
      }
    } catch (err) {
      console.error("Proxy error:", err);
      toast.error("Error connecting to proxy. Using mock data instead.", {
        description: "Check CORS configuration on your Railway proxy.",
      });
      const { mockProxyDetect, mockProxyProtect } = await import("@/lib/mock-data");
      if (mode === "detect") {
        const d = mockProxyDetect(text);
        setDetections(d);
        setResult(null);
      } else {
        const r = mockProxyProtect(text);
        setResult(r);
        setDetections(r.detections);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const simulateIbsCertification = (logIds: string[]) => {
    setTimeout(async () => {
      for (const id of logIds) {
        await supabase
          .from("audit_logs")
          .update({
            ibs_status: "certified",
            ibs_certified_at: new Date().toISOString(),
            ibs_network: "iCommunity Blockchain",
            ibs_certification_hash: `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`,
            ibs_evidence_id: `EVD-${Date.now()}-${id.slice(0, 8)}`,
          })
          .eq("id", id);
      }
    }, 5000);
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <div className="flex items-center gap-3">
          <FlaskConical className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">PII Sandbox</h1>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Test PII detection and protection in real-time
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Input */}
        <Card className="border-border bg-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Input Text</CardTitle>
              <div className="flex gap-1">
                <button
                  onClick={() => setMode("detect")}
                  className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                    mode === "detect" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                  }`}
                >
                  Detect
                </button>
                <button
                  onClick={() => setMode("protect")}
                  className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                    mode === "protect" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                  }`}
                >
                  Protect
                </button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={12}
              className="font-mono text-sm bg-background border-border resize-none"
              placeholder="Paste text with PII to analyze..."
            />
            <Button onClick={handleAnalyze} disabled={isProcessing} className="w-full gap-2">
              {isProcessing ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Processing…</>
              ) : mode === "detect" ? (
                <><Search className="w-4 h-4" /> Detect PII</>
              ) : (
                <><Shield className="w-4 h-4" /> Protect & Tokenise</>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Output */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-base">
              {mode === "protect" && result ? "Protected Output" : "Detection Results"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {mode === "protect" && result ? (
              <div className="bg-background rounded-lg p-4 border border-border">
                <pre className="text-sm font-mono whitespace-pre-wrap text-success">
                  {result.protectedText}
                </pre>
              </div>
            ) : null}

            {detections.length > 0 ? (
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {detections.length} entities detected
                </p>
                {detections.map((d: any, i: number) => (
                  <div
                    key={i}
                    className="flex items-center justify-between bg-background rounded-lg px-3 py-2 border border-border"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs bg-secondary px-2 py-0.5 rounded font-mono">{d.type}</span>
                      <span className="text-sm font-mono text-destructive">{d.value}</span>
                    </div>
                    <SeverityBadge severity={d.severity} />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                Click Detect or Protect to analyze the text
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* iBS Certification Status */}
      {auditLogs.length > 0 && (
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              iBS Blockchain Certification
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-muted-foreground border-b border-border">
                    <th className="pb-3 font-medium">Entity</th>
                    <th className="pb-3 font-medium">Event</th>
                    <th className="pb-3 font-medium">Action</th>
                    <th className="pb-3 font-medium">Severity</th>
                    <th className="pb-3 font-medium">Blockchain Status</th>
                    <th className="pb-3 font-medium">Latency</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map((log) => (
                    <tr
                      key={log.id}
                      className="border-b border-border/50 hover:bg-secondary/30 transition-colors"
                    >
                      <td className="py-3">
                        <span className="text-xs bg-secondary px-2 py-0.5 rounded font-mono">
                          {log.entity_type}
                        </span>
                      </td>
                      <td className="py-3 font-mono text-xs">{log.event_type}</td>
                      <td className="py-3 text-xs">{log.action_taken}</td>
                      <td className="py-3">
                        <SeverityBadge severity={log.severity} />
                      </td>
                      <td className="py-3">
                        <StatusBadge status={log.ibs_status} />
                      </td>
                      <td className="py-3 text-xs font-mono">{log.processing_ms}ms</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Sandbox;
