import { Link } from "react-router-dom";
import { Shield, Eye, Lock, FileCheck, Zap, Server, CheckCircle2, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Seo from "@/components/Seo";

const AIGovernancePlatform = () => {
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
            text: "Traditional DLP was built for files and email. Privaro is built for LLM traffic: it understands prompts, tokenizes PII reversibly, and works across OpenAI, Anthropic and Gemini through a single proxy or MCP endpoint.",
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
    { icon: Eye, title: "Visibility", desc: "See every prompt, every completion and every sensitive entity flowing to any LLM — in real time." },
    { icon: Shield, title: "Policy enforcement", desc: "Block, tokenize or anonymize PII, financial data and contracts based on role, org and provider." },
    { icon: FileCheck, title: "Audit & evidence", desc: "GDPR- and EU AI Act–ready logs with optional blockchain certification for every request." },
    { icon: Lock, title: "Reversible tokenization", desc: "AES-256 token vault with controlled reveal — never send raw sensitive data to a model." },
    { icon: Server, title: "Multi-provider proxy", desc: "One integration for OpenAI, Anthropic, Gemini and your internal LLMs. Model-agnostic by design." },
    { icon: Zap, title: "MCP native", desc: "Expose governance as tools to any AI agent via Model Context Protocol — no SDK required." },
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
            AI Governance Platform
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold leading-[1.05] mb-6">
            The AI Governance Platform<br />
            <span className="text-gradient">for regulated enterprises</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-10 leading-relaxed">
            Detect PII, enforce privacy policies and audit every LLM interaction across OpenAI, Anthropic
            and Gemini — with one API, one MCP endpoint and one compliance layer.
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

      {/* Pillars */}
      <section className="py-20 bg-surface/30 border-y border-border">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Six pillars of enterprise AI governance</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Everything you need to govern AI usage across teams, agents and providers — from detection to audit.
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
            Why enterprises need an AI governance platform now
          </h2>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              AI adoption inside regulated organizations — legal, fintech, healthcare — is growing faster than
              the compliance controls around it. Employees paste contracts, customer records and financial
              data into ChatGPT, Claude or internal agents every day. Traditional DLP tools were never designed
              for LLM traffic and don't understand prompts, embeddings or agent-to-agent handoffs.
            </p>
            <p>
              Privaro is the missing control layer. It intercepts every prompt, detects sensitive entities with
              hybrid regex + NLP models, applies your policies (tokenize, anonymize, block), and returns a
              sanitized version to the model. Every decision is logged and, optionally, certified on-chain.
            </p>
            <p>
              Under GDPR and the EU AI Act, responsibility for data sent to an AI model remains with the
              organization. Privaro gives you the evidence to prove control.
            </p>
          </div>
          <div className="mt-10 grid sm:grid-cols-3 gap-4">
            {[
              "GDPR Article 5, 25 & 32 aligned",
              "EU AI Act record-keeping ready",
              "SOC 2 controls in-scope",
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
          <h2 className="text-3xl md:text-4xl font-bold mb-4">See Privaro in your environment</h2>
          <p className="text-muted-foreground mb-8">
            30-minute technical walkthrough — real prompts, real policies, real audit logs.
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

export default AIGovernancePlatform;
