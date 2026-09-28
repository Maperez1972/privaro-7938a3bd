// Internal linking for blog posts. Every post automatically gets 3 related site pages
// (comparisons, pricing, docs, use cases…) chosen from its tags/keyword, or from an
// explicit `relatedPages` list on the post. New posts need no extra work.
import type { Language } from "@/context/LanguageContext";

export interface SitePage {
  path: string;
  en: { title: string; desc: string };
  es: { title: string; desc: string };
}

export const SITE_PAGES: Record<string, SitePage> = {
  "/pricing": {
    path: "/pricing",
    en: { title: "Pricing", desc: "Starter, Business and Enterprise plans with a 14-day free trial." },
    es: { title: "Precios", desc: "Planes Starter, Business y Enterprise con 14 días de prueba gratis." },
  },
  "/docs": {
    path: "/docs",
    en: { title: "Documentation", desc: "Quickstart, SDKs and integration guides." },
    es: { title: "Documentación", desc: "Guía rápida, SDKs e integraciones." },
  },
  "/docs/api": {
    path: "/docs/api",
    en: { title: "API Reference", desc: "Every Privaro proxy endpoint, from the live OpenAPI spec." },
    es: { title: "Referencia de la API", desc: "Todos los endpoints del proxy, desde el OpenAPI en vivo." },
  },
  "/use-cases/agents": {
    path: "/use-cases/agents",
    en: { title: "Privaro for AI agents", desc: "Runtime data governance for autonomous and multi-agent systems." },
    es: { title: "Privaro para agentes de IA", desc: "Gobierno de datos en tiempo de ejecución para agentes." },
  },
  "/eu-ai-act-compliance": {
    path: "/eu-ai-act-compliance",
    en: { title: "EU AI Act compliance guide", desc: "Key dates, risk tiers and a 10-step checklist." },
    es: { title: "Guía de cumplimiento EU AI Act", desc: "Fechas clave, niveles de riesgo y checklist en 10 pasos." },
  },
  "/security": {
    path: "/security",
    en: { title: "Security", desc: "Encryption, audit trail and GDPR controls." },
    es: { title: "Seguridad", desc: "Cifrado, registro de auditoría y controles RGPD." },
  },
  "/pii-detection-api": {
    path: "/pii-detection-api",
    en: { title: "PII Detection API", desc: "Entity types, code samples and response format." },
    es: { title: "API de detección de PII", desc: "Tipos de entidad, ejemplos de código y respuesta." },
  },
  "/rag-pii-protection": {
    path: "/rag-pii-protection",
    en: { title: "RAG PII protection", desc: "Protect documents at ingest and chunks at retrieval." },
    es: { title: "Protección de PII en RAG", desc: "Protege documentos al indexar y fragmentos al recuperar." },
  },
  "/ai-governance-platform": {
    path: "/ai-governance-platform",
    en: { title: "AI governance platform", desc: "How Privaro governs every LLM call." },
    es: { title: "Plataforma de gobierno de IA", desc: "Cómo Privaro gobierna cada llamada a un LLM." },
  },
  "/vs/private-ai": {
    path: "/vs/private-ai",
    en: { title: "Privaro vs Private AI", desc: "Runtime proxy vs PII redaction library." },
    es: { title: "Privaro vs Private AI", desc: "Proxy en tiempo de ejecución frente a librería de redacción." },
  },
  "/vs/nightfall": {
    path: "/vs/nightfall",
    en: { title: "Privaro vs Nightfall", desc: "LLM-native governance vs DLP." },
    es: { title: "Privaro vs Nightfall", desc: "Gobierno nativo para LLM frente a DLP." },
  },
  "/vs/skyflow": {
    path: "/vs/skyflow",
    en: { title: "Privaro vs Skyflow", desc: "AI proxy vs data privacy vault." },
    es: { title: "Privaro vs Skyflow", desc: "Proxy de IA frente a bóveda de datos." },
  },
  "/vs/microsoft-purview": {
    path: "/vs/microsoft-purview",
    en: { title: "Privaro vs Microsoft Purview", desc: "Runtime LLM control vs data catalog governance." },
    es: { title: "Privaro vs Microsoft Purview", desc: "Control de LLM en ejecución frente a catálogo de datos." },
  },
  "/vs/onetrust": {
    path: "/vs/onetrust",
    en: { title: "Privaro vs OneTrust", desc: "Enforcement layer vs policy management." },
    es: { title: "Privaro vs OneTrust", desc: "Capa de aplicación frente a gestión de políticas." },
  },
};

// Keyword (lower-case substring of tags/keyword) → candidate pages, most relevant first.
const TOPIC_RULES: { match: string[]; pages: string[] }[] = [
  { match: ["agent", "agente"], pages: ["/use-cases/agents", "/vs/microsoft-purview", "/docs/api"] },
  { match: ["rag", "retrieval"], pages: ["/rag-pii-protection", "/docs/api", "/vs/private-ai"] },
  { match: ["eu ai act"], pages: ["/eu-ai-act-compliance", "/vs/onetrust", "/pricing"] },
  { match: ["gdpr", "compliance", "audit"], pages: ["/security", "/vs/onetrust", "/eu-ai-act-compliance"] },
  { match: ["pii", "openai", "developer", "streaming", "llm"], pages: ["/pii-detection-api", "/docs/api", "/vs/private-ai"] },
  { match: ["anthropic", "privacy"], pages: ["/security", "/vs/nightfall", "/docs"] },
  { match: ["buyer", "governance", "gobernanza", "enterprise"], pages: ["/ai-governance-platform", "/vs/skyflow", "/pricing"] },
  { match: ["erp", "case study"], pages: ["/use-cases/agents", "/pricing", "/docs"] },
];

const FALLBACK = ["/pricing", "/docs/api", "/vs/private-ai"];

export function getRelatedPages(
  post: { tags: string[]; keyword: string; relatedPages?: string[] },
  lang: Language,
  count = 3,
): { path: string; title: string; desc: string }[] {
  const haystack = [...post.tags, post.keyword].join(" ").toLowerCase();
  const picked: string[] = [];
  const add = (p: string) => {
    if (SITE_PAGES[p] && !picked.includes(p)) picked.push(p);
  };
  (post.relatedPages ?? []).forEach(add);
  for (const rule of TOPIC_RULES) {
    if (rule.match.some((m) => haystack.includes(m))) rule.pages.forEach(add);
  }
  FALLBACK.forEach(add);
  return picked.slice(0, count).map((p) => ({ path: p, ...SITE_PAGES[p][lang] }));
}
