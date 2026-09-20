import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Seo from "@/components/Seo";
import Footer from "@/components/Footer";
import { useLanguage } from "@/context/LanguageContext";
import { ArrowRight } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" as const } },
};

const stagger = { visible: { transition: { staggerChildren: 0.07 } } };

type Tag = "feature" | "fix" | "security" | "infra" | "sdk" | "performance" | "integration";

/** Either a translation key (resolved via t()) or inline bilingual text. */
type Localized = string | { en: string; es: string };

interface Entry {
  date: string;
  version: Localized;
  title: Localized;
  desc: Localized;
  tags: Tag[];
  items: Localized[];
}

const ENTRIES: Entry[] = [
  {
    date: "2026-09-20",
    version: "v1.0",
    title: { en: "Retrieval Guard & Document Ingestion Pipeline", es: "Retrieval Guard y pipeline de ingesta de documentos" },
    desc: {
      en: "PII protection for RAG pipelines, asynchronous document ingestion and partner sub-account provisioning.",
      es: "Protección PII para pipelines RAG, ingesta asíncrona de documentos y aprovisionamiento de subcuentas para partners.",
    },
    tags: ["feature", "infra"],
    items: [
      {
        en: "✨ Privaro Retrieval Guard — POST /v1/proxy/protect-retrieval. PII protection for RAG pipelines. Scans retrieved chunks before they are injected into LLM context. Prevents PII from knowledge bases reaching models even when the original documents were ingested without protection. SDK: protect_retrieval() in Python SDK v0.7.0 and JS SDK v0.6.0.",
        es: "✨ Privaro Retrieval Guard — POST /v1/proxy/protect-retrieval. Protección PII para pipelines RAG. Escanea los fragmentos recuperados antes de inyectarlos en el contexto del LLM. Evita que la PII de las bases de conocimiento llegue a los modelos aunque los documentos originales se ingirieran sin protección. SDK: protect_retrieval() en Python SDK v0.7.0 y JS SDK v0.6.0.",
      },
      {
        en: "✨ Privaro Ingest — async document ingestion pipeline. Asynchronous ingestion worker (separate Railway service) for large document indexing. Consumes the ingestion_jobs table. Runs in an isolated process to prevent ONNX Runtime crashes from affecting the live API. Supports PDF, DOCX, XLSX, CSV, EML up to 20MB. SDK: protect_document() in Python SDK v0.6.0 and JS SDK v0.5.0.",
        es: "✨ Privaro Ingest — pipeline asíncrono de ingesta de documentos. Worker asíncrono de ingesta (servicio Railway independiente) para indexar documentos de gran tamaño. Consume la tabla ingestion_jobs. Se ejecuta en un proceso aislado para que los crashes de ONNX Runtime no afecten a la API en producción. Soporta PDF, DOCX, XLSX, CSV y EML hasta 20MB. SDK: protect_document() en Python SDK v0.6.0 y JS SDK v0.5.0.",
      },
      {
        en: "✨ Partner API — sub-account provisioning. Partners (ISVs) can now create and read sub-accounts programmatically via POST /v1/partner/sub-accounts. Permissions: partner:read_children / partner:write_children. Enables zero-touch client onboarding from a partner's backend.",
        es: "✨ Partner API — aprovisionamiento de subcuentas. Los partners (ISV) ya pueden crear y leer subcuentas programáticamente vía POST /v1/partner/sub-accounts. Permisos: partner:read_children / partner:write_children. Permite el alta de clientes sin intervención desde el backend del partner.",
      },
      {
        en: "⚡ Web — comparison pages + badges. Two new competitor comparison pages added. AlternativeTo and LaunchNest badges added to homepage. LinkedIn added to footer. Google Analytics GA4 events on Auth and Demo flows.",
        es: "⚡ Web — páginas comparativas y badges. Añadidas dos nuevas páginas de comparativa con competidores. Badges de AlternativeTo y LaunchNest en la portada. LinkedIn añadido al footer. Eventos de Google Analytics GA4 en los flujos de Auth y Demo.",
      },
    ],
  },
  {
    date: "2026-08-27",
    version: "v0.13",
    title: { en: "Image Document Protection & OCR", es: "Protección de documentos en imagen y OCR" },
    desc: {
      en: "Protect photographed or scanned documents with OCR-backed PII detection and redacted image output.",
      es: "Protege documentos fotografiados o escaneados con detección PII asistida por OCR e imagen censurada.",
    },
    tags: ["feature", "security"],
    items: [
      {
        en: "✨ POST /v1/proxy/protect-image-document. Protect photographed or scanned documents (DNI, contracts, screenshots). Tier 1 OCR via Tesseract extracts text, detects PII, and returns both the protected text and a redacted image with PII regions blacked out. Tier 2 OCR (Google Cloud Vision) available as fallback for low-confidence results. Supports JPEG, PNG, WebP, TIFF up to 15MB.",
        es: "✨ POST /v1/proxy/protect-image-document. Protege documentos fotografiados o escaneados (DNI, contratos, capturas). OCR Tier 1 vía Tesseract extrae el texto, detecta PII y devuelve tanto el texto protegido como una imagen censurada con las regiones PII tapadas. OCR Tier 2 (Google Cloud Vision) como fallback para resultados de baja confianza. Soporta JPEG, PNG, WebP y TIFF hasta 15MB.",
      },
      {
        en: "✨ New entity types: license_plate, address. License plate added as a direct identifier. Address entity type added — resolves overlap conflict with full_name when a street is named after a person.",
        es: "✨ Nuevos tipos de entidad: license_plate, address. Matrícula añadida como identificador directo. Nuevo tipo de entidad dirección — resuelve el conflicto de solapamiento con full_name cuando una calle lleva el nombre de una persona.",
      },
      {
        en: "🔐 Spanish DNI/NIE checksum verification. DNI and NIE control letters now verified via the real mod-23 checksum algorithm. Confidence adjusted accordingly. Eliminates false positives on digit sequences that look like DNIs but are mathematically invalid.",
        es: "🔐 Verificación de checksum de DNI/NIE español. La letra de control de DNI y NIE ahora se verifica con el algoritmo real de checksum mod-23. Confianza ajustada en consecuencia. Elimina falsos positivos en secuencias de dígitos que parecen DNI pero son matemáticamente inválidos.",
      },
    ],
  },
  {
    date: "2026-08-10",
    version: "v0.12",
    title: { en: "Output-Direction PII Detection & Context Optimization", es: "Detección PII en la salida y Optimización de Contexto" },
    desc: {
      en: "LLM responses are now scanned for PII, plus token-preserving context compression and critical performance fixes.",
      es: "Las respuestas del LLM ahora se escanean en busca de PII, además de compresión de contexto que preserva tokens y correcciones críticas de rendimiento.",
    },
    tags: ["feature", "performance", "fix"],
    items: [
      {
        en: "✨ Output-direction PII detection. LLM responses are now scanned for PII before being returned to the caller. Catches data leaks in the output direction — not just inputs. Available in /v1/agent/protect and /v1/relay/stream. SDK: protect_output() in Python SDK v0.5.0 and JS SDK v0.4.0.",
        es: "✨ Detección PII en dirección de salida. Las respuestas del LLM ahora se escanean en busca de PII antes de devolverlas al llamante. Detecta fugas de datos en la salida — no solo en la entrada. Disponible en /v1/agent/protect y /v1/relay/stream. SDK: protect_output() en Python SDK v0.5.0 y JS SDK v0.4.0.",
      },
      {
        en: "✨ Context Optimization — token compression. Privaro tokens are extracted before compression and restored byte-for-byte after, preserving de-tokenisation correctness. Uses Headroom/Kompress for prose compression. Reduces context size before LLM calls without breaking the token map.",
        es: "✨ Context Optimization — compresión de tokens. Los tokens de Privaro se extraen antes de comprimir y se restauran byte a byte después, preservando la corrección de la de-tokenización. Usa Headroom/Kompress para comprimir prosa. Reduce el tamaño del contexto antes de las llamadas al LLM sin romper el mapa de tokens.",
      },
      {
        en: "🐛 fix(CRITICAL) — Context Optimization event loop block. compress_protected_messages() was blocking the entire asyncio event loop. Moved to thread executor.",
        es: "🐛 fix(CRÍTICO) — Bloqueo del event loop en Context Optimization. compress_protected_messages() bloqueaba todo el event loop de asyncio. Movido a un thread executor.",
      },
      {
        en: "🐛 fix(CRITICAL) — Kompress warmup checked wrong object. warmup_kompress() and the /health kompress_ready check both warmed a throwaway instance disconnected from the actual pipeline singleton. Context Optimization had silently never worked in production. Fixed by reaching into the real pipeline singleton.",
        es: "🐛 fix(CRÍTICO) — El warmup de Kompress comprobaba el objeto equivocado. warmup_kompress() y el check kompress_ready de /health calentaban una instancia desechable desconectada del singleton real del pipeline. Context Optimization nunca había funcionado en producción. Corregido accediendo al singleton real del pipeline.",
      },
      {
        en: "🐛 fix(CRITICAL) — Detector O(n²) overlap check. The overlap deduplication in detector.py was O(n²). Fixed to O(n) — 16.6x speedup measured at 1M characters in production smoke tests.",
        es: "🐛 fix(CRÍTICO) — Check de solapamientos O(n²) en el detector. La deduplicación de solapamientos en detector.py era O(n²). Corregida a O(n) — speedup de 16.6x medido con 1M de caracteres en smoke tests de producción.",
      },
      {
        en: "🐛 fix — OpenAI o1/o3/gpt-5 compatibility. These models require max_completion_tokens instead of max_tokens and reject the temperature parameter. Both now handled automatically by the LLM router.",
        es: "🐛 fix — Compatibilidad con OpenAI o1/o3/gpt-5. Estos modelos requieren max_completion_tokens en lugar de max_tokens y rechazan el parámetro temperature. Ambos casos se gestionan automáticamente en el router de LLMs.",
      },
    ],
  },
  {
    date: "2026-07-27",
    version: "v0.11",
    title: { en: "n8n Community Node & JS/TS SDK", es: "Nodo comunitario de n8n y SDK JS/TS" },
    desc: {
      en: "Native n8n integration, official JavaScript/TypeScript SDK and verified integration examples.",
      es: "Integración nativa con n8n, SDK oficial de JavaScript/TypeScript y ejemplos de integración verificados.",
    },
    tags: ["feature", "integration"],
    items: [
      {
        en: "✨ n8n community node — n8n-nodes-privaro. Install directly from the n8n UI (Settings → Community Nodes → n8n-nodes-privaro). Operations: Detect, Protect, Chat Completion (Relay), Detokenize. Understands Privaro's token/conversation_id model natively. npm: n8n-nodes-privaro.",
        es: "✨ Nodo comunitario de n8n — n8n-nodes-privaro. Instalable directamente desde la UI de n8n (Settings → Community Nodes → n8n-nodes-privaro). Operaciones: Detect, Protect, Chat Completion (Relay), Detokenize. Entiende nativamente el modelo de tokens/conversation_id de Privaro. npm: n8n-nodes-privaro.",
      },
      {
        en: "✨ JS/TS SDK — privaro-sdk (npm). JavaScript/TypeScript SDK for Node.js and edge runtimes. Zero runtime dependencies — uses built-in fetch. Adapters for OpenAI, LangChain, Vercel AI SDK. npm install privaro-sdk.",
        es: "✨ SDK JS/TS — privaro-sdk (npm). SDK de JavaScript/TypeScript para Node.js y runtimes edge. Cero dependencias en runtime — usa el fetch nativo. Adaptadores para OpenAI, LangChain y Vercel AI SDK. npm install privaro-sdk.",
      },
      {
        en: "✨ Integration example repositories. Official example repositories published for LangChain, CrewAI, OpenAI Agents, and n8n. Each includes a working .env.example and verified API contract. Full Agent API guide at github.com/Maperez1972/privaro-agents.",
        es: "✨ Repositorios de ejemplos de integración. Publicados repositorios oficiales de ejemplo para LangChain, CrewAI, OpenAI Agents y n8n. Cada uno incluye un .env.example funcional y un contrato de API verificado. Guía completa de la Agent API en github.com/Maperez1972/privaro-agents.",
      },
    ],
  },
  {
    date: "2026-07-24",
    version: "v0.10",
    title: { en: "Streaming Relay & SDK v0.3", es: "Streaming Relay y SDK v0.3" },
    desc: {
      en: "SSE streaming from any LLM provider with PII protection on both directions.",
      es: "Streaming SSE desde cualquier proveedor LLM con protección PII en ambas direcciones.",
    },
    tags: ["feature", "fix"],
    items: [
      {
        en: "✨ Streaming relay — POST /v1/relay/stream. Server-Sent Events (SSE) streaming from any LLM provider. PII tokenised before the request, output scanned post-stream for leaks. Token map resolved on stream close.",
        es: "✨ Streaming relay — POST /v1/relay/stream. Streaming Server-Sent Events (SSE) desde cualquier proveedor LLM. PII tokenizada antes de la petición, salida escaneada tras el stream en busca de fugas. Mapa de tokens resuelto al cerrar el stream.",
      },
      {
        en: "✨ Python SDK v0.3.0. relay() and relay_stream() methods added. Critical auth bug fixed in AgentRun (both sync and async). PyPI publish workflow via OIDC Trusted Publishing.",
        es: "✨ Python SDK v0.3.0. Añadidos los métodos relay() y relay_stream(). Corregido un bug crítico de autenticación en AgentRun (síncrono y asíncrono). Workflow de publicación en PyPI vía OIDC Trusted Publishing.",
      },
    ],
  },
  {
    date: "2026-05-03",
    version: "v0.9",
    title: { en: "AI Risk Assessment, Leads Dashboard & NLP Fixes", es: "AI Risk Assessment, dashboard de leads y correcciones NLP" },
    desc: {
      en: "New conversion landing, admin leads dashboard and NLP false-positive fixes.",
      es: "Nueva landing de conversión, dashboard de leads para admin y corrección de falsos positivos del NLP.",
    },
    tags: ["feature", "fix", "security"],
    items: [
      {
        en: "✨ AI Risk Assessment page — /ai-risk-assessment. New conversion landing. Lead capture with role, company size and AI tools fields. Leads stored in demo_requests and notified to info@icommunity.io.",
        es: "✨ Página AI Risk Assessment — /ai-risk-assessment. Nueva landing de conversión. Captura de leads con campos de rol, tamaño de empresa y herramientas de IA. Leads almacenados en demo_requests y notificados a info@icommunity.io.",
      },
      {
        en: "✨ Admin Leads dashboard — /app/admin/leads. View, filter and act on leads from AI Risk Assessment and Beta forms. Detail drawer with mailto actions. Accessible to admin and DPO roles.",
        es: "✨ Dashboard Admin Leads — /app/admin/leads. Ver, filtrar y actuar sobre los leads de AI Risk Assessment y del formulario Beta. Drawer de detalle con acciones mailto. Accesible para los roles admin y DPO.",
      },
      {
        en: "✨ Home conversion update. Hero rewritten: \"Control what your team sends to AI\". Primary CTA redirected to /ai-risk-assessment.",
        es: "✨ Actualización de conversión de la home. Hero reescrito: \"Controla lo que tu equipo envía a la IA\". CTA principal redirigido a /ai-risk-assessment.",
      },
      {
        en: "🐛 NLP engine — false positive fixes. Confidence threshold raised 0.65 → 0.75. Added post-NLP full_name filter: ≥ 2 consecutive capitalised tokens required. Fixed DNI span with capturing groups, ALL_CAPS stop set, flexible phone regex.",
        es: "🐛 Motor NLP — corrección de falsos positivos. Umbral de confianza subido de 0.65 → 0.75. Añadido filtro post-NLP para full_name: se requieren ≥ 2 tokens capitalizados consecutivos. Corregido el span de DNI con grupos de captura, stop set ALL_CAPS y regex de teléfono flexible.",
      },
      {
        en: "🔐 Supabase explicit GRANTs. Adopted new Supabase default privileges model ahead of the October 2026 enforcement deadline. New tables in public schema now require explicit GRANT statements.",
        es: "🔐 GRANTs explícitos en Supabase. Adoptado el nuevo modelo de privilegios por defecto de Supabase antes del deadline de obligatoriedad de octubre de 2026. Las nuevas tablas en el esquema public ahora requieren sentencias GRANT explícitas.",
      },
      {
        en: "🐛 DPO Report — period filter fixed. Reports now scoped to the selected date range. Previously all reports returned the same all-time dataset.",
        es: "🐛 Informe DPO — filtro de periodo corregido. Los informes ahora se acotan al rango de fechas seleccionado. Antes todos los informes devolvían el mismo dataset de todos los tiempos.",
      },
      {
        en: "🐛 Dashboard — Requests & PII chart fixed. PII Detected was always 0. PII Protected equalled total requests. Both now correctly reflect tokenised and anonymised events only.",
        es: "🐛 Dashboard — gráfica de Requests y PII corregida. PII Detected era siempre 0 y PII Protected equivalía al total de peticiones. Ambas ahora reflejan correctamente solo eventos tokenizados y anonimizados.",
      },
    ],
  },
  {
    date: "2026-05-01",
    version: "changelog.v08.version",
    title: "changelog.v08.title",
    desc: "changelog.v08.desc",
    tags: ["sdk", "feature"],
    items: [
      "changelog.v08.i1",
      "changelog.v08.i2",
      "changelog.v08.i3",
      "changelog.v08.i4",
    ],
  },
  {
    date: "2026-04-15",
    version: "changelog.v07.version",
    title: "changelog.v07.title",
    desc: "changelog.v07.desc",
    tags: ["feature", "security"],
    items: [
      "changelog.v07.i1",
      "changelog.v07.i2",
      "changelog.v07.i3",
      "changelog.v07.i4",
    ],
  },
  {
    date: "2026-03-28",
    version: "changelog.v06.version",
    title: "changelog.v06.title",
    desc: "changelog.v06.desc",
    tags: ["feature", "infra"],
    items: [
      "changelog.v06.i1",
      "changelog.v06.i2",
      "changelog.v06.i3",
    ],
  },
  {
    date: "2026-03-10",
    version: "changelog.v05.version",
    title: "changelog.v05.title",
    desc: "changelog.v05.desc",
    tags: ["feature", "security"],
    items: [
      "changelog.v05.i1",
      "changelog.v05.i2",
      "changelog.v05.i3",
      "changelog.v05.i4",
    ],
  },
  {
    date: "2026-02-20",
    version: "changelog.v04.version",
    title: "changelog.v04.title",
    desc: "changelog.v04.desc",
    tags: ["feature"],
    items: [
      "changelog.v04.i1",
      "changelog.v04.i2",
      "changelog.v04.i3",
    ],
  },
  {
    date: "2026-02-01",
    version: "changelog.v03.version",
    title: "changelog.v03.title",
    desc: "changelog.v03.desc",
    tags: ["infra", "security"],
    items: [
      "changelog.v03.i1",
      "changelog.v03.i2",
      "changelog.v03.i3",
    ],
  }
];

