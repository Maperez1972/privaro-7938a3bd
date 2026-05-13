import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Copy, Check, ArrowRight, Terminal, Shield, Zap, BookOpen, ExternalLink } from "lucide-react";
import Navbar from "@/components/Navbar";
import Seo from "@/components/Seo";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" as const } },
};
const stagger = { visible: { transition: { staggerChildren: 0.08 } } };

type Lang = "python" | "node" | "curl";

const CODE: Record<Lang, { install: string; code: string }> = {
  python: {
    install: "pip install privaro",
    code: `import privaro

privaro.init(
    api_key="prvr_your_key_here",
    pipeline_id="your-pipeline-uuid",
)

result = privaro.protect(
    "Solicitante: Laura Sánchez (DNI: 23456789D) "
    "Email: laura@empresa.com · IBAN: ES98 2100 0418 6819 6340 7321"
)

print(result.protected)
# "Solicitante: [NM-0001] (DNI: [ID-0001]) "
# "Email: [EM-0001] · IBAN: [BK-0001]"

print(result.summary())
# [Privaro] 4 detected, 4 masked, risk=high, gdpr=✓, 48ms`,
  },
  node: {
    install: "npm install privaro-sdk",
    code: `import { PrivaroClient } from "privaro-sdk";

const privaro = new PrivaroClient({
  apiKey: process.env.PRIVARO_API_KEY,
  pipelineId: process.env.PRIVARO_PIPELINE_ID,
});

const result = await privaro.protect(
  "Solicitante: Laura Sánchez (DNI: 23456789D) " +
  "Email: laura@empresa.com · IBAN: ES98 2100 0418 6819 6340 7321"
);

console.log(result.protected);
// "Solicitante: [NM-0001] (DNI: [ID-0001]) "
// "Email: [EM-0001] · IBAN: [BK-0001]"

console.log(result.summary());
// [Privaro] 4 detected, 4 masked, risk=high, gdpr=✓, 48ms`,
  },
  curl: {
    install: "# No installation needed",
    code: `curl -X POST https://privaro-proxy-production.up.railway.app/v1/proxy/protect \\
  -H "Content-Type: application/json" \\
  -H "X-Privaro-Key: prvr_your_key_here" \\
  -d '{
    "pipeline_id": "your-pipeline-uuid",
    "prompt": "Solicitante: Laura Sánchez (DNI: 23456789D) Email: laura@empresa.com",
    "options": { "mode": "tokenise", "include_detections": true }
  }'

# Response:
# {
#   "protected_prompt": "Solicitante: [NM-0001] (DNI: [ID-0001]) Email: [EM-0001]",
#   "detections": [...],
#   "stats": { "total_detected": 3, "total_masked": 3, "coverage_pct": 100 },
#   "gdpr_compliant": true,
#   "audit_log_id": "uuid-..."
# }`,
  },
};

