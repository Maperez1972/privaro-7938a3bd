import { useState, useEffect, useCallback, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  FlaskConical, Shield, ShieldCheck, ShieldAlert, Search,
  Copy, Check, ChevronDown, ChevronUp, Eye, EyeOff,
  Loader2, Link2, GitBranch, AlertTriangle, RotateCcw, Info,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/context/LanguageContext";
import { proxyDetect, proxyProtect } from "@/lib/proxy-client";
import { SeverityBadge, StatusBadge } from "@/components/app/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface Detection {
  type: string; value: string; start: number; end: number; severity: string; category: string;
}
interface ProtectResult {
  protectedText: string; detections: Detection[]; tokenMap: Record<string, string>;
  auditLogId: string | null; requestId: string | null;
}
interface AuditLogEntry {
  id: string; event_type: string; entity_type: string; entity_category: string;
  action_taken: string; severity: string; ibs_status: string;
  ibs_certification_hash: string | null; ibs_evidence_id: string | null;
  ibs_network: string | null; ibs_certified_at: string | null;
  processing_ms: number; created_at: string;
}
interface Pipeline {
  id: string; name: string; sector: string; llm_provider: string; llm_model: string; status: string;
}
type Mode = "detect" | "protect";

const HIGHLIGHT: Record<string, string> = {
  critical: "bg-destructive/20 border-b-2 border-destructive text-foreground",
  high: "bg-warning/20 border-b-2 border-warning text-foreground",
  medium: "bg-info/15 border-b border-info text-foreground",
  low: "bg-muted border-b border-border text-foreground",
};

function HighlightedText({ text, detections }: { text: string; detections: Detection[] }) {
  if (!detections.length) return <span className="whitespace-pre-wrap text-sm font-mono leading-relaxed">{text}</span>;
  const sorted = [...detections].sort((a, b) => a.start - b.start);
  const parts: React.ReactNode[] = [];
  let cursor = 0;
  for (const d of sorted) {
    if (d.start > cursor) parts.push(<span key={`p-${cursor}`} className="whitespace-pre-wrap font-mono">{text.slice(cursor, d.start)}</span>);
    parts.push(
      <span key={`d-${d.start}`} className={`rounded px-0.5 cursor-default font-mono text-sm ${HIGHLIGHT[d.severity] ?? HIGHLIGHT.low}`} title={`${d.type} · ${d.severity}`}>
        {d.value}
      </span>
    );
    cursor = d.end;
  }
  if (cursor < text.length) parts.push(<span key="p-end" className="whitespace-pre-wrap font-mono">{text.slice(cursor)}</span>);
  return <p className="text-sm leading-relaxed">{parts}</p>;
}

