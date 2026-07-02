import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Minus, ChevronDown, ChevronUp, Zap, Shield, Building2, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Seo from "@/components/Seo";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useLanguage } from "@/context/LanguageContext";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

const stagger = { visible: { transition: { staggerChildren: 0.09 } } };

type PlanKey = "starter" | "pro" | "enterprise";

interface Plan {
  key: PlanKey;
  icon: React.ElementType;
  name: string;
  badge?: string;
  monthlyPrice: number | null;
  annualPrice: number | null;
  desc: string;
  cta: string;
  ctaVariant: "outline" | "default";
  ctaHref: string;
  highlight: boolean;
  features: string[];
  notIncluded?: string[];
}

const COPY = {
  es: {
    badge: "Planes y precios",
    h1a: "Privacidad AI para",
    h1b: "equipos europeos",
    sub: "Proxy que controla, filtra y audita todo lo que va a tus LLMs. Sin cambiar tu stack. Sin fricción para el equipo.",
    monthly: "Mensual",
    annual: "Anual",
    toggleAria: "Alternar facturación anual",
    perMonth: "/ mes",
    custom: "A medida",
    annualBilling: (yearly: number) => `Facturación anual · €${yearly}/año`,
    monthlyBilling: (pct: number) => `Facturación mensual · ahorra ${pct}% con plan anual`,
    includesPro: "Todo en Starter, más",
    includesEnt: "Todo en Pro, más",
    includes: "Incluye",
    annualNote: "Precios en euros, IVA no incluido. Facturación anual anticipada. Mensual disponible con un 20% adicional.",
    stackTitle: "Compatible con tu stack de AI",
    compareKicker: "Comparativa completa",
    compareTitle: "Todo lo que incluye cada plan",
    feature: "Feature",
    faqKicker: "Preguntas frecuentes",
    faqTitle: "Todo lo que necesitas saber",
    ctaBadge: "Prueba gratuita 14 días",
    ctaTitle: "¿Dudas sobre qué plan encaja?",
    ctaBody: "Si estás en fase de evaluación o buscas validar el producto en un entorno real antes de comprometerte, hablamos directamente. Sin decks, sin demos enlatadas.",
    ctaPrimary: "Empezar con Pro gratis",
    ctaSecondary: "Hacer el AI Risk Assessment",
    ctaFoot: "Sin tarjeta de crédito · Sin compromiso · Cancela cuando quieras",
    plans: [
      {
        key: "starter" as PlanKey, icon: Zap, name: "Starter",
        monthlyPrice: 99, annualPrice: 79,
        desc: "Para equipos que empiezan a usar LLMs con datos de clientes.",
        cta: "Empezar gratis 14 días", ctaVariant: "outline" as const, ctaHref: "/auth", highlight: false,
        features: [
          "50.000 requests / mes",
          "Detección PII: email, teléfono, nombre, NIF/NIE",
          "Dashboard de auditoría en tiempo real",
          "1 proveedor LLM (OpenAI o Anthropic)",
          "Webhooks básicos — evento PII detected",
          "SDK Python + Node.js",
          "Top risk events — ventana 7 días",
          "Soporte por email",
        ],
        notIncluded: [
          "BYOK — no incluido",
          "DPO Report exportable — no incluido",
          "Multi-provider routing — no incluido",
          "Blockchain audit trail — no incluido",
        ],
      },
      {
        key: "pro" as PlanKey, icon: Shield, name: "Pro", badge: "Más elegido",
        monthlyPrice: 499, annualPrice: 399,
        desc: "Para SaaS con clientes regulados o en sectores con obligaciones GDPR activas.",
        cta: "Empezar gratis 14 días", ctaVariant: "default" as const, ctaHref: "/auth", highlight: true,
        features: [
          "500.000 requests / mes",
          "PII customizable — entidades propias",
          "Multi-provider routing — todos los LLMs",
          "BYOK — tus propias API keys de LLM",
          "DPO Report exportable en PDF",
          "Webhooks avanzados — 4 eventos",
          "MFA obligatorio para admin y DPO",
          "Blockchain audit trail iBS",
          "Timeseries dashboard + análisis por período",
          "SLA 24h por email",
        ],
      },
      {
        key: "enterprise" as PlanKey, icon: Building2, name: "Enterprise / ISV",
        monthlyPrice: null, annualPrice: null,
        desc: "Para ISVs que quieren embed Privaro en su producto o empresas con requisitos de compliance avanzados.",
        cta: "Hablar con nosotros", ctaVariant: "outline" as const, ctaHref: "/partners", highlight: false,
        features: [
          "Requests ilimitadas",
          "White-label / embedded en tu producto",
          "Tarifa fija basada en volumen (estándar) — revenue share disponible para ISVs en fase temprana",
          "Instancia dedicada en tu VPC",
          "ISMS ISO 27001:2022 docs incluidos",
          "Soporte Slack dedicado",
          "SLA 99,9% uptime garantizado",
          "Onboarding técnico 1:1 con el equipo",
          "Contrato NDA + DPA personalizado",
        ],
      },
    ] as Plan[],
    featureComparison: [
      { label: "Requests mensuales", starter: "50.000", pro: "500.000", enterprise: "Ilimitadas" },
      { label: "Detección PII básica", starter: true, pro: true, enterprise: true },
      { label: "Entidades PII customizables", starter: false, pro: true, enterprise: true },
      { label: "Dashboard de auditoría", starter: true, pro: true, enterprise: true },
      { label: "Multi-provider routing", starter: false, pro: true, enterprise: true },
      { label: "BYOK — API keys propias", starter: false, pro: true, enterprise: true },
      { label: "DPO Report PDF exportable", starter: false, pro: true, enterprise: true },
      { label: "Blockchain audit trail iBS", starter: false, pro: true, enterprise: true },
      { label: "Webhooks", starter: "Básico (1)", pro: "Avanzado (4)", enterprise: "Custom" },
      { label: "MFA admin / DPO", starter: false, pro: true, enterprise: true },
      { label: "SDK Python + Node.js", starter: true, pro: true, enterprise: true },
      { label: "White-label / embedded", starter: false, pro: false, enterprise: true },
      { label: "Instancia dedicada VPC", starter: false, pro: false, enterprise: true },
      { label: "SLA", starter: "—", pro: "24h email", enterprise: "99,9% uptime" },
      { label: "Soporte", starter: "Email", pro: "Email prioritario", enterprise: "Slack dedicado" },
    ] as { label: string; starter: boolean | string; pro: boolean | string; enterprise: boolean | string }[],
    faqs: [
      { q: "¿Cuánto tiempo tarda la integración?", a: "Menos de una hora con nuestro SDK de Python o Node. Es un cambio de endpoint en tu llamada al LLM — sin modificar la lógica de tu aplicación. Tienes una guía de quickstart en docs.privaro.ai." },
      { q: "¿Los datos de mis clientes pasan por vuestros servidores?", a: "Sí — el proxy intercepta la llamada, filtra el PII, y reenvía la versión limpia al LLM. En el plan Pro puedes usar BYOK para que las API keys sean las tuyas. En Enterprise puedes tener instancia dedicada en tu propia VPC para máximo aislamiento." },
      { q: "¿Qué pasa si supero el límite de requests?", a: "No bloqueamos tus llamadas. Te notificamos cuando llegas al 80% del límite. Puedes añadir requests adicionales (€15 por cada 100k extras) o hacer upgrade al plan siguiente sin perder datos ni configuración." },
      { q: "¿Funciona con modelos open source o self-hosted?", a: "Sí, en el plan Pro el multi-provider routing soporta cualquier endpoint compatible con la API de OpenAI — incluyendo Mistral, LLaMA vía Ollama o Groq, y modelos custom. Consulta la documentación de providers para la configuración específica." },
      { q: "¿Qué evidencia genera Privaro para cumplimiento GDPR / EU AI Act?", a: "El plan Pro genera DPO Reports exportables en PDF con resumen de eventos PII, categorías detectadas y período analizado. El blockchain audit trail iBS añade evidencia irrefutable con hash inmutable por evento — útil en auditorías y due diligence." },
      { q: "¿Tenéis prueba gratuita?", a: "Sí — 14 días con acceso completo al plan Pro sin tarjeta de crédito. Si necesitas más tiempo para evaluar en un entorno de producción real o tienes un caso de uso específico regulado, contáctanos directamente." },
      { q: "¿Ofrecéis descuento para startups o aceleradoras?", a: "Sí. Tenemos un programa específico para startups en fase seed o pre-seed, y para empresas participantes en programas de aceleración europeos. Escríbenos a hola@privaro.ai con el asunto 'Startup Program'." },
    ],
  },
  en: {
    badge: "Plans & pricing",
    h1a: "AI privacy for",
    h1b: "European teams",
    sub: "A proxy that controls, filters and audits everything that goes to your LLMs. Without changing your stack. Without friction for your team.",
    monthly: "Monthly",
    annual: "Annual",
    toggleAria: "Toggle annual billing",
    perMonth: "/ month",
    custom: "Custom",
    annualBilling: (yearly: number) => `Annual billing · €${yearly}/year`,
    monthlyBilling: (pct: number) => `Monthly billing · save ${pct}% with annual plan`,
    includesPro: "Everything in Starter, plus",
    includesEnt: "Everything in Pro, plus",
    includes: "Includes",
    annualNote: "Prices in euros, VAT not included. Annual billing paid upfront. Monthly available with a 20% surcharge.",
    stackTitle: "Compatible with your AI stack",
    compareKicker: "Full comparison",
    compareTitle: "Everything included in each plan",
    feature: "Feature",
    faqKicker: "Frequently asked questions",
    faqTitle: "Everything you need to know",
    ctaBadge: "14-day free trial",
    ctaTitle: "Not sure which plan fits?",
    ctaBody: "If you're evaluating or want to validate the product in a real environment before committing, let's talk directly. No decks, no canned demos.",
    ctaPrimary: "Start with Pro for free",
    ctaSecondary: "Run the AI Risk Assessment",
    ctaFoot: "No credit card · No commitment · Cancel anytime",
    plans: [
      {
        key: "starter" as PlanKey, icon: Zap, name: "Starter",
        monthlyPrice: 99, annualPrice: 79,
        desc: "For teams starting to use LLMs with customer data.",
        cta: "Start 14-day free trial", ctaVariant: "outline" as const, ctaHref: "/auth", highlight: false,
        features: [
          "50,000 requests / month",
          "PII detection: email, phone, name, national ID",
          "Real-time audit dashboard",
          "1 LLM provider (OpenAI or Anthropic)",
          "Basic webhooks — PII detected event",
          "Python + Node.js SDK",
          "Top risk events — 7-day window",
          "Email support",
        ],
        notIncluded: [
          "BYOK — not included",
          "Exportable DPO Report — not included",
          "Multi-provider routing — not included",
          "Blockchain audit trail — not included",
        ],
      },
      {
        key: "pro" as PlanKey, icon: Shield, name: "Pro", badge: "Most popular",
        monthlyPrice: 499, annualPrice: 399,
        desc: "For SaaS with regulated clients or in sectors with active GDPR obligations.",
        cta: "Start 14-day free trial", ctaVariant: "default" as const, ctaHref: "/auth", highlight: true,
        features: [
          "500,000 requests / month",
          "Customizable PII — your own entities",
          "Multi-provider routing — all LLMs",
          "BYOK — your own LLM API keys",
          "Exportable DPO Report in PDF",
          "Advanced webhooks — 4 events",
          "Mandatory MFA for admin and DPO",
          "iBS blockchain audit trail",
          "Timeseries dashboard + analysis by period",
          "24h email SLA",
        ],
      },
      {
        key: "enterprise" as PlanKey, icon: Building2, name: "Enterprise / ISV",
        monthlyPrice: null, annualPrice: null,
        desc: "For ISVs who want to embed Privaro in their product or companies with advanced compliance requirements.",
        cta: "Talk to us", ctaVariant: "outline" as const, ctaHref: "/partners", highlight: false,
        features: [
          "Unlimited requests",
          "White-label / embedded in your product",
          "Volume-based fixed fee (standard) — revenue share available for early-stage ISVs",
          "Dedicated instance in your VPC",
          "ISMS ISO 27001:2022 docs included",
          "Dedicated Slack support",
          "Guaranteed 99.9% uptime SLA",
          "1:1 technical onboarding with the team",
          "Custom NDA + DPA contract",
        ],
      },
    ] as Plan[],
    featureComparison: [
      { label: "Monthly requests", starter: "50,000", pro: "500,000", enterprise: "Unlimited" },
      { label: "Basic PII detection", starter: true, pro: true, enterprise: true },
      { label: "Customizable PII entities", starter: false, pro: true, enterprise: true },
      { label: "Audit dashboard", starter: true, pro: true, enterprise: true },
      { label: "Multi-provider routing", starter: false, pro: true, enterprise: true },
      { label: "BYOK — own API keys", starter: false, pro: true, enterprise: true },
      { label: "Exportable DPO Report PDF", starter: false, pro: true, enterprise: true },
      { label: "iBS blockchain audit trail", starter: false, pro: true, enterprise: true },
      { label: "Webhooks", starter: "Basic (1)", pro: "Advanced (4)", enterprise: "Custom" },
      { label: "Admin / DPO MFA", starter: false, pro: true, enterprise: true },
      { label: "Python + Node.js SDK", starter: true, pro: true, enterprise: true },
      { label: "White-label / embedded", starter: false, pro: false, enterprise: true },
      { label: "Dedicated VPC instance", starter: false, pro: false, enterprise: true },
      { label: "SLA", starter: "—", pro: "24h email", enterprise: "99.9% uptime" },
      { label: "Support", starter: "Email", pro: "Priority email", enterprise: "Dedicated Slack" },
    ] as { label: string; starter: boolean | string; pro: boolean | string; enterprise: boolean | string }[],
    faqs: [
      { q: "How long does the integration take?", a: "Less than an hour with our Python or Node SDK. It's an endpoint change in your LLM call — without modifying your application logic. There's a quickstart guide at docs.privaro.ai." },
      { q: "Does my customer data pass through your servers?", a: "Yes — the proxy intercepts the call, filters the PII, and forwards the clean version to the LLM. In the Pro plan you can use BYOK so the API keys are yours. In Enterprise you can have a dedicated instance in your own VPC for maximum isolation." },
      { q: "What happens if I exceed my request limit?", a: "We don't block your calls. We notify you when you reach 80% of the limit. You can add additional requests (€15 per extra 100k) or upgrade to the next plan without losing data or configuration." },
      { q: "Does it work with open source or self-hosted models?", a: "Yes, on the Pro plan multi-provider routing supports any OpenAI-API-compatible endpoint — including Mistral, LLaMA via Ollama or Groq, and custom models. Check the providers documentation for specific configuration." },
      { q: "What evidence does Privaro generate for GDPR / EU AI Act compliance?", a: "The Pro plan generates exportable DPO Reports in PDF with a summary of PII events, detected categories and analyzed period. The iBS blockchain audit trail adds irrefutable evidence with an immutable hash per event — useful in audits and due diligence." },
      { q: "Do you have a free trial?", a: "Yes — 14 days with full access to the Pro plan without a credit card. If you need more time to evaluate in a real production environment or have a specific regulated use case, contact us directly." },
      { q: "Do you offer discounts for startups or accelerators?", a: "Yes. We have a specific program for seed or pre-seed startups, and for companies participating in European acceleration programs. Email us at hola@privaro.ai with subject 'Startup Program'." },
    ],
  },
};