function CodeBlock({ code, lang }: { code: string; lang?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="relative rounded-xl bg-black/60 border border-border overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/50">
        <span className="text-xs text-muted-foreground font-mono">{lang ?? "bash"}</span>
        <button onClick={copy} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
          {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="p-4 text-sm font-mono text-foreground/90 overflow-x-auto leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function StepNumber({ n }: { n: number }) {
  return (
    <span className="flex-shrink-0 w-7 h-7 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center">
      {n}
    </span>
  );
}

export default function Docs() {
  const { t } = useLanguage();
  const [activeLang, setActiveLang] = useState<Lang>("node");

  const LANGS: { key: Lang; label: string }[] = [
    { key: "node", label: "Node.js / TS" },
    { key: "python", label: "Python" },
    { key: "curl", label: "cURL" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Seo title="Docs — Privaro API & SDK Reference" description="Quickstart, API reference and SDK guides. Integrate Privaro in less than an hour with Python or Node." path="/docs" />
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-12 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            <motion.span variants={fadeUp}
              className="inline-block text-xs font-semibold uppercase tracking-widest text-primary bg-primary/10 border border-primary/30 rounded-full px-4 py-1.5 mb-6">
              {t("docs.badge")}
            </motion.span>
            <motion.h1 variants={fadeUp} className="text-4xl md:text-5xl font-bold mb-5 leading-tight">
              {t("docs.title")}
            </motion.h1>
            <motion.p variants={fadeUp} className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t("docs.subtitle")}
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Quickstart */}
      <section className="pb-20 px-6">
        <div className="max-w-3xl mx-auto space-y-10">

          {/* Step 1: Get API key */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
            className="flex gap-4">
            <StepNumber n={1} />
            <div className="flex-1 space-y-3">
              <h2 className="text-lg font-semibold">{t("docs.step1.title")}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{t("docs.step1.desc")}</p>
              <Button size="sm" asChild>
                <Link to="/auth">
                  {t("docs.step1.cta")} <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Link>
              </Button>
            </div>
          </motion.div>

          {/* Step 2: Install */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
            className="flex gap-4">
            <StepNumber n={2} />
            <div className="flex-1 space-y-3">
              <h2 className="text-lg font-semibold">{t("docs.step2.title")}</h2>
              <p className="text-sm text-muted-foreground">{t("docs.step2.desc")}</p>

              {/* Language tabs */}
              <div className="flex gap-1.5 flex-wrap">
                {LANGS.map(({ key, label }) => (
                  <button key={key} onClick={() => setActiveLang(key)}
                    className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-all ${
                      activeLang === key
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border text-muted-foreground hover:text-foreground"
                    }`}>
                    {label}
                  </button>
                ))}
              </div>
              <CodeBlock code={CODE[activeLang].install} lang="bash" />
            </div>
          </motion.div>

          {/* Step 3: Create pipeline */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
            className="flex gap-4">
            <StepNumber n={3} />
            <div className="flex-1 space-y-3">
              <h2 className="text-lg font-semibold">{t("docs.step3.title")}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{t("docs.step3.desc")}</p>
              <CodeBlock
                code={`# In your dashboard: /app/pipelines → New pipeline
# Choose your LLM provider and configure policy rules
# Copy the pipeline UUID from the pipeline detail page`}
                lang="bash"
              />
            </div>
          </motion.div>

          {/* Step 4: Protect */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
            className="flex gap-4">
            <StepNumber n={4} />
            <div className="flex-1 space-y-3">
              <h2 className="text-lg font-semibold">{t("docs.step4.title")}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{t("docs.step4.desc")}</p>
              <CodeBlock code={CODE[activeLang].code} lang={activeLang === "python" ? "python" : activeLang === "curl" ? "bash" : "typescript"} />
            </div>
          </motion.div>

          {/* Step 5: Send to LLM */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
            className="flex gap-4">
            <StepNumber n={5} />
            <div className="flex-1 space-y-3">
              <h2 className="text-lg font-semibold">{t("docs.step5.title")}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{t("docs.step5.desc")}</p>
              <CodeBlock
                code={activeLang === "python"
                  ? `# Send the protected prompt to your LLM
response = openai.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": result.protected}]
)
print(response.choices[0].message.content)
# LLM never sees the real PII — only tokens like [NM-0001]`
                  : `// Send the protected prompt to your LLM
const response = await openai.chat.completions.create({
  model: "gpt-4o",
  messages: [{ role: "user", content: result.protected }],
});
// LLM never sees the real PII — only tokens like [NM-0001]`}
                lang={activeLang === "python" ? "python" : "typescript"}
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Feature cards */}
      <section className="py-16 px-6 border-y border-border bg-card/30">
        <div className="max-w-5xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={stagger}>
            <motion.p variants={fadeUp} className="text-xs font-bold tracking-widest text-primary uppercase text-center mb-10">
              {t("docs.features.label")}
            </motion.p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[
                { icon: Shield, titleKey: "docs.feat1.title", descKey: "docs.feat1.desc" },
                { icon: Zap, titleKey: "docs.feat2.title", descKey: "docs.feat2.desc" },
                { icon: BookOpen, titleKey: "docs.feat3.title", descKey: "docs.feat3.desc" },
              ].map(({ icon: Icon, titleKey, descKey }) => (
                <motion.div key={titleKey} variants={fadeUp}
                  className="bg-card border border-border rounded-xl p-6 flex flex-col gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <p className="font-semibold text-foreground">{t(titleKey)}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{t(descKey)}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Endpoint reference */}
      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <h2 className="text-xl font-semibold mb-2">{t("docs.endpoints.title")}</h2>
            <p className="text-sm text-muted-foreground mb-8">{t("docs.endpoints.base")}: <code className="text-primary font-mono text-xs bg-primary/10 px-2 py-0.5 rounded">https://privaro-proxy-production.up.railway.app/v1</code></p>

            <div className="space-y-4">
              {[
                { method: "POST", path: "/proxy/protect", descKey: "docs.ep1.desc" },
                { method: "POST", path: "/proxy/detect", descKey: "docs.ep2.desc" },
                { method: "POST", path: "/relay/complete", descKey: "docs.ep3.desc" },
                { method: "POST", path: "/agent/reveal", descKey: "docs.ep4.desc" },
                { method: "GET",  path: "/health", descKey: "docs.ep5.desc" },
              ].map(({ method, path, descKey }) => (
                <div key={path} className="flex items-start gap-4 p-4 rounded-xl border border-border bg-card">
                  <span className={`text-xs font-bold px-2 py-1 rounded font-mono shrink-0 ${
                    method === "GET" ? "bg-info/10 text-info" : "bg-primary/10 text-primary"
                  }`}>
                    {method}
                  </span>
                  <div className="min-w-0">
                    <code className="text-sm font-mono text-foreground">{path}</code>
                    <p className="text-xs text-muted-foreground mt-1">{t(descKey)}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="pb-20 px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
            className="relative rounded-2xl border border-primary/30 bg-primary/5 p-10 text-center overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-primary/10 blur-3xl rounded-full" />
            </div>
            <Terminal className="w-8 h-8 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-3">{t("docs.cta.title")}</h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">{t("docs.cta.subtitle")}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="lg" asChild>
                <Link to="/auth">{t("docs.cta.primary")} <ArrowRight className="w-4 h-4 ml-2" /></Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/demo">
                  <ExternalLink className="w-4 h-4 mr-2" /> {t("docs.cta.secondary")}
                </Link>
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-5">{t("docs.cta.note")}</p>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
