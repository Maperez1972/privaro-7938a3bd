import { Link } from "react-router-dom";
import { CalendarClock, ShieldAlert, ScrollText, CheckCircle2, ArrowRight, AlertTriangle, Download } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Seo from "@/components/Seo";
import { useLanguage } from "@/context/LanguageContext";
import { trackEvent } from "@/lib/analytics";
import { COPY, type RiskTier } from "@/content/eu-ai-act-copy";


const TONE_CLASSES: Record<RiskTier["tone"], string> = {
  danger: "border-destructive/50",
  warn: "border-primary/50",
  info: "border-border",
  ok: "border-border",
};

const SOURCES = [
  {
    label: "Regulation (EU) 2024/1689 — full text",
    href: "https://eur-lex.europa.eu/eli/reg/2024/1689/oj",
  },
  {
    label: "European Commission — AI Act overview",
    href: "https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai",
  },
];

const EuAiActCompliance = () => {
  const { lang } = useLanguage();
  const c = COPY[lang === "es" ? "es" : "en"];

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: c.seoTitle,
      description: c.seoDescription,
      inLanguage: lang === "es" ? "es" : "en",
      author: { "@type": "Organization", name: "Privaro" },
      publisher: { "@type": "Organization", name: "Privaro", url: "https://privaro.ai" },
      mainEntityOfPage: "https://privaro.ai/eu-ai-act-compliance",
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Privaro", item: "https://privaro.ai" },
        {
          "@type": "ListItem",
          position: 2,
          name: "EU AI Act",
          item: "https://privaro.ai/eu-ai-act-compliance",
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Seo
        title={c.seoTitle}
        description={c.seoDescription}
        path="/eu-ai-act-compliance"
        ogType="article"
        jsonLd={jsonLd}
      />
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-16 overflow-hidden">
        <div className="absolute inset-0 grid-pattern opacity-40" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-primary/5 blur-[120px]" />
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full border border-border bg-surface/50 text-sm text-muted-foreground">
            <ScrollText className="w-4 h-4 text-primary" />
            {c.badge}
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold leading-[1.08] mb-6">
            {c.h1a} <span className="text-gradient">{c.h1b}</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-4 leading-relaxed">{c.intro}</p>
          <p className="text-xs text-muted-foreground mb-10">{c.updated}</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/ai-risk-assessment"
              className="px-8 py-3.5 rounded-md bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity glow-border"
            >
              {c.ctaPrimary}
            </Link>
            <a
              href="#privaro"
              className="px-8 py-3.5 rounded-md border border-border font-medium hover:bg-secondary transition-colors"
            >
              {c.ctaSecondary}
            </a>
          </div>
        </div>
      </section>

      {/* What it is */}
      <section className="py-16 border-t border-border">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-3xl font-bold mb-6">{c.whatTitle}</h2>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>{c.whatP1}</p>
            <p>{c.whatP2}</p>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16 bg-surface/30 border-y border-border">
        <div className="max-w-4xl mx-auto px-6">
          <div className="mb-10">
            <h2 className="text-3xl font-bold mb-3 flex items-center gap-3">
              <CalendarClock className="w-7 h-7 text-primary" />
              {c.timelineTitle}
            </h2>
            <p className="text-muted-foreground">{c.timelineDesc}</p>
          </div>
          <ol className="relative border-l border-border ml-3 space-y-8">
            {c.milestones.map((m) => (
              <li key={m.date} className="pl-8">
                <span className="absolute -left-[7px] mt-1.5 w-3.5 h-3.5 rounded-full bg-primary" />
                <div className="text-sm font-mono text-primary mb-1">{m.date}</div>
                <h3 className="font-semibold text-lg mb-1">{m.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{m.desc}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Risk tiers */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-6">
          <div className="mb-10">
            <h2 className="text-3xl font-bold mb-3 flex items-center gap-3">
              <ShieldAlert className="w-7 h-7 text-primary" />
              {c.riskTitle}
            </h2>
            <p className="text-muted-foreground">{c.riskDesc}</p>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            {c.tiers.map((tier) => (
              <div
                key={tier.level}
                className={`p-6 rounded-lg border bg-surface/40 ${TONE_CLASSES[tier.tone]}`}
              >
                <h3 className="font-semibold text-lg mb-4">{tier.level}</h3>
                <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">{c.riskColWhat}</p>
                <p className="text-sm mb-4 leading-relaxed">{tier.what}</p>
                <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">{c.riskColDuties}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{tier.duties}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 p-6 rounded-lg border border-destructive/40 bg-destructive/5">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              {c.finesTitle}
            </h3>
            <ul className="space-y-2">
              {c.fines.map((f) => (
                <li key={f} className="text-sm text-muted-foreground leading-relaxed">
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Checklist */}
      <section className="py-16 bg-surface/30 border-y border-border">
        <div className="max-w-4xl mx-auto px-6">
          <div className="mb-10">
            <h2 className="text-3xl font-bold mb-3">{c.checklistTitle}</h2>
            <p className="text-muted-foreground">{c.checklistDesc}</p>
          </div>
          <div className="space-y-4">
            {c.checklist.map((item, i) => (
              <div
                key={item.title}
                className="flex gap-4 p-5 rounded-lg border border-border bg-background hover:border-primary/50 transition-colors"
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-md bg-primary/10 text-primary font-mono text-sm flex items-center justify-center">
                  {i + 1}
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Privaro */}
      <section id="privaro" className="py-16 scroll-mt-24">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold mb-3">{c.privaroTitle}</h2>
          <p className="text-muted-foreground mb-8 leading-relaxed">{c.privaroDesc}</p>
          <div className="grid sm:grid-cols-2 gap-4">
            {c.privaroItems.map((item) => (
              <div key={item} className="flex items-start gap-3 p-4 rounded-md border border-border bg-surface/40">
                <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-sm leading-relaxed">{item}</span>
              </div>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap gap-4 text-sm">
            <Link to="/ai-governance-platform" className="text-primary hover:underline">
              AI Governance Platform
            </Link>
            <Link to="/pii-detection-api" className="text-primary hover:underline">
              PII Detection API
            </Link>
            <Link to="/security" className="text-primary hover:underline">
              Security
            </Link>
            <Link to="/blog" className="text-primary hover:underline">
              Blog
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-surface/30 border-y border-border">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-3xl font-bold mb-8">{c.faqTitle}</h2>
          <div className="space-y-6">
            {c.faq.map((item) => (
              <div key={item.q}>
                <h3 className="font-semibold mb-2">{item.q}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
          <div className="mt-10">
            <h3 className="text-sm font-semibold mb-3">{c.sourcesTitle}</h3>
            <ul className="space-y-1">
              {SOURCES.map((s) => (
                <li key={s.href}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <p className="mt-8 text-xs text-muted-foreground leading-relaxed">{c.disclaimer}</p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{c.ctaTitle}</h2>
          <p className="text-muted-foreground mb-8">{c.ctaDesc}</p>
          <Link
            to="/demo"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-md bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity glow-border"
          >
            {c.ctaButton} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default EuAiActCompliance;