function TokenRow({ token, original, revealed, onToggleReveal }: {
  token: string; original: string; revealed: boolean; onToggleReveal: (t: string) => void;
}) {
  const [copied, setCopied] = useState(false);
  const copy = () => { navigator.clipboard.writeText(token); setCopied(true); setTimeout(() => setCopied(false), 1800); };
  return (
    <div className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg border border-border bg-background text-xs font-mono">
      <span className="text-primary shrink-0">{token}</span>
      <span className="text-muted-foreground mx-1">→</span>
      <span className={`flex-1 truncate ${revealed ? "text-destructive" : "text-muted-foreground tracking-widest"}`}>
        {revealed ? original : "••••••••"}
      </span>
      <div className="flex items-center gap-1.5 shrink-0">
        <button onClick={() => onToggleReveal(token)} className="text-muted-foreground hover:text-foreground transition-colors p-0.5">
          {revealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
        </button>
        <button onClick={copy} className="text-muted-foreground hover:text-foreground transition-colors p-0.5">
          {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );
}

function IbsStatusRow({ log, timeFmt, t }: { log: AuditLogEntry; timeFmt: (s: string) => string; t: (k: string) => string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-secondary/30 transition-colors" onClick={() => setOpen(v => !v)}>
        <div className="flex items-center gap-3 min-w-0">
          <StatusBadge status={log.ibs_status} />
          <span className="text-xs font-mono text-muted-foreground truncate">{log.entity_type}</span>
          <SeverityBadge severity={log.severity} />
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-xs text-muted-foreground font-mono">{log.processing_ms} ms</span>
          {open ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
        </div>
      </div>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.18 }} className="border-t border-border">
            <div className="px-4 py-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div><span className="text-muted-foreground">{t("sandbox.ibs.event")}: </span><span className="font-mono">{log.event_type}</span></div>
              <div><span className="text-muted-foreground">{t("sandbox.ibs.action")}: </span><span className="font-mono">{log.action_taken}</span></div>
              <div><span className="text-muted-foreground">{t("sandbox.ibs.category")}: </span><span className="font-mono">{log.entity_category}</span></div>
              {log.ibs_evidence_id && <div><span className="text-muted-foreground">{t("sandbox.ibs.evidence")}: </span><span className="font-mono text-primary">{log.ibs_evidence_id}</span></div>}
              {log.ibs_certification_hash && <div className="col-span-2"><span className="text-muted-foreground">{t("sandbox.ibs.hash")}: </span><span className="font-mono text-success break-all">{log.ibs_certification_hash}</span></div>}
              {log.ibs_network && <div><span className="text-muted-foreground">{t("sandbox.ibs.network")}: </span><span className="font-mono">{log.ibs_network}</span></div>}
              {log.ibs_certified_at && <div><span className="text-muted-foreground">{t("sandbox.ibs.certifiedAt")}: </span><span className="font-mono">{timeFmt(log.ibs_certified_at)}</span></div>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const Sandbox = () => {
  const { profile } = useAuth();
  const { t, lang } = useLanguage();

  const numFmt = useCallback((n: number) => new Intl.NumberFormat(lang === "es" ? "es-ES" : "en-GB").format(n), [lang]);
  const timeFmt = useCallback((iso: string) => new Intl.DateTimeFormat(lang === "es" ? "es-ES" : "en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" }).format(new Date(iso)), [lang]);

  const [inputText, setInputText] = useState("");
  const [mode, setMode] = useState<Mode>("protect");
  const [selectedPipeline, setSelectedPipeline] = useState<string>("__none__");
  const [detections, setDetections] = useState<Detection[]>([]);
  const [protectResult, setProtectResult] = useState<ProtectResult | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMs, setProcessingMs] = useState<number | null>(null);
  const [revealedTokens, setRevealedTokens] = useState<Set<string>>(new Set());
  const [isMock, setIsMock] = useState(false);

  const { data: pipelines = [] } = useQuery<Pipeline[]>({
    queryKey: ["sandbox-pipelines", profile?.org_id],
    enabled: !!profile?.org_id,
    queryFn: async () => {
      const { data, error } = await supabase.from("pipelines")
        .select("id, name, sector, llm_provider, llm_model, status")
        .eq("org_id", profile!.org_id).eq("status", "active").order("name");
      if (error) throw error;
      return (data ?? []) as Pipeline[];
    },
  });

  useEffect(() => {
    if (!profile?.org_id) return;
    const channel = supabase.channel("sandbox-audit-rt")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "audit_logs", filter: `org_id=eq.${profile.org_id}` },
        (payload) => {
          const updated = payload.new as AuditLogEntry;
          setAuditLogs(prev => prev.map(l => l.id === updated.id ? { ...l, ...updated } : l));
          if (updated.ibs_status === "certified") toast.success(t("sandbox.toast.certified"), { description: updated.ibs_evidence_id ?? "" });
        })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [profile?.org_id, t]);

  const enrichDetections = (dets: any[], sourceText: string): Detection[] =>
    dets.map((d: any) => ({
      ...d,
      value: (d.start != null && d.end != null) ? sourceText.slice(d.start, d.end) : (d.token ?? "[protected]"),
      category: ["iban", "credit_card"].includes(d.type) ? "financial" : d.type === "health_record" ? "special" : "personal",
    }));

  const simulateIbsCertification = async (logIds: string[]) => {
    await new Promise(r => setTimeout(r, 3500));
    for (const id of logIds) {
      await supabase.from("audit_logs").update({
        ibs_status: "certified", ibs_certified_at: new Date().toISOString(),
        ibs_network: "iCommunity Blockchain",
        ibs_certification_hash: `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`,
        ibs_evidence_id: `EVD-${Date.now()}-${id.slice(0, 8)}`,
      }).eq("id", id);
    }
  };

  const insertMockAuditLogs = async (dets: Detection[], eventType: string, actionTaken: string, ms: number) => {
    if (!profile?.org_id || !dets.length) return;
    const rows = dets.map(d => ({
      org_id: profile.org_id, event_type: eventType, entity_type: d.type,
      entity_category: d.category, action_taken: actionTaken, severity: d.severity,
      pipeline_stage: "sandbox", ibs_status: "pending", processing_ms: ms,
      metadata: { source: "sandbox", mode, pipeline_id: selectedPipeline },
    }));
    const { data: inserted, error } = await supabase.from("audit_logs").insert(rows)
      .select("id, event_type, entity_type, entity_category, action_taken, severity, ibs_status, ibs_certification_hash, ibs_evidence_id, ibs_network, ibs_certified_at, processing_ms, created_at");
    if (error) { toast.error(t("sandbox.toast.error")); return; }
    if (inserted) { setAuditLogs(inserted as AuditLogEntry[]); simulateIbsCertification(inserted.map((l: any) => l.id)); }
  };

  const toggleReveal = (token: string) => {
    setRevealedTokens(prev => { const n = new Set(prev); n.has(token) ? n.delete(token) : n.add(token); return n; });
  };

  const handleReset = () => {
    setInputText(""); setDetections([]); setProtectResult(null);
    setAuditLogs([]); setProcessingMs(null); setRevealedTokens(new Set()); setIsMock(false);
  };

  const handleRun = async () => {
    if (!inputText.trim()) return;
    setIsProcessing(true); setDetections([]); setProtectResult(null);
    setAuditLogs([]); setRevealedTokens(new Set()); setIsMock(false);
    const t0 = performance.now();
    const pipelineId = selectedPipeline === "__none__" ? undefined : selectedPipeline;
    const isReal = !!import.meta.env.VITE_PROXY_URL;
    try {
      if (mode === "detect") {
        const raw = await proxyDetect(inputText, pipelineId);
        const enriched = enrichDetections(raw, inputText);
        const ms = Math.round(performance.now() - t0);
        setDetections(enriched); setProcessingMs(ms);
        if (!isReal) { setIsMock(true); await insertMockAuditLogs(enriched, "pii_detected", "detected", ms); }
      } else {
        const raw = await proxyProtect(inputText, pipelineId) as ProtectResult;
        const enriched = enrichDetections(raw.detections, inputText);
        const ms = Math.round(performance.now() - t0);
        setProtectResult({ ...raw, detections: enriched }); setDetections(enriched); setProcessingMs(ms);
        if (isReal && raw.auditLogId) {
          const { data } = await supabase.from("audit_logs")
            .select("id, event_type, entity_type, entity_category, action_taken, severity, ibs_status, ibs_certification_hash, ibs_evidence_id, ibs_network, ibs_certified_at, processing_ms, created_at")
            .eq("id", raw.auditLogId).single();
          if (data) setAuditLogs([data as AuditLogEntry]);
        } else { setIsMock(true); await insertMockAuditLogs(enriched, "pii_masked", "tokenised", ms); }
      }
    } catch (err) {
      console.error("Sandbox proxy error:", err);
      toast.error(t("sandbox.toast.proxyError"), { description: t("sandbox.toast.proxyErrorDesc") });
      const { mockProxyDetect, mockProxyProtect } = await import("@/lib/mock-data");
      const ms = Math.round(performance.now() - t0);
      if (mode === "detect") {
        const enriched = enrichDetections(mockProxyDetect(inputText), inputText);
        setDetections(enriched); setProcessingMs(ms); setIsMock(true);
        await insertMockAuditLogs(enriched, "pii_detected", "detected", ms);
      } else {
        const raw = mockProxyProtect(inputText) as ProtectResult;
        const enriched = enrichDetections(raw.detections, inputText);
        setProtectResult({ ...raw, detections: enriched }); setDetections(enriched); setProcessingMs(ms); setIsMock(true);
        await insertMockAuditLogs(enriched, "pii_masked", "tokenised", ms);
      }
    } finally { setIsProcessing(false); }
  };

  const criticalCount = detections.filter(d => d.severity === "critical").length;
  const tokenEntries = protectResult ? Object.entries(protectResult.tokenMap) : [];
  const activePipeline = pipelines.find(p => p.id === selectedPipeline);

  return (
    <div className="p-6 space-y-6 max-w-6xl">

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <FlaskConical className="h-6 w-6 text-primary shrink-0" />
          <div>
            <h1 className="text-xl font-bold text-foreground">{t("sandbox.title")}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{t("sandbox.subtitle")}</p>
          </div>
        </div>
        {isMock && (
          <div className="flex items-center gap-2 text-xs text-warning bg-warning/10 border border-warning/30 rounded-lg px-3 py-2">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            {t("sandbox.mockWarning")}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex rounded-lg border border-border overflow-hidden text-sm">
          {(["detect", "protect"] as Mode[]).map(m => (
            <button key={m} onClick={() => setMode(m)}
              className={`px-4 py-2 font-medium transition-colors ${mode === m ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"}`}>
              {m === "detect"
                ? <span className="flex items-center gap-1.5"><Search className="w-3.5 h-3.5" />{t("sandbox.mode.detect")}</span>
                : <span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5" />{t("sandbox.mode.protect")}</span>}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <GitBranch className="w-4 h-4 text-muted-foreground" />
          <Select value={selectedPipeline} onValueChange={setSelectedPipeline}>
            <SelectTrigger className="w-56 h-9 text-sm"><SelectValue placeholder={t("sandbox.pipeline.placeholder")} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">{t("sandbox.pipeline.none")}</SelectItem>
              {pipelines.map(p => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name} <span className="ml-1 text-xs text-muted-foreground">{p.llm_provider}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1" />
        <button onClick={handleReset} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
          <RotateCcw className="w-3.5 h-3.5" />{t("sandbox.reset")}
        </button>
      </div>

      {/* Pipeline info */}
      {activePipeline && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-secondary/40 rounded-lg px-3 py-2 border border-border w-fit">
          <Info className="w-3.5 h-3.5 text-primary" />
          <span className="font-medium text-foreground">{activePipeline.name}</span>
          <span>·</span><span>{activePipeline.llm_provider} / {activePipeline.llm_model}</span>
          <span>·</span><span className="capitalize">{activePipeline.sector}</span>
        </div>
      )}

      {/* Editor + Output */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center justify-between">
              {t("sandbox.input.title")}
              <span className="text-xs font-normal text-muted-foreground">{numFmt(inputText.length)} {t("sandbox.chars")}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <textarea
              value={inputText} onChange={e => setInputText(e.target.value)}
              className="w-full h-56 bg-background border border-border rounded-lg p-3 text-sm font-mono text-foreground resize-none focus:outline-none focus:ring-1 focus:ring-primary/50 placeholder:text-muted-foreground leading-relaxed"
              placeholder={t("sandbox.input.placeholder")} spellCheck={false}
            />
            <Button onClick={handleRun} disabled={isProcessing || !inputText.trim()} className="w-full gap-2">
              {isProcessing ? <><Loader2 className="w-4 h-4 animate-spin" />{t("sandbox.running")}</>
                : mode === "detect" ? <><Search className="w-4 h-4" />{t("sandbox.run.detect")}</>
                : <><ShieldCheck className="w-4 h-4" />{t("sandbox.run.protect")}</>}
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center justify-between">
              {mode === "protect" && protectResult ? t("sandbox.output.protected") : t("sandbox.output.detections")}
              {processingMs !== null && <span className="text-xs font-normal text-muted-foreground font-mono">{numFmt(processingMs)} ms</span>}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AnimatePresence mode="wait">
              {!detections.length && !isProcessing && (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="h-56 flex flex-col items-center justify-center gap-3 text-muted-foreground">
                  <FlaskConical className="w-10 h-10 opacity-20" />
                  <p className="text-sm text-center">{t("sandbox.output.empty")}</p>
                </motion.div>
              )}
              {isProcessing && (
                <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="h-56 flex flex-col items-center justify-center gap-3">
                  <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                  <p className="text-sm text-muted-foreground">{t("sandbox.running")}</p>
                </motion.div>
              )}
              {!isProcessing && mode === "protect" && protectResult && (
                <motion.div key="protect-result" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                  <div className="bg-background border border-border rounded-lg p-3 min-h-32 max-h-56 overflow-y-auto">
                    <HighlightedText text={inputText} detections={detections} />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {detections.map((d, i) => (
                      <span key={i} className={`text-xs px-2 py-0.5 rounded-full border font-mono ${
                        d.severity === "critical" ? "bg-destructive/10 border-destructive/30 text-destructive"
                        : d.severity === "high" ? "bg-warning/10 border-warning/30 text-warning"
                        : "bg-info/10 border-info/30 text-info"}`}>
                        {d.type}
                      </span>
                    ))}
                  </div>
                </motion.div>
              )}
              {!isProcessing && mode === "detect" && detections.length > 0 && (
                <motion.div key="detect-result" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-2 max-h-72 overflow-y-auto">
                  {detections.map((d, i) => (
                    <div key={i} className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg border border-border bg-background">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <SeverityBadge severity={d.severity} />
                        <span className="text-xs font-mono text-muted-foreground">{d.type}</span>
                      </div>
                      <span className="text-xs font-mono text-destructive truncate max-w-36">{d.value}</span>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </div>

      {/* Token map */}
      <AnimatePresence>
        {protectResult && tokenEntries.length > 0 && (
          <motion.div key="token-map" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <Card className="border-border bg-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Eye className="w-4 h-4 text-primary" />
                  {t("sandbox.tokenmap.title")}
                  <span className="text-xs font-normal text-muted-foreground ml-1">— {t("sandbox.tokenmap.subtitle")}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {tokenEntries.map(([token, original]) => (
                    <TokenRow key={token} token={token} original={original} revealed={revealedTokens.has(token)} onToggleReveal={toggleReveal} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* iBS Audit log */}
      <AnimatePresence>
        {auditLogs.length > 0 && (
          <motion.div key="audit-logs" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <Card className="border-border bg-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Link2 className="w-4 h-4 text-primary" />
                  {t("sandbox.ibs.title")}
                  <span className="ml-auto text-xs font-normal text-muted-foreground font-mono">
                    {auditLogs[0] && timeFmt(auditLogs[0].created_at)}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {auditLogs.map(log => <IbsStatusRow key={log.id} log={log} timeFmt={timeFmt} t={t} />)}
                <p className="text-xs text-muted-foreground pt-1">{t("sandbox.ibs.note")}</p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats */}
      <AnimatePresence>
        {detections.length > 0 && processingMs !== null && !isProcessing && (
          <motion.div key="stats" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { icon: ShieldAlert, label: t("sandbox.stat.detected"), value: numFmt(detections.length), color: "text-primary" },
              { icon: ShieldCheck, label: t("sandbox.stat.critical"), value: numFmt(criticalCount), color: "text-destructive" },
              { icon: FlaskConical, label: t("sandbox.stat.latency"), value: `${numFmt(processingMs)} ms`, color: "text-warning" },
              { icon: Shield, label: t("sandbox.stat.coverage"), value: detections.length ? "100%" : "—", color: "text-success" },
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
                <Icon className={`w-5 h-5 shrink-0 ${color}`} />
                <div><p className="text-lg font-bold">{value}</p><p className="text-xs text-muted-foreground">{label}</p></div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Sandbox;
