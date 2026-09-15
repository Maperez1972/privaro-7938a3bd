import { Link } from "react-router-dom";
import { useLanguage } from "@/context/LanguageContext";
import { Shield, Code, Zap, Lock, CheckCircle2, ArrowRight, Terminal } from "lucide-react";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Seo from "@/components/Seo";

const faqs = [
  {
    q: "Does the API store my text?",
    a: "No. Privaro processes text in-memory and does not persist the original content. The only data stored is the detection metadata (entity types, positions, risk score) and, when tokenization is used, the encrypted token-to-value mapping in your organization's vault — which you can delete at any time.",
  },
  {
    q: "Can I detect PII in multiple languages?",
    a: "Yes. The hybrid engine covers English, Spanish, French, German, Italian and Portuguese out of the box. Entity types with locale-specific formats (national IDs, phone numbers, postal codes) use locale-aware validators.",
  },
  {
    q: "Is the API GDPR compliant?",
    a: "Privaro is designed for GDPR compliance. It processes data in EU infrastructure, signs a DPA with every customer, supports zero-retention mode, and generates per-request audit logs suitable for DSAR and DPA responses. See the security page for the full control list.",
  },
  {
    q: "What happens with streaming LLM responses?",
    a: "For server-sent event (SSE) streaming, output scanning runs in audit-only mode — detections are logged as incidents but the stream is not buffered or modified. For guaranteed output masking, use the non-streaming relay endpoint (POST /v1/relay/complete).",
  },
  {
    q: "Can I add custom entity types?",
    a: "Yes. Each pipeline supports custom entity definitions via regex patterns, keyword lists, or a fine-tuned NER model. Custom entities appear in detection results with the same type, confidence and position fields as built-in ones.",
  },
];