const providers = ["OpenAI", "Anthropic", "Mistral", "LangChain", "CrewAI", "Groq", "LLaMA", "Azure OpenAI"];

function CellValue({ val }: { val: boolean | string }) {
  if (val === true) return <Check className="w-4 h-4 text-primary mx-auto" />;
  if (val === false) return <Minus className="w-4 h-4 text-muted-foreground/40 mx-auto" />;
  return <span className="text-sm text-muted-foreground">{val}</span>;
}

export default function Pricing() {
  const { lang } = useLanguage();
  const c = COPY[lang];
  const [annual, setAnnual] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const getPrice = (plan: Plan) => {
    if (plan.monthlyPrice === null) return null;
    return annual ? plan.annualPrice! : plan.monthlyPrice;
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Seo
        title="Pricing — Privaro AI Privacy Proxy"
        description="Plans for teams adopting AI safely. Starter, Pro and Enterprise tiers with PII detection, BYOK and EU-hosted infrastructure."
        path="/pricing"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: c.faqs.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }}
      />
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            <motion.span variants={fadeUp} className="inline-block text-xs font-semibold uppercase tracking-widest text-primary bg-primary/10 border border-primary/30 rounded-full px-4 py-1.5 mb-6">
              {c.badge}
            </motion.span>
            <motion.h1 variants={fadeUp} className="text-4xl md:text-5xl font-bold mb-5 leading-tight">
              {c.h1a} <span className="text-primary">{c.h1b}</span>
            </motion.h1>
            <motion.p variants={fadeUp} className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
              {c.sub}
            </motion.p>

            {/* Billing toggle */}
            <motion.div variants={fadeUp} className="flex items-center justify-center gap-3 mb-12">
              <span className={`text-sm font-medium transition-colors ${!annual ? "text-foreground" : "text-muted-foreground"}`}>
                {c.monthly}
              </span>
              <button
                onClick={() => setAnnual(!annual)}
                className={`relative w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 ${annual ? "bg-primary" : "bg-muted"}`}
                aria-label={c.toggleAria}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${annual ? "translate-x-6" : "translate-x-0"}`}
                />
              </button>
              <span className={`text-sm font-medium transition-colors flex items-center gap-2 ${annual ? "text-foreground" : "text-muted-foreground"}`}>
                {c.annual}
                <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded-full px-2 py-0.5">
                  −20%
                </span>
              </span>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Plans */}
      <section className="pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={stagger}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {c.plans.map((plan) => {
              const price = getPrice(plan);
              const Icon = plan.icon;
              return (
                <motion.div
                  key={plan.key}
                  variants={fadeUp}
                  className={`relative rounded-xl border p-7 flex flex-col transition-all duration-200 ${
                    plan.highlight
                      ? "border-primary/60 bg-primary/5 ring-1 ring-primary/20"
                      : "border-border bg-card hover:border-border/80"
                  }`}
                >
                  {plan.badge && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                      <span className="text-xs font-semibold text-primary bg-background border border-primary/40 rounded-full px-3 py-1 whitespace-nowrap">
                        {plan.badge}
                      </span>
                    </div>
                  )}

                  <div className="mb-5">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-4 ${plan.highlight ? "bg-primary/15" : "bg-secondary"}`}>
                      <Icon className={`w-4 h-4 ${plan.highlight ? "text-primary" : "text-muted-foreground"}`} />
                    </div>
                    <p className="text-sm font-semibold text-muted-foreground mb-1">{plan.name}</p>

                    <AnimatePresence mode="wait">
                      {price !== null ? (
                        <motion.div
                          key={`${plan.key}-${annual}`}
                          initial={{ opacity: 0, y: -6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 6 }}
                          transition={{ duration: 0.18 }}
                          className="flex items-baseline gap-1.5 mb-1"
                        >
                          <span className="text-4xl font-bold text-foreground">€{price}</span>
                          <span className="text-sm text-muted-foreground">{c.perMonth}</span>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="enterprise-price"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="mb-1"
                        >
                          <span className="text-3xl font-bold text-foreground">{c.custom}</span>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {price !== null && (
                      <p className="text-xs text-muted-foreground">
                        {annual
                          ? c.annualBilling(price * 12)
                          : c.monthlyBilling(Math.round((1 - plan.annualPrice! / plan.monthlyPrice!) * 100))}
                      </p>
                    )}
                  </div>

                  <p className="text-sm text-muted-foreground mb-6 leading-relaxed">{plan.desc}</p>

                  <Button
                    variant={plan.ctaVariant}
                    className={`w-full mb-7 ${plan.highlight ? "bg-primary text-primary-foreground hover:bg-primary/90" : ""}`}
                    asChild
                  >
                    <Link to={plan.ctaHref}>
                      {plan.cta}
                      {plan.ctaVariant === "default" && <ArrowRight className="w-3.5 h-3.5 ml-1.5" />}
                    </Link>
                  </Button>

                  <div className="border-t border-border pt-6 flex-1">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4">
                      {plan.key === "pro" ? c.includesPro : plan.key === "enterprise" ? c.includesEnt : c.includes}
                    </p>
                    <ul className="space-y-3">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-start gap-2.5 text-sm text-foreground/85">
                          <Check className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                          {f}
                        </li>
                      ))}
                      {plan.notIncluded?.map((f) => (
                        <li key={f} className="flex items-start gap-2.5 text-sm text-muted-foreground/50">
                          <Minus className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {annual && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-xs text-muted-foreground mt-6"
            >
              {c.annualNote}
            </motion.p>
          )}
        </div>
      </section>

      {/* Providers strip */}
      <section className="py-10 px-6 border-y border-border bg-card/30">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-6 font-medium">
            {c.stackTitle}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {providers.map((p) => (
              <span
                key={p}
                className="text-xs font-medium px-3 py-1.5 rounded-full border border-border bg-secondary text-muted-foreground"
              >
                {p}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Feature comparison table */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={fadeUp}
            className="text-center mb-12"
          >
            <p className="text-xs font-bold tracking-widest text-primary uppercase mb-3">{c.compareKicker}</p>
            <h2 className="text-2xl md:text-3xl font-bold">{c.compareTitle}</h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.05 }}
            variants={fadeUp}
            className="overflow-x-auto rounded-xl border border-border"
          >
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-card">
                  <th className="text-left py-4 px-5 font-medium text-muted-foreground w-2/5">{c.feature}</th>
                  <th className="text-center py-4 px-4 font-semibold text-foreground">Starter</th>
                  <th className="text-center py-4 px-4 font-semibold text-primary bg-primary/5">Pro</th>
                  <th className="text-center py-4 px-4 font-semibold text-foreground">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {c.featureComparison.map((row, i) => (
                  <tr
                    key={row.label}
                    className={`border-b border-border last:border-0 transition-colors hover:bg-secondary/30 ${i % 2 === 0 ? "bg-background" : "bg-card/40"}`}
                  >
                    <td className="py-3.5 px-5 text-muted-foreground">{row.label}</td>
                    <td className="py-3.5 px-4 text-center">
                      <CellValue val={row.starter} />
                    </td>
                    <td className="py-3.5 px-4 text-center bg-primary/5">
                      <CellValue val={row.pro} />
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <CellValue val={row.enterprise} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section className="pb-20 px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={fadeUp}
            className="text-center mb-10"
          >
            <p className="text-xs font-bold tracking-widest text-primary uppercase mb-3">{c.faqKicker}</p>
            <h2 className="text-2xl md:text-3xl font-bold">{c.faqTitle}</h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.05 }}
            variants={stagger}
            className="space-y-2"
          >
            {c.faqs.map((faq, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                className="border border-border rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left text-sm font-medium text-foreground hover:bg-secondary/40 transition-colors"
                >
                  {faq.q}
                  {openFaq === i
                    ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" />
                    : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />}
                </button>
                <AnimatePresence initial={false}>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22, ease: "easeInOut" }}
                    >
                      <p className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed border-t border-border pt-4">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA bottom */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeUp}
            className="relative rounded-2xl border border-primary/30 bg-primary/5 p-10 text-center overflow-hidden"
          >
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-primary/10 blur-3xl rounded-full" />
            </div>

            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-primary bg-primary/10 border border-primary/30 rounded-full px-4 py-1.5 mb-5">
              {c.ctaBadge}
            </span>
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              {c.ctaTitle}
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto leading-relaxed">
              {c.ctaBody}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="lg" asChild>
                <Link to="/auth">
                  {c.ctaPrimary}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/ai-risk-assessment">{c.ctaSecondary}</Link>
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-5">
              {c.ctaFoot}
            </p>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
