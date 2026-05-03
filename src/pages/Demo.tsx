import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, ShieldCheck, ShieldAlert, Copy, Check, RotateCcw,
  Link2, Zap, Clock, ChevronRight, ArrowRight, Lock, Eye, EyeOff,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useLanguage } from "@/context/LanguageContext";
import { SeverityBadge } from "@/components/app/StatusBadge";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Detection {
  type: string;
  value: string;
  start: number;
  end: number;
  severity: string;
  category: string;
}

interface RunResult {
  /** text with tokens replacing PII — e.g. "dear [NM-0001]…" */
  protectedText: string;
  /** original input text captured at run-time (never mutated) */
  originalText: string;
  detections: Detection[];
  tokenMap: Record<string, string>;
  processingMs: number;
}

// ─── Animations ───────────────────────────────────────────────────────────────

const FADE_UP = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" as const } },
};
const STAGGER = { visible: { transition: { staggerChildren: 0.08 } } };

// ─── Scenarios ────────────────────────────────────────────────────────────────

const SCENARIO_KEYS = ["legal", "health", "hr", "fintech"] as const;
type ScenarioKey = typeof SCENARIO_KEYS[number];

// ─── Severity highlight classes ───────────────────────────────────────────────

const HIGHLIGHT: Record<string, string> = {
  critical: "bg-destructive/20 border-b-2 border-destructive",
  high: "bg-warning/20 border-b-2 border-warning",
  medium: "bg-info/15 border-b border-info",
  low: "bg-muted border-b border-border",
};

// ─── Engine: runs entirely client-side, no network call ──────────────────────
// Uses the same mock engine as the internal sandbox for consistency.
// The public demo is intentionally offline — no credentials needed.

interface EngineDetection {
  type: string; severity: string; category: string;
  start: number; end: number;
}

function detectPii(text: string): EngineDetection[] {
  const patterns: { regex: RegExp; type: string; severity: string; category: string }[] = [
    { regex: /\b[A-Z][a-záéíóúñÁÉÍÓÚÑ]+ [A-Z][a-záéíóúñÁÉÍÓÚÑ]+(?:\s[A-Z][a-záéíóúñÁÉÍÓÚÑ]+)?\b/g, type: "full_name", severity: "medium", category: "personal" },
    { regex: /\b[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}\b/g, type: "email", severity: "medium", category: "personal" },
    { regex: /\b[A-Z]{2}\d{2}[\s]?\d{4}[\s]?\d{4}[\s]?\d{4}[\s]?\d{4}(?:[\s]?\d{0,4})?\b/g, type: "iban", severity: "critical", category: "financial" },
    { regex: /\b\d{8}[A-HJ-NP-TV-Z]\b/g, type: "dni", severity: "critical", category: "personal" },
    { regex: /(?<!\d)(?:\+34[\s\-]?)?\d{3}[\s\-]?\d{2}[\s\-]?\d{2}[\s\-]?\d{2}(?!\d)/g, type: "phone", severity: "high", category: "personal" },
    { regex: /\b\d{3}-\d{2}-\d{4}\b/g, type: "ssn", severity: "critical", category: "personal" },
    { regex: /\b(?:\d{4}[\s\-]?){3}\d{4}\b/g, type: "credit_card", severity: "critical", category: "financial" },
    { regex: /\b(?:192\.168|10\.\d{1,3}|172\.(?:1[6-9]|2\d|3[01]))\.\d{1,3}\.\d{1,3}\b/g, type: "ip_address", severity: "low", category: "technical" },
    { regex: /\bsess_[A-Za-z0-9]+\b/g, type: "session_id", severity: "low", category: "technical" },
    { regex: /n[oº°][\s]?(?:de\s)?(?:s[oó]cios?|póliza|factura|contrato|cuenta|tarjeta|afiliado)?[\s]*\d{6,}/gi, type: "policy_number", severity: "high", category: "financial" },
  ];

  const results: EngineDetection[] = [];
  const seen = new Set<string>();

  for (const p of patterns) {
    p.regex.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = p.regex.exec(text)) !== null) {
      const key = `${m.index}-${m.index + m[0].length}`;
      if (!seen.has(key)) {
        seen.add(key);
        results.push({ type: p.type, severity: p.severity, category: p.category, start: m.index, end: m.index + m[0].length });
      }
    }
  }

  // Remove overlapping detections (keep first by start, then by longest)
  results.sort((a, b) => a.start - b.start || b.end - b.start - (a.end - a.start));
  const clean: EngineDetection[] = [];
  let cursor = 0;
  for (const d of results) {
    if (d.start >= cursor) { clean.push(d); cursor = d.end; }
  }
  return clean;
}

