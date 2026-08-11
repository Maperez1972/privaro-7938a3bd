import { Link } from "react-router-dom";
import { useLanguage } from "@/context/LanguageContext";
import { Shield, Eye, Lock, FileCheck, Zap, Server, CheckCircle2, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Seo from "@/components/Seo";

const AIGovernancePlatform = () => {
  const { t } = useLanguage();
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "Privaro AI Governance Platform",
      applicationCategory: "SecurityApplication",
      operatingSystem: "Web, API, MCP",
      description:
        "AI Governance Platform that detects PII, masks prompts, enforces policies and audits every LLM interaction across OpenAI, Anthropic and Gemini.",
      offers: { "@type": "Offer", price: "150", priceCurrency: "EUR" },
      aggregateRating: { "@type": "AggregateRating", ratingValue: "4.9", reviewCount: "27" },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "What is an AI governance platform?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "An AI governance platform is the control layer that sits between your applications and LLMs. It detects sensitive data, enforces privacy policies, and produces auditable logs for GDPR and the EU AI Act.",
          },
        },
        {
          "@type": "Question",
          name: "How is Privaro different from a DLP or an LLM firewall?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Traditional DLP was built for files and email. Privaro is built for LLM traffic: it understands both the prompt going into the model and the response coming back, tokenizes PII reversibly in either direction, and works across OpenAI, Anthropic and Gemini through a single proxy or MCP endpoint. On streaming responses the output is audited in real time rather than masked.",
          },
        },
        {
          "@type": "Question",
          name: "Is Privaro compliant with GDPR and the EU AI Act?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. Privaro is designed as GDPR-native infrastructure with data minimization by default, tenant isolation, encrypted token vault, and audit trails aligned with EU AI Act transparency and record-keeping obligations.",
          },
        },
      ],
    },
  ];

  const pillars = [
    { icon: Eye, title: t("aiGov.pillars.eye.title"), desc: t("aiGov.pillars.eye.desc") },
    { icon: Shield, title: t("aiGov.pillars.policy.title"), desc: t("aiGov.pillars.policy.desc") },
    { icon: FileCheck, title: t("aiGov.pillars.audit.title"), desc: t("aiGov.pillars.audit.desc") },
    { icon: Lock, title: t("aiGov.pillars.tokenization.title"), desc: t("aiGov.pillars.tokenization.desc") },
    { icon: Server, title: t("aiGov.pillars.proxy.title"), desc: t("aiGov.pillars.proxy.desc") },
    { icon: Zap, title: t("aiGov.pillars.mcp.title"), desc: t("aiGov.pillars.mcp.desc") },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Seo
        title="AI Governance Platform — PII Detection, Policy & Audit | Privaro"
        description="Privaro is the AI governance platform for enterprises: real-time PII detection, policy enforcement, reversible tokenization and full audit for OpenAI, Anthropic and Gemini. GDPR & EU AI Act ready."
        path="/ai-governance-platform"
        jsonLd={jsonLd}
      />
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 grid-pattern opacity-40" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-primary/5 blur-[120px]" />
        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full border border-border bg-surface/50 text-sm text-muted-foreground">
            <Shield className="w-4 h-4 text-primary" />
            {t("aiGov.hero.badge")}
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold leading-[1.05] mb-6">
            {t("aiGov.hero.title1")}<br />
            <span className="text-gradient">{t("aiGov.hero.title2")}</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-10 leading-relaxed">
            {t("aiGov.hero.desc")}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/demo" className="px-8 py-3.5 rounded-md bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity glow-border">
              {t("aiGov.hero.cta.demo")}
            </Link>
            <Link to="/ai-risk-assessment" className="px-8 py-3.5 rounded-md border border-border font-medium hover:bg-secondary transition-colors">
              {t("aiGov.hero.cta.risk")}
            </Link>
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section className="py-20 bg-surface/30 border-y border-border">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("aiGov.pillarsSection.title")}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t("aiGov.pillarsSection.desc")}
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pillars.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="p-6 rounded-lg border border-border bg-background hover:border-primary/50 transition-colors">
                <Icon className="w-8 h-8 text-primary mb-4" />
                <h3 className="font-semibold text-lg mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why it matters */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">
            {t("aiGov.why.title")}
          </h2>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              {t("aiGov.why.p1")}
            </p>
            <p>
              {t("aiGov.why.p2")}
            </p>
            <p>
              {t("aiGov.why.p3")}
            </p>
          </div>
          <div className="mt-10 grid sm:grid-cols-3 gap-4">
            {[
              t("aiGov.why.item1"),
              t("aiGov.why.item2"),
              t("aiGov.why.item3"),
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 p-4 rounded-md border border-border bg-surface/40">
                <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                <span className="text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 border-t border-border">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("aiGov.cta.title")}</h2>
          <p className="text-muted-foreground mb-8">
            {t("aiGov.cta.desc")}
          </p>
          <Link to="/demo" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-md bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity glow-border">
            {t("aiGov.cta.button")} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AIGovernancePlatform;
