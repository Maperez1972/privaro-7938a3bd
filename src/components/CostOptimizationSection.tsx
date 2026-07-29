import { motion } from "framer-motion";
import { Sparkles, ArrowRight, Coins } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";

const COPY = {
  es: {
    label: "Context Optimization",
    title1: "Privaro no solo protege tus datos,",
    title2: "también reduce lo que pagas por LLM",
    subtitle: "Comprimimos tool outputs, logs JSON y documentos largos antes de enviarlos al modelo. Los tokens de PII ya protegidos ([XX-0001]) nunca se tocan.",
    badge: "Hasta 57% menos tokens en logs y tool outputs",
    beforeLabel: "Antes — payload original",
    afterLabel: "Después — payload optimizado",
    savedLabel: "tokens ahorrados",
    ctaPrimary: "Ver precios",
    ctaNote: "Incluido en el plan Business y superiores.",
  },
  en: {
    label: "Context Optimization",
    title1: "Privaro doesn't just protect your data —",
    title2: "it also cuts what you pay per LLM call",
    subtitle: "We compress tool outputs, JSON logs and long documents before they reach the model. Protected PII tokens ([XX-0001]) are never touched.",
    badge: "Up to 57% fewer tokens in logs and tool outputs",
    beforeLabel: "Before — original payload",
    afterLabel: "After — optimized payload",
    savedLabel: "tokens saved",
    ctaPrimary: "See pricing",
    ctaNote: "Included in the Business plan and above.",
  },
} as const;

const BEFORE = `{
  "logs": [
    {"ts":"2026-07-29T10:15:22Z","tool":"crm.getContact","status":"ok","user_id":"u_8891","result":{"name":"[NM-0001]","email":"[EM-0001]"}},
    {"ts":"2026-07-29T10:15:23Z","tool":"crm.getContact","status":"ok","user_id":"u_8892","result":{"name":"[NM-0002]","email":"[EM-0002]"}},
    {"ts":"2026-07-29T10:15:24Z","tool":"crm.getContact","status":"ok","user_id":"u_8893","result":{"name":"[NM-0003]","email":"[EM-0003]"}}
  ]
}`;

const AFTER = `# columnar (3 rows)
ts|tool|status|user_id|result.name|result.email
2026-07-29T10:15:22Z|crm.getContact|ok|u_8891|[NM-0001]|[EM-0001]
2026-07-29T10:15:23Z|crm.getContact|ok|u_8892|[NM-0002]|[EM-0002]
2026-07-29T10:15:24Z|crm.getContact|ok|u_8893|[NM-0003]|[EM-0003]`;

const estimate = (s: string) => Math.max(1, Math.ceil(s.length / 4));

const CostOptimizationSection = () => {
  const { lang } = useLanguage();
  const c = COPY[lang];
  const beforeTokens = estimate(BEFORE);
  const afterTokens = estimate(AFTER);
  const saved = beforeTokens - afterTokens;
  const pct = Math.round((saved / beforeTokens) * 100);

  return (
    <section id="context-optimization" className="py-28 px-6 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.02] to-transparent" />
      <div className="relative max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="text-center mb-12"
        >
          <p className="text-primary text-sm font-medium uppercase tracking-widest mb-4 inline-flex items-center gap-2 justify-center">
            <Sparkles className="w-3.5 h-3.5" /> {c.label}
          </p>
          <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
            {c.title1} <span className="text-gradient">{c.title2}</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{c.subtitle}</p>
          <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded-full px-4 py-1.5">
            <Coins className="w-4 h-4" /> {c.badge}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="grid md:grid-cols-2 gap-4"
        >
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-secondary/30">
              <span className="text-xs font-semibold text-muted-foreground">{c.beforeLabel}</span>
              <span className="text-xs font-mono text-muted-foreground">~{beforeTokens} tokens</span>
            </div>
            <pre className="text-xs font-mono text-foreground/80 p-4 overflow-x-auto leading-relaxed max-h-72">{BEFORE}</pre>
          </div>

          <div className="rounded-xl border border-primary/40 bg-primary/5 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-primary/20 bg-primary/10">
              <span className="text-xs font-semibold text-primary">{c.afterLabel}</span>
              <span className="text-xs font-mono text-primary">~{afterTokens} tokens</span>
            </div>
            <pre className="text-xs font-mono text-foreground/90 p-4 overflow-x-auto leading-relaxed max-h-72">{AFTER}</pre>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <span className="text-sm text-muted-foreground">
            <span className="text-2xl font-bold text-emerald-400">−{pct}%</span>{" "}
            <span className="ml-1">({saved} {c.savedLabel})</span>
          </span>
          <Button asChild size="lg">
            <Link to="/pricing">
              {c.ctaPrimary} <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </motion.div>
        <p className="text-center text-xs text-muted-foreground mt-4">{c.ctaNote}</p>
      </div>
    </section>
  );
};

export default CostOptimizationSection;
