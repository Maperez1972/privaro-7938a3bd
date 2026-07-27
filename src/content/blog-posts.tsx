import { ReactNode } from "react";
import type { Language } from "@/context/LanguageContext";

interface BlogPostContent {
  title: string;
  description: string;
  content: ReactNode;
}

export interface BlogPost {
  slug: string;
  date: string; // ISO
  readingTime: string;
  readingTime_es?: string;
  tags: string[];
  keyword: string;
  en: BlogPostContent;
  es: BlogPostContent;
}

// Localised helpers
export interface LocalizedBlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  readingTime: string;
  tags: string[];
  keyword: string;
  content: ReactNode;
}

const H2 = ({ children }: { children: ReactNode }) => (
  <h2 className="text-2xl font-bold text-foreground mt-10 mb-3">{children}</h2>
);
const H3 = ({ children }: { children: ReactNode }) => (
  <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">{children}</h3>
);
const P = ({ children }: { children: ReactNode }) => (
  <p className="mb-4 leading-relaxed">{children}</p>
);
const UL = ({ children }: { children: ReactNode }) => (
  <ul className="list-disc list-inside space-y-2 mb-4">{children}</ul>
);
const Strong = ({ children }: { children: ReactNode }) => (
  <strong className="text-foreground">{children}</strong>
);

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "gdpr-checklist-llm-apps",
    date: "2026-06-10",
    readingTime: "8 min",
    readingTime_es: "8 min",
    tags: ["GDPR", "Compliance", "LLM"],
    keyword: "GDPR LLM compliance",
    en: {
      title: "GDPR Checklist for LLM Applications (2026)",
      description:
        "A practical GDPR checklist for teams shipping LLM-powered apps: lawful basis, data minimization, DPIA, retention and third-country transfers.",
      content: (
        <>
          <P>
            Every LLM feature you ship handles personal data — even if you did not
            intend it to. Users paste emails, contract clauses, internal IDs and
            customer names into prompts. Under the GDPR that is <Strong>processing</Strong>,
            and it triggers the same obligations as any other data flow in your product.
          </P>
          <P>
            This checklist condenses what a DPO will actually ask you before signing
            off on an LLM feature. Use it as an internal review template.
          </P>

          <H2>1. Establish a lawful basis for prompt data</H2>
          <P>
            Article 6 requires a lawful basis for every processing activity. For
            most B2B LLM features that means <Strong>legitimate interest</Strong>{" "}
            (documented via a balancing test) or <Strong>contract</Strong> when the
            feature is part of the service the customer paid for. Consent is rarely
            the right basis for an internal productivity tool.
          </P>

          <H2>2. Apply data minimization at the proxy layer</H2>
          <P>
            The single most effective control is to strip PII <em>before</em> the
            prompt reaches the model provider. This is where a{" "}
            <a href="/pii-detection-api" className="text-primary underline">PII detection API</a>{" "}
            or a governance proxy like Privaro fits — every prompt gets scanned,
            entities get tokenized or masked, and only sanitized text hits OpenAI,
            Anthropic or Gemini.
          </P>

          <H2>3. Run a DPIA for high-risk features</H2>
          <P>
            Article 35 requires a Data Protection Impact Assessment when processing
            is likely to result in high risk. Any LLM feature that touches health,
            finance, legal or biometric data falls in scope. The DPIA should cover:
          </P>
          <UL>
            <li>Categories of personal data flowing into prompts</li>
            <li>Model provider and sub-processors (with SCCs on file)</li>
            <li>Retention of prompts, completions and embeddings</li>
            <li>Mitigations (tokenization, human review, opt-out)</li>
          </UL>

          <H2>4. Lock down retention</H2>
          <P>
            Model providers cache prompts. Vector databases retain embeddings.
            Log stores keep completions. Define a retention policy per surface and
            enforce it with automated deletion — do not rely on manual cleanup.
          </P>

          <H2>5. Handle third-country transfers explicitly</H2>
          <P>
            Most LLM providers process data in the US. You need Standard
            Contractual Clauses on file, and for sensitive categories a{" "}
            <Strong>Transfer Impact Assessment</Strong>. EU-region endpoints from
            Azure OpenAI or Anthropic on Bedrock EU can eliminate the transfer
            altogether — worth the migration for regulated verticals.
          </P>

          <H2>6. Give data subjects a working DSAR path</H2>
          <P>
            If a user requests deletion, you need to prove that their prompts,
            completions and derived embeddings are gone. That requires request-level
            audit logs from day one, not something you bolt on when the first DSAR
            arrives.
          </P>

          <H2>Next step</H2>
          <P>
            If you want to see how your current LLM usage stacks up against this
            checklist, run our free{" "}
            <a href="/ai-risk-assessment" className="text-primary underline">AI risk assessment</a>{" "}
            or read the{" "}
            <a href="/ai-compliance-software" className="text-primary underline">AI compliance software</a>{" "}
            overview for the control mapping to GDPR and the EU AI Act.
          </P>
        </>
      ),
    },
    es: {
      title: "Checklist RGPD para aplicaciones con LLM (2026)",
      description:
        "Checklist práctico de RGPD para equipos que despliegan funciones con LLM: base legal, minimización de datos, EIPD, retención y transferencias internacionales.",
      content: (
        <>
          <P>
            Toda funcionalidad con LLM que despliegues trata datos personales — aunque
            no fuera tu intención. Los usuarios pegan emails, cláusulas de contratos,
            identificadores internos y nombres de clientes en los prompts. Bajo el
            RGPD eso es <Strong>tratamiento</Strong>, y activa las mismas obligaciones
            que cualquier otro flujo de datos de tu producto.
          </P>
          <P>
            Este checklist resume lo que un DPO realmente te preguntará antes de dar
            luz verde a una función con LLM. Úsalo como plantilla de revisión interna.
          </P>

          <H2>1. Establece una base legal para los datos del prompt</H2>
          <P>
            El artículo 6 exige una base legal para cada actividad de tratamiento.
            Para la mayoría de funciones LLM B2B eso significa{" "}
            <Strong>interés legítimo</Strong> (documentado mediante test de
            ponderación) o <Strong>ejecución de contrato</Strong> cuando la
            funcionalidad forma parte del servicio contratado. El consentimiento
            rara vez es la base adecuada para una herramienta interna de productividad.
          </P>

          <H2>2. Aplica minimización en la capa de proxy</H2>
          <P>
            El control más efectivo es eliminar la PII <em>antes</em> de que el prompt
            llegue al proveedor del modelo. Ahí encaja una{" "}
            <a href="/pii-detection-api" className="text-primary underline">API de detección de PII</a>{" "}
            o un proxy de gobernanza como Privaro: cada prompt se escanea, las entidades
            se tokenizan o enmascaran, y solo el texto saneado llega a OpenAI, Anthropic
            o Gemini.
          </P>

          <H2>3. Realiza una EIPD para funciones de alto riesgo</H2>
          <P>
            El artículo 35 exige una Evaluación de Impacto en Protección de Datos cuando
            el tratamiento puede suponer un alto riesgo. Cualquier función LLM que toque
            datos de salud, financieros, legales o biométricos entra en el alcance. La
            EIPD debe cubrir:
          </P>
          <UL>
            <li>Categorías de datos personales que fluyen en los prompts</li>
            <li>Proveedor del modelo y subencargados (con SCCs firmadas)</li>
            <li>Retención de prompts, respuestas y embeddings</li>
            <li>Mitigaciones (tokenización, revisión humana, opt-out)</li>
          </UL>

          <H2>4. Controla la retención</H2>
          <P>
            Los proveedores de modelos cachean prompts. Las bases vectoriales guardan
            embeddings. Los almacenes de logs conservan respuestas. Define una política
            de retención por superficie y aplícala con borrado automático — no te fíes
            de limpieza manual.
          </P>

          <H2>5. Gestiona explícitamente las transferencias internacionales</H2>
          <P>
            La mayoría de proveedores de LLM procesan datos en EE. UU. Necesitas
            Cláusulas Contractuales Tipo firmadas y, para categorías sensibles, un{" "}
            <Strong>Transfer Impact Assessment</Strong>. Los endpoints en región UE
            de Azure OpenAI o Anthropic sobre Bedrock EU pueden eliminar la transferencia
            — merece la pena migrar en verticales regulados.
          </P>

          <H2>6. Ofrece una vía real para ejercer derechos ARSULIPO</H2>
          <P>
            Si un usuario solicita supresión, debes poder demostrar que sus prompts,
            respuestas y embeddings derivados han desaparecido. Eso requiere logs de
            auditoría a nivel de petición desde el día uno, no algo que atornillas
            cuando llega la primera solicitud.
          </P>

          <H2>Siguiente paso</H2>
          <P>
            Si quieres ver cómo encaja tu uso actual de LLM con este checklist, ejecuta
            nuestro{" "}
            <a href="/ai-risk-assessment" className="text-primary underline">assessment gratuito de riesgo IA</a>{" "}
            o lee el resumen de{" "}
            <a href="/ai-compliance-software" className="text-primary underline">software de compliance IA</a>{" "}
            con el mapeo de controles al RGPD y al AI Act.
          </P>
        </>
      ),
    },
  },
  {
    slug: "eu-ai-act-compliance-saas",
    date: "2026-05-22",
    readingTime: "9 min",
    readingTime_es: "9 min",
    tags: ["EU AI Act", "Compliance", "SaaS"],
    keyword: "EU AI Act SaaS compliance",
    en: {
      title: "EU AI Act Compliance for SaaS: What Ships in 2026",
      description:
        "How the EU AI Act applies to SaaS products using LLMs — risk tiers, GPAI obligations, transparency requirements and a practical roadmap.",
      content: (
        <>
          <P>
            The EU AI Act is the first horizontal AI regulation in force worldwide.
            If your SaaS serves EU customers, ships an LLM feature, or embeds a
            third-party model, you are in scope — regardless of where your company
            is headquartered.
          </P>

          <H2>The four risk tiers, in plain English</H2>
          <UL>
            <li><Strong>Unacceptable</Strong> — social scoring, manipulative AI. Banned.</li>
            <li><Strong>High-risk</Strong> — AI in hiring, credit scoring, medical devices, critical infrastructure. Heavy documentation and conformity assessment.</li>
            <li><Strong>Limited risk</Strong> — chatbots, generative AI. Transparency obligations (users must know they are interacting with AI).</li>
            <li><Strong>Minimal risk</Strong> — everything else. No specific obligations.</li>
          </UL>
          <P>
            Most SaaS LLM features land in <Strong>limited risk</Strong>, but a
            copilot that recommends candidates or scores loan applications moves
            straight into <Strong>high-risk</Strong>.
          </P>

          <H2>GPAI: the model provider obligations that leak into you</H2>
          <P>
            General-Purpose AI (GPAI) providers — OpenAI, Anthropic, Google — must
            maintain technical documentation, publish training data summaries and
            implement copyright policies. For you as a downstream deployer, this
            means:
          </P>
          <UL>
            <li>Pin model versions and log them per request</li>
            <li>Retain provider documentation with your DPIA</li>
            <li>Notify users when GPAI output is used in decisions affecting them</li>
          </UL>

          <H2>Transparency: the article 50 requirements</H2>
          <P>
            Users interacting with an AI system must be informed. Content generated
            by AI (text, image, audio) must be marked as such in a{" "}
            <Strong>machine-readable</Strong> way. In practice this means adding
            disclosure UI to any user-facing generation surface and metadata to
            exported artifacts.
          </P>

          <H2>The audit trail is the compliance product</H2>
          <P>
            Enforcement will not ask for your policy document — it will ask for
            <em> evidence</em>. Every prompt, every model version, every policy
            decision, every human override must be logged in a way you can export
            to an auditor. This is the same requirement GDPR imposes for personal
            data, and the same one SOC 2 imposes for change management.
          </P>

          <H2>A 90-day roadmap</H2>
          <UL>
            <li><Strong>Days 1–30:</Strong> Inventory every LLM feature. Classify each into a risk tier.</li>
            <li><Strong>Days 31–60:</Strong> Deploy a governance proxy for PII detection, tokenization and per-request audit logs.</li>
            <li><Strong>Days 61–90:</Strong> Write the DPIA, publish the transparency notice, pin model versions.</li>
          </UL>

          <P>
            Privaro is designed to be that governance layer.{" "}
            <a href="/ai-governance-platform" className="text-primary underline">Read the platform overview</a>{" "}
            or explore the{" "}
            <a href="/enterprise-ai-security" className="text-primary underline">enterprise AI security guide</a>{" "}
            for the technical controls.
          </P>
        </>
      ),
    },
    es: {
      title: "Cumplimiento del AI Act de la UE para SaaS: qué se despliega en 2026",
      description:
        "Cómo aplica el AI Act de la UE a productos SaaS que usan LLM: niveles de riesgo, obligaciones GPAI, requisitos de transparencia y una hoja de ruta práctica.",
      content: (
        <>
          <P>
            El AI Act de la UE es la primera regulación horizontal de IA en vigor
            en el mundo. Si tu SaaS atiende a clientes en la UE, despliega una función
            con LLM o integra un modelo de terceros, estás en el alcance — sin
            importar dónde esté tu sede.
          </P>

          <H2>Los cuatro niveles de riesgo, sin florituras</H2>
          <UL>
            <li><Strong>Inaceptable</Strong> — scoring social, IA manipulativa. Prohibida.</li>
            <li><Strong>Alto riesgo</Strong> — IA en contratación, scoring crediticio, dispositivos médicos, infraestructuras críticas. Documentación exhaustiva y evaluación de conformidad.</li>
            <li><Strong>Riesgo limitado</Strong> — chatbots, IA generativa. Obligaciones de transparencia (los usuarios deben saber que interactúan con IA).</li>
            <li><Strong>Riesgo mínimo</Strong> — todo lo demás. Sin obligaciones específicas.</li>
          </UL>
          <P>
            La mayoría de funciones LLM SaaS caen en <Strong>riesgo limitado</Strong>,
            pero un copiloto que recomienda candidatos o puntúa solicitudes de crédito
            pasa directamente a <Strong>alto riesgo</Strong>.
          </P>

          <H2>GPAI: las obligaciones del proveedor del modelo que te salpican</H2>
          <P>
            Los proveedores de IA de Propósito General (GPAI) — OpenAI, Anthropic,
            Google — deben mantener documentación técnica, publicar resúmenes de datos
            de entrenamiento e implementar políticas de copyright. Para ti como
            desplegador aguas abajo, esto significa:
          </P>
          <UL>
            <li>Fija versiones del modelo y regístralas por petición</li>
            <li>Conserva la documentación del proveedor junto a tu EIPD</li>
            <li>Notifica a los usuarios cuando la salida GPAI se use en decisiones que les afectan</li>
          </UL>

          <H2>Transparencia: los requisitos del artículo 50</H2>
          <P>
            Los usuarios que interactúan con un sistema de IA deben ser informados.
            El contenido generado por IA (texto, imagen, audio) debe marcarse como
            tal de forma <Strong>legible por máquina</Strong>. En la práctica esto
            implica añadir UI de disclosure en toda superficie de generación de cara
            al usuario y metadatos en los artefactos exportados.
          </P>

          <H2>La traza de auditoría es el producto de compliance</H2>
          <P>
            La autoridad no te pedirá tu documento de política — pedirá{" "}
            <em>evidencia</em>. Cada prompt, cada versión de modelo, cada decisión
            de política, cada override humano debe quedar registrado de forma
            exportable a un auditor. Es el mismo requisito que impone el RGPD para
            datos personales, y el mismo que SOC 2 impone para gestión de cambios.
          </P>

          <H2>Una hoja de ruta a 90 días</H2>
          <UL>
            <li><Strong>Días 1–30:</Strong> Inventaría cada funcionalidad LLM. Clasifícala en un nivel de riesgo.</li>
            <li><Strong>Días 31–60:</Strong> Despliega un proxy de gobernanza para detección de PII, tokenización y logs de auditoría por petición.</li>
            <li><Strong>Días 61–90:</Strong> Redacta la EIPD, publica el aviso de transparencia, fija versiones de modelo.</li>
          </UL>

          <P>
            Privaro está diseñado para ser esa capa de gobernanza.{" "}
            <a href="/ai-governance-platform" className="text-primary underline">Lee el resumen de la plataforma</a>{" "}
            o explora la{" "}
            <a href="/enterprise-ai-security" className="text-primary underline">guía de seguridad IA empresarial</a>{" "}
            para los controles técnicos.
          </P>
        </>
      ),
    },
  },
  {
    slug: "mask-pii-before-openai",
    date: "2026-04-15",
    readingTime: "7 min",
    readingTime_es: "7 min",
    tags: ["PII", "OpenAI", "Developers"],
    keyword: "mask PII before OpenAI",
    en: {
      title: "How to Mask PII Before Sending Prompts to OpenAI",
      description:
        "A developer guide to detecting and masking PII in prompts before calling OpenAI, Anthropic or Gemini — with code samples and reversible tokenization.",
      content: (
        <>
          <P>
            The fastest way to leak customer data is to forward a raw user prompt
            straight to OpenAI. This guide shows the pattern we recommend at
            Privaro: detect entities, replace them with reversible tokens, call
            the model, then re-hydrate the response.
          </P>

          <H2>Why not just regex it?</H2>
          <P>
            Regex catches email addresses and credit cards. It misses names,
            addresses, medical conditions, internal identifiers and anything
            context-dependent. Real PII detection needs a hybrid of regex,
            dictionaries and an NER model. Building that in-house is a 3-month
            project; the{" "}
            <a href="/pii-detection-api" className="text-primary underline">PII detection API</a>{" "}
            gets you there in a day.
          </P>

          <H2>The reversible tokenization pattern</H2>
          <P>Four steps:</P>
          <UL>
            <li><Strong>Detect</Strong> — scan the prompt, return spans with entity type and confidence.</li>
            <li><Strong>Tokenize</Strong> — replace each span with a stable placeholder like <code className="text-primary">[EMAIL_1]</code>. Store the mapping encrypted in a vault, keyed to the request ID.</li>
            <li><Strong>Send</Strong> — forward the sanitized prompt to OpenAI. The model reasons about placeholders exactly like real values.</li>
            <li><Strong>Rehydrate</Strong> — on the response, swap placeholders back to originals before returning to the user.</li>
          </UL>

          <H3>Minimal example</H3>
          <pre className="bg-surface border border-border rounded-md p-4 text-sm overflow-x-auto mb-4"><code>{`const protect = await fetch("https://api.privaro.ai/v1/protect", {
  method: "POST",
  headers: { "Authorization": \`Bearer \${API_KEY}\` },
  body: JSON.stringify({ text: userPrompt, policy: "strict" }),
});
const { safe_text, request_id } = await protect.json();

const completion = await openai.chat.completions.create({
  model: "gpt-4o",
  messages: [{ role: "user", content: safe_text }],
});

const rehydrate = await fetch("https://api.privaro.ai/v1/rehydrate", {
  method: "POST",
  headers: { "Authorization": \`Bearer \${API_KEY}\` },
  body: JSON.stringify({ text: completion.choices[0].message.content, request_id }),
});
const { text } = await rehydrate.json();
return text;`}</code></pre>

          <H2>When to use irreversible anonymization instead</H2>
          <P>
            Tokenization is right when you need to display the original values back
            to the end user. For analytics prompts, log summarization or training
            data preparation you want <Strong>irreversible</Strong> anonymization —
            the mapping is discarded and the data cannot be re-identified.
          </P>

          <H2>What about latency?</H2>
          <P>
            A well-designed proxy adds 40–80 ms per call. In practice that is
            invisible next to the 500–2000 ms of the LLM call itself, and it is
            the price of not leaking a customer's national ID into someone else's
            training set.
          </P>
        </>
      ),
    },
    es: {
      title: "Cómo enmascarar PII antes de enviar prompts a OpenAI",
      description:
        "Guía para desarrolladores: detectar y enmascarar PII en prompts antes de llamar a OpenAI, Anthropic o Gemini — con ejemplos de código y tokenización reversible.",
      content: (
        <>
          <P>
            La forma más rápida de filtrar datos de clientes es reenviar un prompt
            crudo directamente a OpenAI. Esta guía muestra el patrón que recomendamos
            en Privaro: detectar entidades, sustituirlas por tokens reversibles,
            llamar al modelo y rehidratar la respuesta.
          </P>

          <H2>¿Por qué no basta con regex?</H2>
          <P>
            Las regex atrapan emails y tarjetas de crédito. Se les escapan nombres,
            direcciones, patologías médicas, identificadores internos y cualquier cosa
            dependiente del contexto. La detección real de PII requiere un híbrido
            de regex, diccionarios y un modelo NER. Construirlo en casa es un proyecto
            de 3 meses; la{" "}
            <a href="/pii-detection-api" className="text-primary underline">API de detección de PII</a>{" "}
            te lo resuelve en un día.
          </P>

          <H2>El patrón de tokenización reversible</H2>
          <P>Cuatro pasos:</P>
          <UL>
            <li><Strong>Detectar</Strong> — escanea el prompt, devuelve spans con tipo de entidad y confianza.</li>
            <li><Strong>Tokenizar</Strong> — sustituye cada span por un placeholder estable como <code className="text-primary">[EMAIL_1]</code>. Guarda el mapping cifrado en un vault, asociado al ID de petición.</li>
            <li><Strong>Enviar</Strong> — reenvía el prompt saneado a OpenAI. El modelo razona sobre los placeholders igual que sobre valores reales.</li>
            <li><Strong>Rehidratar</Strong> — en la respuesta, sustituye los placeholders por los originales antes de devolverla al usuario.</li>
          </UL>

          <H3>Ejemplo mínimo</H3>
          <pre className="bg-surface border border-border rounded-md p-4 text-sm overflow-x-auto mb-4"><code>{`const protect = await fetch("https://api.privaro.ai/v1/protect", {
  method: "POST",
  headers: { "Authorization": \`Bearer \${API_KEY}\` },
  body: JSON.stringify({ text: userPrompt, policy: "strict" }),
});
const { safe_text, request_id } = await protect.json();

const completion = await openai.chat.completions.create({
  model: "gpt-4o",
  messages: [{ role: "user", content: safe_text }],
});

const rehydrate = await fetch("https://api.privaro.ai/v1/rehydrate", {
  method: "POST",
  headers: { "Authorization": \`Bearer \${API_KEY}\` },
  body: JSON.stringify({ text: completion.choices[0].message.content, request_id }),
});
const { text } = await rehydrate.json();
return text;`}</code></pre>

          <H2>Cuándo usar anonimización irreversible en su lugar</H2>
          <P>
            La tokenización es la opción correcta cuando necesitas mostrar los valores
            originales al usuario final. Para prompts de analítica, resumen de logs o
            preparación de datos de entrenamiento quieres anonimización{" "}
            <Strong>irreversible</Strong> — el mapping se descarta y los datos no se
            pueden re-identificar.
          </P>

          <H2>¿Y la latencia?</H2>
          <P>
            Un proxy bien diseñado añade 40–80 ms por llamada. En la práctica es
            invisible frente a los 500–2000 ms de la propia llamada al LLM, y es el
            precio de no filtrar el DNI de un cliente al conjunto de entrenamiento
            de otro.
          </P>
        </>
      ),
    },
  },
  {
    slug: "openai-vs-anthropic-data-privacy",
    date: "2026-03-04",
    readingTime: "6 min",
    readingTime_es: "6 min",
    tags: ["OpenAI", "Anthropic", "Privacy"],
    keyword: "OpenAI vs Anthropic privacy",
    en: {
      title: "OpenAI vs Anthropic: Data Privacy Compared for Enterprise",
      description:
        "A side-by-side comparison of OpenAI and Anthropic data privacy: retention, training on customer data, EU residency, DPAs and audit posture.",
      content: (
        <>
          <P>
            Procurement teams keep asking the same question: which frontier
            provider is safer for regulated data? The short answer is that both
            have enterprise tiers with strong contractual guarantees — and both
            have a consumer tier that is inappropriate for customer data. Here
            is the detail that matters.
          </P>

          <H2>Training on customer data</H2>
          <P>
            Neither OpenAI's API tier nor Anthropic's API tier trains on customer
            content by default. The risk is not the API — it is employees pasting
            into ChatGPT.com or Claude.ai personal accounts, where the default is
            different. Enforce this at the network or proxy layer, not with a
            policy PDF.
          </P>

          <H2>Retention</H2>
          <UL>
            <li><Strong>OpenAI API:</Strong> 30 days by default, zero-retention available for approved enterprise customers.</li>
            <li><Strong>Anthropic API:</Strong> 30 days by default, zero-retention available under enterprise agreements.</li>
          </UL>

          <H2>EU data residency</H2>
          <P>
            Both providers offer EU-region processing through hyperscaler partners
            (Azure OpenAI in EU regions, Anthropic on AWS Bedrock EU). Direct
            calls to <code>api.openai.com</code> and <code>api.anthropic.com</code>{" "}
            still route through the US — check your endpoint, not the marketing page.
          </P>

          <H2>DPAs and sub-processors</H2>
          <P>
            Both publish DPAs and sub-processor lists. Anthropic's list is shorter,
            which some procurement teams prefer for simpler vendor assessments.
            OpenAI's is longer because of the Microsoft hosting relationship.
            Neither is a red flag on its own.
          </P>

          <H2>The verdict</H2>
          <P>
            The provider is not the bottleneck — <Strong>the data leaving your
            perimeter is</Strong>. A governance layer that tokenizes PII before it
            leaves your infrastructure makes the choice between OpenAI and
            Anthropic a performance and cost decision, not a privacy one.
          </P>

          <P>
            See how a proxy architecture handles this in the{" "}
            <a href="/enterprise-ai-security" className="text-primary underline">enterprise AI security guide</a>{" "}
            or start with a{" "}
            <a href="/ai-risk-assessment" className="text-primary underline">free risk assessment</a>{" "}
            of your current usage.
          </P>
        </>
      ),
    },
    es: {
      title: "OpenAI vs Anthropic: privacidad de datos para empresa",
      description:
        "Comparativa lado a lado de la privacidad de datos de OpenAI y Anthropic: retención, entrenamiento con datos de cliente, residencia UE, DPAs y postura de auditoría.",
      content: (
        <>
          <P>
            Los equipos de compras hacen siempre la misma pregunta: ¿qué proveedor
            frontier es más seguro para datos regulados? La respuesta corta es que
            ambos tienen tiers empresariales con garantías contractuales sólidas —
            y ambos tienen un tier de consumo inapropiado para datos de clientes.
            Este es el detalle que importa.
          </P>

          <H2>Entrenamiento con datos de cliente</H2>
          <P>
            Ni el tier API de OpenAI ni el de Anthropic entrenan con contenido de
            cliente por defecto. El riesgo no es la API — son los empleados pegando
            en cuentas personales de ChatGPT.com o Claude.ai, donde el default es
            distinto. Refuerza esto en la capa de red o proxy, no con un PDF de
            política.
          </P>

          <H2>Retención</H2>
          <UL>
            <li><Strong>API de OpenAI:</Strong> 30 días por defecto, cero retención disponible para clientes enterprise aprobados.</li>
            <li><Strong>API de Anthropic:</Strong> 30 días por defecto, cero retención disponible bajo acuerdos empresariales.</li>
          </UL>

          <H2>Residencia de datos en la UE</H2>
          <P>
            Ambos ofrecen procesamiento en región UE mediante partners hyperscaler
            (Azure OpenAI en regiones UE, Anthropic sobre AWS Bedrock EU). Las
            llamadas directas a <code>api.openai.com</code> y{" "}
            <code>api.anthropic.com</code> siguen enrutando por EE. UU. — revisa
            tu endpoint, no la página de marketing.
          </P>

          <H2>DPAs y subencargados</H2>
          <P>
            Ambos publican DPAs y listas de subencargados. La lista de Anthropic es
            más corta, lo que algunos equipos de compras prefieren para evaluaciones
            de proveedor más simples. La de OpenAI es más larga por la relación de
            hosting con Microsoft. Ninguna es una señal de alarma por sí sola.
          </P>

          <H2>Veredicto</H2>
          <P>
            El proveedor no es el cuello de botella — <Strong>lo son los datos que
            salen de tu perímetro</Strong>. Una capa de gobernanza que tokeniza la
            PII antes de que salga de tu infraestructura convierte la elección entre
            OpenAI y Anthropic en una decisión de rendimiento y coste, no de
            privacidad.
          </P>

          <P>
            Consulta cómo maneja esto una arquitectura de proxy en la{" "}
            <a href="/enterprise-ai-security" className="text-primary underline">guía de seguridad IA empresarial</a>{" "}
            o empieza con un{" "}
            <a href="/ai-risk-assessment" className="text-primary underline">assessment gratuito de riesgo</a>{" "}
            de tu uso actual.
          </P>
        </>
      ),
    },
  },
];

export const getLocalizedPosts = (lang: Language): LocalizedBlogPost[] =>
  BLOG_POSTS.map((p) => ({
    slug: p.slug,
    date: p.date,
    readingTime: lang === "es" ? (p.readingTime_es ?? p.readingTime) : p.readingTime,
    tags: p.tags,
    keyword: p.keyword,
    ...p[lang],
  }));

export const getLocalizedPostBySlug = (
  slug: string,
  lang: Language,
): LocalizedBlogPost | undefined => {
  const p = BLOG_POSTS.find((x) => x.slug === slug);
  if (!p) return undefined;
  return {
    slug: p.slug,
    date: p.date,
    readingTime: lang === "es" ? (p.readingTime_es ?? p.readingTime) : p.readingTime,
    tags: p.tags,
    keyword: p.keyword,
    ...p[lang],
  };
};

// Backwards-compat helper (defaults to EN)
export const getPostBySlug = (slug: string) => getLocalizedPostBySlug(slug, "en");
