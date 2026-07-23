import { Link } from "react-router-dom";
import { ShieldCheck, FileCheck, ScrollText, Users, Database, Gauge, CheckCircle2, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Seo from "@/components/Seo";

const AIComplianceSoftware = () => {
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "Privaro AI Compliance Software",
      applicationCategory: "SecurityApplication",
      operatingSystem: "Web, API, MCP",
      description:
        "AI compliance software for GDPR and the EU AI Act. Detects PII in LLM prompts, enforces policies and produces audit-ready evidence across OpenAI, Anthropic and Gemini.",
      offers: { "@type": "Offer", price: "150", priceCurrency: "EUR" },
      aggregateRating: { "@type": "AggregateRating", ratingValue: "4.9", reviewCount: "27" },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "What is AI compliance software?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "AI compliance software is the control layer between your business applications and LLMs that enforces privacy, records every interaction, and produces evidence required by GDPR, the EU AI Act and sector regulators.",
          },
        },
        {
          "@type": "Question",
          name: "Does Privaro cover the EU AI Act?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. Privaro maps to EU AI Act Article 12 (record-keeping), Article 13 (transparency), and Article 26 (deployer obligations) with structured logs and per-request evidence.",
          },
        },
        {
          "@type": "Question",
          name: "Can Privaro be used by our DPO?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. DPOs get a dedicated role with access to audit logs, DPO reports and evidence export — without touching production keys or policies.",
          },
        },
      ],
    },
  ];

  const controls = [
    { icon: ShieldCheck, title: "GDPR Article 5, 25 & 32", desc: "Data minimization by default, privacy by design in every prompt, and integrity of processing across all AI providers." },
    { icon: ScrollText, title: "EU AI Act ready", desc: "Record-keeping, transparency and deployer obligations covered with structured logs and evidence per request." },
    { icon: FileCheck, title: "DPO reports", desc: "One-click GDPR reports with date range, entities detected, policy actions and per-user traceability." },
    { icon: Users, title: "Role-based access", desc: "Admin, DPO, Developer and Viewer roles enforce separation of duties across the compliance workflow." },
    { icon: Database, title: "Encrypted token vault", desc: "AES-256 tokenization with controlled reveal — raw sensitive data never reaches a model provider." },
    { icon: Gauge, title: "Real-time monitoring", desc: "Risk scoring, alerts and dashboards to prove ongoing control to auditors and regulators." },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Seo
        title="AI Compliance Software — GDPR & EU AI Act Ready | Privaro"
        description="Privaro is AI compliance software for regulated enterprises. GDPR-native, EU AI Act ready, with PII detection, policy enforcement and audit evidence for OpenAI, Anthropic and Gemini."
        path="/ai-compliance-software"
        jsonLd={jsonLd}
      />
      <Navbar />

      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 grid-pattern opacity-40" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-primary/5 blur-[120px]" />
        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full border border-border bg-surface/50 text-sm text-muted-foreground">
            <ShieldCheck className="w-4 h-4 text-primary" />
            AI Compliance Software
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold leading-[1.05] mb-6">
            AI Compliance Software<br />
            <span className="text-gradient">built for GDPR and the EU AI Act</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-10 leading-relaxed">
            Prove control over every prompt sent to OpenAI, Anthropic or Gemini. Privaro enforces privacy
            policies, tokenizes sensitive data and generates the evidence your DPO and auditors need.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/demo" className="px-8 py-3.5 rounded-md bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity glow-border">
              Request Demo
            </Link>
            <Link to="/ai-risk-assessment" className="px-8 py-3.5 rounded-md border border-border font-medium hover:bg-secondary transition-colors">
              Run free AI Risk Assessment
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 bg-surface/30 border-y border-border">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Compliance controls, out of the box</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Every control mapped to a regulatory obligation — no spreadsheets, no manual evidence gathering.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {controls.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="p-6 rounded-lg border border-border bg-background hover:border-primary/50 transition-colors">
                <Icon className="w-8 h-8 text-primary mb-4" />
                <h3 className="font-semibold text-lg mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">
            Why traditional GRC tools don't cover AI
          </h2>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              GRC and DLP platforms were designed for files, email and endpoints. LLM traffic is different:
              prompts are unstructured, embeddings can leak PII, and agent-to-agent handoffs bypass every
              perimeter control. Static policies and after-the-fact audits are not enough for regulators
              asking about your AI usage today.
            </p>
            <p>
              Privaro is AI-native compliance software. It sits in the request path, applies your policies
              before data reaches the model, and stores immutable evidence of every decision — with optional
              blockchain certification for high-risk workflows.
            </p>
          </div>
          <div className="mt-10 grid sm:grid-cols-3 gap-4">
            {["GDPR-native by design", "EU AI Act evidence per request", "SOC 2 controls in-scope"].map((item) => (
              <div key={item} className="flex items-center gap-3 p-4 rounded-md border border-border bg-surface/40">
                <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                <span className="text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 border-t border-border">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Get compliance-ready in days</h2>
          <p className="text-muted-foreground mb-8">
            30-minute technical walkthrough with your security or DPO team.
          </p>
          <Link to="/demo" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-md bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity glow-border">
            Request Demo <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AIComplianceSoftware;