const TAG_STYLES: Record<Tag, string> = {
  feature:  "bg-primary/10 text-primary border-primary/30",
  fix:      "bg-warning/10 text-warning border-warning/30",
  security: "bg-destructive/10 text-destructive border-destructive/30",
  infra:    "bg-info/10 text-info border-info/30",
  sdk:      "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  performance: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  integration: "bg-violet-500/10 text-violet-400 border-violet-500/30",
};

const TAG_FALLBACK: Record<Tag, { en: string; es: string }> = {
  feature: { en: "Feature", es: "Funcionalidad" },
  fix: { en: "Fix", es: "Corrección" },
  security: { en: "Security", es: "Seguridad" },
  infra: { en: "Infrastructure", es: "Infraestructura" },
  sdk: { en: "SDK", es: "SDK" },
  performance: { en: "Performance", es: "Rendimiento" },
  integration: { en: "Integration", es: "Integración" },
};

function TagBadge({ tag }: { tag: Tag }) {
  const { t, lang } = useLanguage();
  const key = `changelog.tag.${tag}`;
  const translated = t(key);
  const label = translated !== key ? translated : TAG_FALLBACK[tag][lang === "es" ? "es" : "en"];
  return (
    <span className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full border ${TAG_STYLES[tag]}`}>
      {label}
    </span>
  );
}

function EntryCard({ entry, index }: { entry: Entry; index: number }) {
  const { t, lang } = useLanguage();

  const tx = (v: Localized): string =>
    typeof v === "string" ? t(v) : lang === "es" ? v.es : v.en;

  const dateStr = new Intl.DateTimeFormat(lang === "es" ? "es-ES" : "en-GB", {
    year: "numeric", month: "long",
  }).format(new Date(entry.date));

  return (
    <motion.div variants={fadeUp} className="relative grid grid-cols-1 md:grid-cols-[180px_1fr] gap-6 group">
      {/* Left: date + version */}
      <div className="md:text-right md:pt-1">
        <p className="text-sm text-muted-foreground">{dateStr}</p>
        <p className="text-xs font-mono text-primary mt-1">{tx(entry.version)}</p>
      </div>

      {/* Timeline dot */}
      <div className="hidden md:block absolute left-[180px] top-2 w-px h-full bg-border group-last:hidden" />
      <div className="hidden md:flex absolute left-[174px] top-1.5 w-3 h-3 rounded-full border-2 border-primary bg-background items-center justify-center" />

      {/* Right: content */}
      <div className="bg-card border border-border rounded-xl p-6 md:ml-6">
        <h3 className="text-base font-semibold text-foreground mb-1">{tx(entry.title)}</h3>
        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{tx(entry.desc)}</p>

        <div className="flex flex-wrap gap-1.5 mb-5">
          {entry.tags.map(tag => <TagBadge key={tag} tag={tag} />)}
        </div>

        <ul className="space-y-2">
          {entry.items.map((item, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-foreground/80">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
              {tx(item)}
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}

export default function Changelog() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Seo title="Changelog — Privaro AI Governance Platform Updates" description="Latest releases, features and improvements to Privaro's AI governance, PII detection and LLM proxy platform." path="/changelog" />
      <Navbar />

      <section className="pt-32 pb-12 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            <motion.span variants={fadeUp}
              className="inline-block text-xs font-semibold uppercase tracking-widest text-primary bg-primary/10 border border-primary/30 rounded-full px-4 py-1.5 mb-6">
              {t("changelog.badge")}
            </motion.span>
            <motion.h1 variants={fadeUp} className="text-4xl md:text-5xl font-bold mb-5 leading-tight">
              {t("changelog.title")}
            </motion.h1>
            <motion.p variants={fadeUp} className="text-lg text-muted-foreground max-w-xl mx-auto">
              {t("changelog.subtitle")}
            </motion.p>
          </motion.div>
        </div>
      </section>

      <section className="pb-24 px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.05 }}
            variants={stagger}
            className="space-y-10"
          >
            {ENTRIES.map((entry, i) => (
              <EntryCard key={i} entry={entry} index={i} />
            ))}
          </motion.div>

          {/* CTA */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="mt-16 p-8 rounded-2xl border border-primary/30 bg-primary/5 text-center"
          >
            <p className="text-sm text-muted-foreground mb-4">{t("changelog.cta.desc")}</p>
            <Link
              to="/auth"
              className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
            >
              {t("changelog.cta.link")} <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
