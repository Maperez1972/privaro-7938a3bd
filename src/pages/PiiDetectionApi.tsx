import { Link } from "react-router-dom";
import { Shield, Code, Zap, Lock, CheckCircle2, ArrowRight, Terminal } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Seo from "@/components/Seo";

const PiiDetectionApi = () => {
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "Privaro PII Detection API",
      applicationCategory: "DeveloperApplication",
      operatingSystem: "REST API, MCP",
      description:
        "Real-time PII detection API for LLM prompts. Detect emails, phones, SSNs, credit cards, contracts and custom entities with hybrid regex + NLP. GDPR-ready.",
      offers: { "@type": "Offer", price: "150", priceCurrency: "EUR" },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "What is a PII detection API?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "A PII detection API is a service that scans text for personally identifiable information (names, emails, phones, SSNs, credit cards, addresses) and returns entities with type, position and confidence — so you can mask, tokenize or block them before sending to an LLM.",
          },
        },
        {
          "@type": "Question",
          name: "What entities does Privaro's PII detection API detect?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Emails, phone numbers, SSNs, IBANs, credit cards, passport numbers, addresses, dates of birth, medical record numbers, contract clauses and custom regex/NLP entities defined per organization.",
          },
        },
        {
          "@type": "Question",
          name: "How fast is the API?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "P95 latency under 80ms for prompts up to 4k tokens. Runs at the edge and scales horizontally per organization.",
          },
        },
      ],
    },
  ];

  const features = [
    { icon: Zap, title: "P95 < 80ms", desc: "Edge-deployed detection engine. No noticeable latency added to your LLM calls." },
    { icon: Shield, title: "Hybrid regex + NLP", desc: "Rule-based patterns for structured entities plus NLP models for names, addresses and unstructured PII." },
    { icon: Lock, title: "Reversible tokenization", desc: "Get back tokens instead of masked text. Reveal originals later via controlled RPC with full audit." },
    { icon: Code, title: "REST + MCP", desc: "Standard REST endpoint or Model Context Protocol tool for agents. Same detection engine either way." },
  ];

  const codeSample = `POST https://api.privaro.ai/v1/detect
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json

{
  "text": "Contact John Doe at john@acme.com or +34 600 123 456"
}

// Response
{
  "entities": [
    { "type": "PERSON", "value": "John Doe", "start": 8, "end": 16, "confidence": 0.97 },
    { "type": "EMAIL", "value": "john@acme.com", "start": 20, "end": 33, "confidence": 1.0 },
    { "type": "PHONE", "value": "+34 600 123 456", "start": 37, "end": 52, "confidence": 0.99 }
  ],
  "risk_score": 0.72
}`;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Seo
        title="PII Detection API for LLMs — Real-time & GDPR-ready | Privaro"
        description="Privaro's PII Detection API scans LLM prompts for emails, phones, SSNs, contracts and custom entities in real time. Hybrid regex + NLP, P95 < 80ms, reversible tokenization. Free tier available."
        path="/pii-detection-api"
        jsonLd={jsonLd}
      />
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 grid-pattern opacity-40" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-primary/5 blur-[120px]" />
        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full border border-border bg-surface/50 text-sm text-muted-foreground">
            <Terminal className="w-4 h-4 text-primary" />
            PII Detection API
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold leading-[1.05] mb-6">
            Real-time PII Detection API<br />
            <span className="text-gradient">built for LLM traffic</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-10 leading-relaxed">
            Scan every prompt for emails, phones, SSNs, IBANs, contracts and custom entities before they
            reach OpenAI, Anthropic or Gemini — with one REST call or one MCP tool.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/demo" className="px-8 py-3.5 rounded-md bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity glow-border">
              Request Demo
            </Link>
            <Link to="/docs" className="px-8 py-3.5 rounded-md border border-border font-medium hover:bg-secondary transition-colors">
              Read the docs
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-surface/30 border-y border-border">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Detection engine, built for production</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Not another regex library. A hybrid engine that combines deterministic rules with NLP models,
              tuned for enterprise LLM traffic.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="p-6 rounded-lg border border-border bg-background hover:border-primary/50 transition-colors">
                <Icon className="w-8 h-8 text-primary mb-4" />
                <h3 className="font-semibold text-lg mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Code sample */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center">One endpoint. Every entity.</h2>
          <p className="text-muted-foreground text-center mb-10">
            Send text, get structured entities with type, position, confidence and an aggregate risk score.
          </p>
          <pre className="p-6 rounded-lg border border-border bg-surface/40 overflow-x-auto text-sm leading-relaxed">
            <code>{codeSample}</code>
          </pre>
        </div>
      </section>

      {/* Compliance */}
      <section className="py-20 border-t border-border">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">Compliance-ready by default</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              "GDPR Article 25 — data minimization",
              "EU AI Act — record-keeping",
              "SOC 2 controls in-scope",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 p-4 rounded-md border border-border bg-surface/40">
                <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                <span className="text-sm">{item}</span>
              </div>
            ))}
          </div>
          <p className="text-muted-foreground text-center mt-8">
            Pairs natively with the <Link to="/ai-governance-platform" className="text-primary underline underline-offset-2">Privaro AI Governance Platform</Link>{" "}
            for policy enforcement, token vault and audit trails.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 border-t border-border">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Try the PII Detection API</h2>
          <p className="text-muted-foreground mb-8">
            Free tier includes 10k detections/month. No credit card required.
          </p>
          <Link to="/demo" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-md bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity glow-border">
            Request API access <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default PiiDetectionApi;