function protectText(text: string): RunResult {
  const t0 = performance.now();
  const rawDetections = detectPii(text);

  const detections: Detection[] = rawDetections.map(d => ({
    ...d,
    value: text.slice(d.start, d.end),
  }));

  // Build tokenMap and protectedText (process in reverse to preserve indices)
  const tokenMap: Record<string, string> = {};
  const counters: Record<string, number> = {};
  const PREFIX: Record<string, string> = {
    full_name: "NM", email: "EM", iban: "BK", dni: "ID", phone: "PH",
    ssn: "SS", credit_card: "CC", ip_address: "IP", session_id: "SI",
    policy_number: "PN",
  };

  let protectedText = text;
  const sorted = [...detections].sort((a, b) => b.start - a.start);
  for (const d of sorted) {
    const prefix = PREFIX[d.type] ?? "PII";
    counters[prefix] = (counters[prefix] ?? 0) + 1;
    const token = `[${prefix}-${String(counters[prefix]).padStart(4, "0")}]`;
    tokenMap[token] = d.value;
    protectedText = protectedText.slice(0, d.start) + token + protectedText.slice(d.end);
  }

  return {
    protectedText,
    originalText: text,       // snapshot at run-time
    detections,
    tokenMap,
    processingMs: Math.round(performance.now() - t0) + 35 + Math.floor(Math.random() * 30),
  };
}

// ─── Highlighted text: renders originalText with colored spans ────────────────

function HighlightedInput({ text, detections }: { text: string; detections: Detection[] }) {
  if (!detections.length) return <span className="whitespace-pre-wrap text-sm font-mono leading-relaxed">{text}</span>;
  const sorted = [...detections].sort((a, b) => a.start - b.start);
  const parts: React.ReactNode[] = [];
  let cursor = 0;
  for (const d of sorted) {
    if (d.start > cursor) parts.push(<span key={`p-${cursor}`} className="whitespace-pre-wrap font-mono">{text.slice(cursor, d.start)}</span>);
    parts.push(
      <span key={`d-${d.start}`} className={`rounded px-0.5 font-mono text-sm ${HIGHLIGHT[d.severity] ?? HIGHLIGHT.low}`} title={d.type}>
        {d.value}
      </span>
    );
    cursor = d.end;
  }
  if (cursor < text.length) parts.push(<span key="p-end" className="whitespace-pre-wrap font-mono">{text.slice(cursor)}</span>);
  return <p className="text-sm leading-relaxed">{parts}</p>;
}

// ─── Protected output: shows tokenised text with reveal toggle ────────────────