const PiiDetectionApi = () => {
  const { t } = useLanguage();
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "Privaro PII Detection API",
      applicationCategory: "DeveloperApplication",
      operatingSystem: "REST API, MCP",
      description:
        "Real-time PII detection API for LLM prompts and LLM responses, and for photographed or scanned ID documents (OCR). Detect emails, phones, SSNs, credit cards, license plates, addresses, contracts and custom entities with hybrid regex + NLP, in both directions. GDPR-ready.",
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
            text: "A PII detection API is a service that scans text for personally identifiable information (names, emails, phones, SSNs, credit cards, addresses) and returns entities with type, position and confidence — so you can mask, tokenize or block them before sending to an LLM, and again on the response the LLM returns.",
          },
        },
        {
          "@type": "Question",
          name: "What entities does Privaro's PII detection API detect?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Emails, phone numbers, SSNs, IBANs, credit cards, passport numbers, national ID numbers (with checksum validation for Spanish DNI/NIE), license plates, addresses, dates of birth, medical record numbers, contract clauses and custom regex/NLP entities defined per organization.",
          },
        },
        {
          "@type": "Question",
          name: "Can Privaro detect PII in photographed or scanned documents, not just text?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. The same detection engine runs on OCR-extracted text from photographed or scanned ID documents (national ID cards, passports, contracts) via a dedicated endpoint, with an optional cloud OCR pass for low-quality images. The response includes both the protected text and a redacted copy of the image with sensitive regions blacked out.",
          },
        },
        {
          "@type": "Question",
          name: "How fast is the API?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "P95 latency under 80ms for texts up to 4k tokens, in both directions — prompts going into the model and responses coming back. Runs at the edge and scales horizontally per organization.",
          },
        },
        ...faqs.map(({ q, a }) => ({
          "@type": "Question",
          name: q,
          acceptedAnswer: { "@type": "Answer", text: a },
        })),
      ],
    },
  ];

  const features = [
    { icon: Zap, title: t("piiApi.features.latency.title"), desc: t("piiApi.features.latency.desc") },
    { icon: Shield, title: t("piiApi.features.hybrid.title"), desc: t("piiApi.features.hybrid.desc") },
    { icon: Lock, title: t("piiApi.features.tokenization.title"), desc: t("piiApi.features.tokenization.desc") },
    { icon: Code, title: t("piiApi.features.rest.title"), desc: t("piiApi.features.rest.desc") },
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

  const protectRelaySample = `// Option A: detect only (inspect what's in a prompt)
POST /v1/detect
{ "text": "Call Maria at maria@company.com" }

// Option B: protect + relay (tokenize and forward to the LLM)
POST /v1/proxy/protect
{
  "text": "Call Maria at maria@company.com",
  "pipeline_id": "YOUR_PIPELINE_ID",
  "provider": "openai",
  "model": "gpt-4o"
}

// Response includes the LLM answer with tokens re-identified
{
  "result": "I'll contact Maria at maria@company.com",
  "entities_detected": 2,
  "risk_score": 0.68,
  "audit_log_id": "log_abc123"
}`;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Seo
        title="PII Detection API for LLMs — Prompts & Responses | Privaro"
        description="Privaro's PII Detection API scans LLM prompts and LLM responses for emails, phones, SSNs, contracts and custom entities in real time. Hybrid regex + NLP, P95 < 80ms in both directions, reversible tokenization."
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
            {t("piiApi.hero.badge")}
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold leading-[1.05] mb-6">
            {t("piiApi.hero.title1")}<br />
            <span className="text-gradient">{t("piiApi.hero.title2")}</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-10 leading-relaxed">
            {t("piiApi.hero.desc")}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/demo" className="px-8 py-3.5 rounded-md bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity glow-border">
              {t("piiApi.hero.cta.demo")}
            </Link>
            <Link to="/docs" className="px-8 py-3.5 rounded-md border border-border font-medium hover:bg-secondary transition-colors">
              {t("piiApi.hero.cta.docs")}
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-surface/30 border-y border-border">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("piiApi.featuresSection.title")}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t("piiApi.featuresSection.desc")}
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
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center">{t("piiApi.codeSection.title")}</h2>
          <p className="text-muted-foreground text-center mb-10">
            {t("piiApi.codeSection.desc")}
          </p>
          <pre className="p-6 rounded-lg border border-border bg-surface/40 overflow-x-auto text-sm leading-relaxed">
            <code>{codeSample}</code>
          </pre>
        </div>
      </section>

      {/* Why regex is not enough — comparison table */}
      <section className="py-20 bg-surface/30 border-y border-border">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center">Why regex alone misses 40% of PII</h2>
          <p className="text-muted-foreground text-center mb-10 max-w-2xl mx-auto">
            Pattern matching catches the easy entities. Contextual PII — names, addresses, medical conditions, contract
            clauses — requires language understanding. Privaro combines both in a single hybrid engine.
          </p>
          <div className="rounded-lg border border-border bg-surface/30 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold text-primary">Entity type</th>
                  <th className="text-center py-3 px-4 font-semibold text-primary">Regex</th>
                  <th className="text-center py-3 px-4 font-semibold text-primary">Privaro hybrid NLP</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { entity: "Email addresses", regex: "yes", hybrid: "yes" },
                  { entity: "Credit cards / IBANs", regex: "yes", hybrid: "yes" },
                  { entity: "Full names (contextual)", regex: "no", hybrid: "yes" },
                  { entity: "Addresses", regex: "no", hybrid: "yes" },
                  { entity: "Medical conditions", regex: "no", hybrid: "yes" },
                  { entity: "Contract clauses", regex: "no", hybrid: "yes" },
                  { entity: "Spanish DNI / NIE", regex: "partial", hybrid: "yes", hybridNote: "with checksum" },
                  { entity: "Custom entities", regex: "no", hybrid: "yes", hybridNote: "configurable" },
                ].map(({ entity, regex, hybrid, hybridNote }) => (
                  <tr key={entity} className="border-b border-border last:border-0">
                    <td className="py-3 px-4 text-foreground">{entity}</td>
                    <td className="py-3 px-4 text-center">
                      {regex === "yes" ? (
                        <CheckCircle2 className="w-4 h-4 text-green-400 inline-block" />
                      ) : regex === "partial" ? (
                        <span className="text-muted-foreground">Partial</span>
                      ) : (
                        <span className="text-muted-foreground">✗</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <CheckCircle2 className="w-4 h-4 text-green-400 inline-block" />
                      {hybridNote && <span className="text-muted-foreground ml-1 text-xs">({hybridNote})</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Supported entity types */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center">Supported entity types</h2>
          <p className="text-muted-foreground text-center mb-10 max-w-2xl mx-auto">
            Every detection result includes the entity type, exact position, and a confidence score — ready to route
            through your pipeline's policy engine.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              "PERSON_NAME",
              "EMAIL_ADDRESS",
              "PHONE_NUMBER",
              "NATIONAL_ID (DNI/NIE/SSN/passport)",
              "IBAN / CREDIT_CARD",
              "DATE_OF_BIRTH",
              "IP_ADDRESS",
              "MEDICAL_RECORD",
              "CONTRACT_CLAUSE",
              "CUSTOM (regex + NLP)",
            ].map((entity) => (
              <div
                key={entity}
                className="px-3 py-1.5 rounded-full border border-primary/30 bg-primary/5 text-sm font-mono text-primary flex items-center justify-center text-center"
              >
                {entity}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Second code sample — protect + relay */}
      <section className="py-20 bg-surface/30 border-y border-border">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center">Detect, or protect and relay</h2>
          <p className="text-muted-foreground text-center mb-10">
            Use <span className="font-mono text-primary">/v1/detect</span> to inspect a prompt, or{" "}
            <span className="font-mono text-primary">/v1/proxy/protect</span> to tokenize sensitive entities and forward
            the sanitized text to the LLM in one call.
          </p>
          <pre className="p-6 rounded-lg border border-border bg-surface/40 overflow-x-auto text-sm leading-relaxed">
            <code>{protectRelaySample}</code>
          </pre>
        </div>
      </section>

      {/* Performance */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold mb-10 text-center">Performance</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { value: "< 80ms", label: "P95 latency", detail: "texts up to 4k tokens" },
              { value: "F1 ≥ 0.95", label: "Detection accuracy", detail: "benchmark on EU financial corpus" },
              { value: "500 req/s", label: "Throughput", detail: "per tenant, horizontal scaling" },
              { value: "99.9%", label: "Availability SLA", detail: "Railway + Supabase redundancy" },
            ].map(({ value, label, detail }) => (
              <div key={label} className="p-6 rounded-lg border border-border bg-surface/40 text-center">
                <div className="text-3xl font-bold text-gradient mb-1">{value}</div>
                <div className="font-semibold text-sm mb-1">{label}</div>
                <div className="text-xs text-muted-foreground">{detail}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Compliance */}
      <section className="py-20 border-t border-border">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">{t("piiApi.compliance.title")}</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              t("piiApi.compliance.item1"),
              t("piiApi.compliance.item2"),
              t("piiApi.compliance.item3"),
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 p-4 rounded-md border border-border bg-surface/40">
                <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                <span className="text-sm">{item}</span>
              </div>
            ))}
          </div>
          <p className="text-muted-foreground text-center mt-8">
            {t("piiApi.compliance.pairs.text1")} <Link to="/ai-governance-platform" className="text-primary underline underline-offset-2">{t("piiApi.compliance.pairs.linkText")}</Link>{" "}
            {t("piiApi.compliance.pairs.text2")}
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-surface/30 border-y border-border">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold mb-10 text-center">Frequently asked questions</h2>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map(({ q, a }) => (
              <AccordionItem key={q} value={q}>
                <AccordionTrigger className="text-left text-base font-semibold hover:no-underline">
                  {q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  {a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 border-t border-border">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("piiApi.cta.title")}</h2>
          <p className="text-muted-foreground mb-8">
            {t("piiApi.cta.desc")}
          </p>
          <Link to="/demo" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-md bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity glow-border">
            {t("piiApi.cta.button")} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default PiiDetectionApi;
