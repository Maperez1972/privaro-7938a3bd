import { Link } from "react-router-dom";
import { Lock, AlertTriangle, ShieldCheck, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Seo from "@/components/Seo";

const EnterpriseAISecurity = () => {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Enterprise AI Security: A Practical Guide for Regulated Organizations",
    description:
      "How to secure enterprise AI usage across OpenAI, Anthropic and Gemini — threat model, controls and a step-by-step rollout for security and compliance teams.",
    author: { "@type": "Organization", name: "Privaro" },
    publisher: { "@type": "Organization", name: "Privaro" },
    mainEntityOfPage: "https://privaro.ai/enterprise-ai-security",
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Seo
        title="Enterprise AI Security — Practical Guide | Privaro"
        description="A practical enterprise AI security guide: threat model for LLM usage, essential controls (PII detection, tokenization, audit) and a step-by-step rollout for regulated teams."
        path="/enterprise-ai-security"
        ogType="article"
        jsonLd={jsonLd}
      />
      <Navbar />

      <article className="pt-32 pb-20">
        <div className="max-w-3xl mx-auto px-6">
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full border border-border bg-surface/50 text-sm text-muted-foreground">
            <Lock className="w-4 h-4 text-primary" />
            Enterprise AI Security
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold leading-[1.1] mb-6">
            Enterprise AI Security: a practical guide for regulated organizations
          </h1>
          <p className="text-lg text-muted-foreground mb-10 leading-relaxed">
            Employees in legal, fintech and healthcare are already using LLMs at work. This guide covers the
            threat model, the essential controls and a rollout plan you can execute in weeks — not quarters.
          </p>

          <div className="space-y-10 text-muted-foreground leading-relaxed">
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-3 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-primary" /> The threat model
              </h2>
              <p>
                Enterprise AI security is not a model problem — it is a data-flow problem. Sensitive data
                leaves the organization the moment an employee pastes it into ChatGPT, Claude or an internal
                agent. Once inside a provider's logs or training pipeline, it is out of your control.
              </p>
              <ul className="list-disc list-inside mt-4 space-y-2">
                <li><strong className="text-foreground">Prompt leakage</strong> — PII, contracts and secrets pasted into public LLMs.</li>
                <li><strong className="text-foreground">Agent-to-agent handoffs</strong> — one agent forwards sensitive context to another without policy checks.</li>
                <li><strong className="text-foreground">Embedding drift</strong> — sensitive strings preserved in vector databases far longer than expected.</li>
                <li><strong className="text-foreground">Third-party plugins</strong> — tool calls that exfiltrate data outside your perimeter.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-3 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-primary" /> Essential controls
              </h2>
              <ol className="list-decimal list-inside space-y-2 mt-4">
                <li><strong className="text-foreground">Detection</strong> — hybrid regex + NLP models to identify PII, financial data and contracts in every prompt.</li>
                <li><strong className="text-foreground">Policy enforcement</strong> — tokenize, anonymize or block based on role, org and provider.</li>
                <li><strong className="text-foreground">Reversible tokenization</strong> — AES-256 vault so the business can still function.</li>
                <li><strong className="text-foreground">Multi-provider proxy</strong> — one integration for OpenAI, Anthropic and Gemini.</li>
                <li><strong className="text-foreground">Audit and evidence</strong> — immutable logs mapped to GDPR and the EU AI Act.</li>
              </ol>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-3">A 4-week rollout</h2>
              <ol className="list-decimal list-inside space-y-2">
                <li><strong className="text-foreground">Week 1</strong> — Run an AI Risk Assessment to map current AI usage across teams.</li>
                <li><strong className="text-foreground">Week 2</strong> — Deploy Privaro as a proxy for one high-risk workflow (e.g. contract review).</li>
                <li><strong className="text-foreground">Week 3</strong> — Roll out policies per role and enable DPO reporting.</li>
                <li><strong className="text-foreground">Week 4</strong> — Extend to all providers, enable blockchain certification for regulated flows.</li>
              </ol>
            </section>

            <section className="p-6 rounded-lg border border-border bg-surface/40">
              <h2 className="text-xl font-bold text-foreground mb-3">Where Privaro fits</h2>
              <p>
                Privaro is the enterprise AI security layer that sits between your applications and any LLM.
                It applies your policies before data reaches the model and records every decision for audit.
              </p>
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <Link to="/ai-risk-assessment" className="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity">
                  Run free AI Risk Assessment <ArrowRight className="w-4 h-4" />
                </Link>
                <Link to="/ai-governance-platform" className="inline-flex items-center gap-2 px-6 py-3 rounded-md border border-border font-medium hover:bg-secondary transition-colors">
                  See the platform
                </Link>
              </div>
            </section>
          </div>
        </div>
      </article>

      <Footer />
    </div>
  );
};

export default EnterpriseAISecurity;
