import { Link } from "react-router-dom";
import { useLanguage } from "@/context/LanguageContext";
import { FileStack, ShieldCheck, KeyRound, Zap, CheckCircle2, ArrowRight, Terminal, Lock } from "lucide-react";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Seo from "@/components/Seo";

const faqKeys = [1, 2, 3, 4, 5] as const;

const RagProtection = () => {
  const { t } = useLanguage();

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "Privaro Ingest & Retrieval Guard",
      applicationCategory: "DeveloperApplication",
      operatingSystem: "REST API",
      description:
        "PII protection for RAG pipelines: Privaro Ingest protects documents (text or file upload — PDF, DOCX, XLSX, CSV, EML) before indexing, and Privaro Retrieval Guard scans retrieved chunks with per-chunk access control before they reach an LLM's context.",
      offers: { "@type": "Offer", price: "400", priceCurrency: "EUR" },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqKeys.map((i) => ({
        "@type": "Question",
        name: t(`ragProtection.faq.q${i}`),
        acceptedAnswer: { "@type": "Answer", text: t(`ragProtection.faq.a${i}`) },
      })),
    },
  ];

  const features = [
    { icon: FileStack, title: t("ragProtection.features.ingest.title"), desc: t("ragProtection.features.ingest.desc") },
    { icon: ShieldCheck, title: t("ragProtection.features.retrieval.title"), desc: t("ragProtection.features.retrieval.desc") },
    { icon: KeyRound, title: t("ragProtection.features.access.title"), desc: t("ragProtection.features.access.desc") },
    { icon: Zap, title: t("ragProtection.features.cache.title"), desc: t("ragProtection.features.cache.desc") },
  ];

  const ingestTextSample = `POST https://api.privaro.ai/v1/proxy/protect-document
X-Privaro-Key: YOUR_API_KEY
Content-Type: application/json

{
  "pipeline_id": "YOUR_PIPELINE_ID",
  "document": "Full document text — up to 2,000,000 characters",
  "options": { "mode": "tokenise", "chunk_size": 512 }
}

// Response (documents under ~20,000 characters — synchronous)
{
  "status": "completed",
  "protected_document": "...",
  "chunks": [
    { "index": 0, "text": "...", "char_start": 0, "char_end": 511 }
  ],
  "detections": [ ... ],
  "stats": { "total_detected": 12, "chunk_count": 8, "processing_ms": 340 }
}`;

  const ingestFileSample = `POST https://api.privaro.ai/v1/proxy/protect-document/upload
X-Privaro-Key: YOUR_API_KEY
Content-Type: multipart/form-data

file: report.pdf
pipeline_id: YOUR_PIPELINE_ID
mode: tokenise

// Same response shape as the text endpoint above —
// PDF, DOCX, XLSX, CSV and EML are extracted server-side.`;

  const retrievalSample = `POST https://api.privaro.ai/v1/proxy/protect-retrieval
X-Privaro-Key: YOUR_API_KEY
Content-Type: application/json

{
  "pipeline_id": "YOUR_PIPELINE_ID",
  "chunks": [
    { "id": "chunk_123", "text": "...", "allowed_roles": ["finance"] },
    { "id": "chunk_456", "text": "..." }
  ],
  "requester": { "role": "support-agent" }
}

// Response
{
  "allowed_chunks": [
    { "id": "chunk_456", "protected_text": "...", "from_cache": false }
  ],
  "blocked_chunks": [
    { "id": "chunk_123", "reason": "access_denied" }
  ],
  "stats": { "chunks_allowed": 1, "chunks_blocked": 1, "cache_hits": 0 }
}`;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Seo
        title="PII Protection for RAG Pipelines — Privaro Ingest & Retrieval Guard"
        description="Protect documents before they're indexed and retrieved chunks before they reach your LLM. Privaro Ingest accepts text or file upload (PDF, DOCX, XLSX, CSV, EML); Privaro Retrieval Guard adds per-chunk access control and content-hash caching."
        path="/rag-pii-protection"
        jsonLd={jsonLd}
      />
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 grid-pattern opacity-40" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-primary/5 blur-[120px]" />
        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full border border-border bg-surface/50 text-sm text-muted-foreground">
            <FileStack className="w-4 h-4 text-primary" />
            {t("ragProtection.hero.badge")}
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold leading-[1.05] mb-6">
            {t("ragProtection.hero.title1")}<br />
            <span className="text-gradient">{t("ragProtection.hero.title2")}</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-10 leading-relaxed">
            {t("ragProtection.hero.desc")}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/demo" className="px-8 py-3.5 rounded-md bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity glow-border">
              {t("ragProtection.hero.cta.demo")}
            </Link>
            <Link to="/docs" className="px-8 py-3.5 rounded-md border border-border font-medium hover:bg-secondary transition-colors">
              {t("ragProtection.hero.cta.docs")}
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-surface/30 border-y border-border">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("ragProtection.featuresSection.title")}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t("ragProtection.featuresSection.desc")}
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

      {/* Ingest — text */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center">{t("ragProtection.codeSection.title")}</h2>
          <p className="text-muted-foreground text-center mb-10">
            {t("ragProtection.codeSection.desc")}
          </p>
          <pre className="p-6 rounded-lg border border-border bg-surface/40 overflow-x-auto text-sm leading-relaxed">
            <code>{ingestTextSample}</code>
          </pre>
        </div>
      </section>

      {/* Ingest — file upload */}
      <section className="py-20 bg-surface/30 border-y border-border">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center">{t("ragProtection.formats.title")}</h2>
          <p className="text-muted-foreground text-center mb-10 max-w-2xl mx-auto">
            {t("ragProtection.formats.desc")}
          </p>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-10">
            {["PDF", "DOCX", "XLSX", "CSV", "EML", "Plain text"].map((fmt) => (
              <div
                key={fmt}
                className="px-3 py-1.5 rounded-full border border-primary/30 bg-primary/5 text-sm font-mono text-primary flex items-center justify-center text-center"
              >
                {fmt}
              </div>
            ))}
          </div>
          <pre className="p-6 rounded-lg border border-border bg-surface/40 overflow-x-auto text-sm leading-relaxed">
            <code>{ingestFileSample}</code>
          </pre>
        </div>
      </section>

      {/* Retrieval Guard */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center">{t("ragProtection.retrievalSection.title")}</h2>
          <p className="text-muted-foreground text-center mb-10">
            {t("ragProtection.retrievalSection.desc")}
          </p>
          <pre className="p-6 rounded-lg border border-border bg-surface/40 overflow-x-auto text-sm leading-relaxed">
            <code>{retrievalSample}</code>
          </pre>
        </div>
      </section>

      {/* Integrations */}
      <section className="py-20 bg-surface/30 border-y border-border">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-8">{t("ragProtection.integrations.title")}</h2>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {["LangChain", "CrewAI", "OpenAI Agents SDK", "n8n", "Python SDK", "JS / TS SDK"].map((tool) => (
              <div key={tool} className="px-4 py-2 rounded-md border border-border bg-background text-sm font-medium">
                {tool}
              </div>
            ))}
          </div>
          <p className="text-muted-foreground text-sm mt-6">
            {t("ragProtection.integrations.desc")}
          </p>
        </div>
      </section>

      {/* Compliance */}
      <section className="py-20 border-t border-border">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">{t("ragProtection.compliance.title")}</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              t("ragProtection.compliance.item1"),
              t("ragProtection.compliance.item2"),
              t("ragProtection.compliance.item3"),
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 p-4 rounded-md border border-border bg-surface/40">
                <Lock className="w-5 h-5 text-primary flex-shrink-0" />
                <span className="text-sm">{item}</span>
              </div>
            ))}
          </div>
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
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("ragProtection.cta.title")}</h2>
          <p className="text-muted-foreground mb-8">
            {t("ragProtection.cta.desc")}
          </p>
          <Link to="/demo" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-md bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity glow-border">
            {t("ragProtection.cta.button")} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default RagProtection;