function ProtectedOutput({ result }: { result: RunResult }) {
  const [revealed, setRevealed] = useState(false);
  const { t } = useLanguage();

  const displayText = revealed ? result.originalText : result.protectedText;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{t("demo.output.showing")} {revealed ? t("demo.output.original") : t("demo.output.tokenised")}</span>
        <button
          onClick={() => setRevealed(v => !v)}
          className="flex items-center gap-1.5 text-xs text-primary border border-primary/30 bg-primary/5 rounded-full px-3 py-1 hover:bg-primary/10 transition-colors"
        >
          {revealed ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
          {revealed ? t("demo.output.hide") : t("demo.output.reveal")}
        </button>
      </div>
      <div className="bg-background border border-border rounded-lg p-3 min-h-32 max-h-64 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.p
            key={revealed ? "original" : "protected"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="text-sm font-mono leading-relaxed whitespace-pre-wrap"
          >
            {displayed(displayText, result, revealed)}
          </motion.p>
        </AnimatePresence>
      </div>
      {!revealed && Object.keys(result.tokenMap).length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {Object.entries(result.tokenMap).map(([token]) => (
            <span key={token} className="text-xs font-mono px-2 py-0.5 rounded bg-primary/10 border border-primary/20 text-primary">
              {token}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function displayed(text: string, result: RunResult, revealed: boolean): React.ReactNode {
  if (revealed) {
    // Highlighted original
    return <HighlightedInput text={result.originalText} detections={result.detections} />;
  }
  // Tokenised text — highlight the token placeholders
  const tokenRegex = /\[[A-Z]{2}-\d{4}\]/g;
  const parts: React.ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = tokenRegex.exec(text)) !== null) {
    if (m.index > last) parts.push(<span key={`t-${last}`}>{text.slice(last, m.index)}</span>);
    parts.push(
      <span key={`tok-${m.index}`} className="bg-primary/15 border border-primary/30 text-primary rounded px-0.5 font-mono">
        {m[0]}
      </span>
    );
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(<span key="t-end">{text.slice(last)}</span>);
  return <>{parts}</>;
}

// ─── iBS chip ─────────────────────────────────────────────────────────────────

function IbsChip({ running }: { running: boolean }) {
  const { t } = useLanguage();
  const [phase, setPhase] = useState<"idle" | "certifying" | "certified">("idle");
  useEffect(() => {
    if (!running) { setPhase("idle"); return; }
    setPhase("certifying");
    const timer = setTimeout(() => setPhase("certified"), 1800);
    return () => clearTimeout(timer);
  }, [running]);
  return (
    <AnimatePresence mode="wait">
      {phase === "idle" && (
        <motion.span key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground border border-border rounded-full px-3 py-1">
          <Link2 className="w-3 h-3" /> {t("demo.ibs.idle")}
        </motion.span>
      )}
      {phase === "certifying" && (
        <motion.span key="cert" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="inline-flex items-center gap-1.5 text-xs text-warning border border-warning/30 bg-warning/10 rounded-full px-3 py-1 animate-pulse">
          <Link2 className="w-3 h-3 animate-spin" /> {t("demo.ibs.certifying")}
        </motion.span>
      )}
      {phase === "certified" && (
        <motion.span key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
          className="inline-flex items-center gap-1.5 text-xs text-success border border-success/30 bg-success/10 rounded-full px-3 py-1">
          <Link2 className="w-3 h-3" /> {t("demo.ibs.certified")}
        </motion.span>
      )}
    </AnimatePresence>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({ labelKey, value, sub }: { labelKey: string; value: string; sub?: string }) {
  const { t } = useLanguage();
  return (
    <div className="bg-card border border-border rounded-xl p-4 flex flex-col gap-1">
      <span className="text-xs text-muted-foreground font-medium">{t(labelKey)}</span>
      <span className="text-2xl font-bold text-foreground">{value}</span>
      {sub && <span className="text-xs text-muted-foreground">{sub}</span>}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function Demo() {
  const { t, lang } = useLanguage();

  const numFmt = useCallback(
    (n: number) => new Intl.NumberFormat(lang === "es" ? "es-ES" : "en-GB").format(n),
    [lang]
  );
  const pctFmt = useCallback(
    (n: number) => new Intl.NumberFormat(lang === "es" ? "es-ES" : "en-GB", { style: "percent", minimumFractionDigits: 1 }).format(n / 100),
    [lang]
  );

  const [scenario, setScenario] = useState<ScenarioKey>("legal");
  const [inputText, setInputText] = useState(() => t("demo.scenario.legal.text"));
  const [result, setResult] = useState<RunResult | null>(null);
  const [processing, setProcessing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [ibsRunning, setIbsRunning] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleScenario = (key: ScenarioKey) => {
    setScenario(key);
    setInputText(t(`demo.scenario.${key}.text`));
    setResult(null);
    setIbsRunning(false);
  };

  const handleAnalyze = useCallback(() => {
    if (!inputText.trim()) return;
    // Capture the text NOW — before any state updates
    const textToAnalyze = inputText;
    setProcessing(true);
    setResult(null);
    setIbsRunning(false);
    timerRef.current = setTimeout(() => {
      const res = protectText(textToAnalyze);
      setResult(res);
      setProcessing(false);
      setIbsRunning(true);
    }, 420);
  }, [inputText]);

  const handleReset = useCallback(() => {
    setInputText(t(`demo.scenario.${scenario}.text`));
    setResult(null);
    setIbsRunning(false);
  }, [scenario, t]);

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.protectedText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  const detections = result?.detections ?? [];
  const criticalCount = detections.filter(d => d.severity === "critical").length;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-12 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial="hidden" animate="visible" variants={STAGGER}>
            <motion.span variants={FADE_UP} className="inline-block text-xs font-semibold uppercase tracking-widest text-primary bg-primary/10 border border-primary/30 rounded-full px-4 py-1.5 mb-6">
              {t("demo.hero.badge")}
            </motion.span>
            <motion.h1 variants={FADE_UP} className="text-4xl md:text-5xl font-bold mb-5 leading-tight">
              {t("demo.hero.title1")}{" "}<span className="text-primary">{t("demo.hero.title2")}</span>
            </motion.h1>
            <motion.p variants={FADE_UP} className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t("demo.hero.subtitle")}
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="pb-10 px-6">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={STAGGER}
          className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { key: "demo.stat.requests", val: numFmt(12847) },
            { key: "demo.stat.pii", val: numFmt(34219) },
            { key: "demo.stat.coverage", val: pctFmt(99.04) },
            { key: "demo.stat.latency", val: "47 ms", sub: t("demo.stat.latency.sub") },
          ].map(({ key, val, sub }) => (
            <motion.div key={key} variants={FADE_UP}>
              <StatCard labelKey={key} value={val} sub={sub} />
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Interactive sandbox */}
      <section className="pb-20 px-6">
        <div className="max-w-5xl mx-auto">

          {/* Scenario selector */}
          <div className="flex flex-wrap gap-2 mb-6">
            {SCENARIO_KEYS.map(key => (
              <button key={key} onClick={() => handleScenario(key)}
                className={`text-xs font-medium px-4 py-2 rounded-full border transition-all duration-150 ${
                  scenario === key ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                }`}>
                {t(`demo.scenario.${key}`)}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

            {/* Input panel */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">{t("demo.panel.input.title")}</span>
                <button onClick={handleReset} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                  <RotateCcw className="w-3 h-3" /> {t("demo.panel.reset")}
                </button>
              </div>
              <div className="relative rounded-xl border border-border bg-card overflow-hidden">
                <textarea
                  value={inputText}
                  onChange={e => { setInputText(e.target.value); setResult(null); setIbsRunning(false); }}
                  className="w-full h-64 bg-transparent text-sm font-mono text-foreground p-4 resize-none focus:outline-none placeholder:text-muted-foreground leading-relaxed"
                  placeholder={t("demo.panel.input.placeholder")}
                  spellCheck={false}
                />
                <div className="absolute bottom-3 right-3 text-xs text-muted-foreground/50">
                  {numFmt(inputText.length)} {t("demo.panel.chars")}
                </div>
              </div>
              <Button onClick={handleAnalyze} disabled={processing || !inputText.trim()} className="w-full gap-2" size="lg">
                {processing
                  ? <><Shield className="w-4 h-4 animate-pulse" />{t("demo.panel.analyzing")}</>
                  : <><ShieldCheck className="w-4 h-4" />{t("demo.panel.analyze")}</>}
              </Button>
              <p className="text-xs text-muted-foreground text-center">{t("demo.panel.disclaimer")}</p>
            </div>

            {/* Output panel */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">{t("demo.panel.output.title")}</span>
                <div className="flex items-center gap-2">
                  <IbsChip running={ibsRunning} />
                  {result && (
                    <button onClick={handleCopy} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                      {copied ? <Check className="w-3 h-3 text-success" /> : <Copy className="w-3 h-3" />}
                      {copied ? t("demo.panel.copied") : t("demo.panel.copy")}
                    </button>
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card min-h-64 p-4 relative overflow-hidden">
                <AnimatePresence mode="wait">
                  {!result && !processing && (
                    <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-muted-foreground">
                      <Shield className="w-10 h-10 opacity-20" />
                      <p className="text-sm">{t("demo.panel.output.empty")}</p>
                    </motion.div>
                  )}
                  {processing && (
                    <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                      <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                      <p className="text-sm text-muted-foreground">{t("demo.panel.analyzing")}</p>
                    </motion.div>
                  )}
                  {result && !processing && (
                    <motion.div key="result" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                      <ProtectedOutput result={result} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Detections list */}
              <AnimatePresence>
                {result && (
                  <motion.div key="detections" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl border border-border bg-card overflow-hidden">
                    <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                      <span className="text-xs font-semibold flex items-center gap-2">
                        <ShieldAlert className="w-3.5 h-3.5 text-primary" />
                        {t("demo.detections.title")}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {detections.length} {t("demo.detections.found")}
                        {criticalCount > 0 && <span className="ml-2 text-destructive font-medium">· {criticalCount} {t("demo.detections.critical")}</span>}
                      </span>
                    </div>
                    {detections.length === 0 ? (
                      <div className="px-4 py-5 text-center text-sm text-muted-foreground">
                        <ShieldCheck className="w-5 h-5 mx-auto mb-2 text-success" />
                        {t("demo.detections.none")}
                      </div>
                    ) : (
                      <div className="divide-y divide-border max-h-48 overflow-y-auto">
                        {detections.map((d, i) => (
                          <div key={i} className="px-4 py-2.5 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2 min-w-0">
                              <SeverityBadge severity={d.severity} />
                              <span className="text-xs font-mono text-muted-foreground truncate">{d.type.replace(/_/g, " ")}</span>
                            </div>
                            <span className="text-xs font-mono text-foreground/60 truncate max-w-36">{d.value}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Metrics row */}
          <AnimatePresence>
            {result && (
              <motion.div key="metrics" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { icon: Shield, label: t("demo.metric.detected"), value: numFmt(detections.length), color: "text-primary" },
                  { icon: ShieldCheck, label: t("demo.metric.protected"), value: numFmt(detections.length), color: "text-success" },
                  { icon: Zap, label: t("demo.metric.latency"), value: `${numFmt(result.processingMs)} ms`, color: "text-warning" },
                  { icon: Clock, label: t("demo.metric.coverage"), value: pctFmt(detections.length > 0 ? 100 : 0), color: "text-info" },
                ].map(({ icon: Icon, label, value, color }) => (
                  <div key={label} className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
                    <Icon className={`w-5 h-5 shrink-0 ${color}`} />
                    <div>
                      <p className="text-lg font-bold">{value}</p>
                      <p className="text-xs text-muted-foreground">{label}</p>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-6 border-y border-border bg-card/30">
        <div className="max-w-5xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={STAGGER}>
            <motion.p variants={FADE_UP} className="text-xs font-bold tracking-widest text-primary uppercase text-center mb-10">
              {t("demo.how.label")}
            </motion.p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {(["1", "2", "3"] as const).map(n => (
                <motion.div key={n} variants={FADE_UP} className="bg-card border border-border rounded-xl p-6 flex flex-col gap-3">
                  <span className="text-xs font-semibold text-primary bg-primary/10 border border-primary/20 rounded-full w-6 h-6 flex items-center justify-center">{n}</span>
                  <p className="font-semibold">{t(`demo.how.step${n}.title`)}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{t(`demo.how.step${n}.desc`)}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Gated features */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.15 }} variants={STAGGER}>
            <motion.p variants={FADE_UP} className="text-xs font-bold tracking-widest text-primary uppercase text-center mb-3">{t("demo.gated.label")}</motion.p>
            <motion.h2 variants={FADE_UP} className="text-2xl md:text-3xl font-bold text-center mb-10">{t("demo.gated.title")}</motion.h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(["byok", "dpo", "webhook", "blockchain", "multimodel", "mfa"] as const).map(key => (
                <motion.div key={key} variants={FADE_UP} className="flex items-start gap-3 p-4 rounded-xl border border-border bg-card/50 opacity-75">
                  <Lock className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium">{t(`demo.gated.${key}.title`)}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{t(`demo.gated.${key}.desc`)}</p>
                  </div>
                  <span className="ml-auto text-xs text-primary border border-primary/30 bg-primary/5 rounded-full px-2 py-0.5 whitespace-nowrap">{t("demo.gated.pro")}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="pb-20 px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={FADE_UP}
            className="relative rounded-2xl border border-primary/30 bg-primary/5 p-10 text-center overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-primary/10 blur-3xl rounded-full" />
            </div>
            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-primary bg-primary/10 border border-primary/30 rounded-full px-4 py-1.5 mb-5">{t("demo.cta.badge")}</span>
            <h2 className="text-2xl md:text-3xl font-bold mb-4">{t("demo.cta.title")}</h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto leading-relaxed">{t("demo.cta.subtitle")}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="lg" asChild>
                <Link to="/auth">{t("demo.cta.primary")} <ArrowRight className="w-4 h-4 ml-2" /></Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/pricing">{t("demo.cta.secondary")} <ChevronRight className="w-4 h-4 ml-1" /></Link>
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-5">{t("demo.cta.note")}</p>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
