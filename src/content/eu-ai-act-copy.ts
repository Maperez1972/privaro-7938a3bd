export interface Milestone { date: string; title: string; desc: string; }
export interface RiskTier { level: string; tone: "danger" | "warn" | "info" | "ok"; what: string; duties: string; }
export interface Copy {
  seoTitle: string;
  seoDescription: string;
  badge: string;
  h1a: string;
  h1b: string;
  intro: string;
  ctaPrimary: string;
  ctaSecondary: string;
  updated: string;
  whatTitle: string;
  whatP1: string;
  whatP2: string;
  timelineTitle: string;
  timelineDesc: string;
  milestones: Milestone[];
  riskTitle: string;
  riskDesc: string;
  riskColWhat: string;
  riskColDuties: string;
  tiers: RiskTier[];
  finesTitle: string;
  fines: string[];
  checklistTitle: string;
  checklistDesc: string;
  checklist: { title: string; desc: string }[];
  privaroTitle: string;
  privaroDesc: string;
  privaroItems: string[];
  faqTitle: string;
  faq: { q: string; a: string }[];
  disclaimer: string;
  ctaTitle: string;
  ctaDesc: string;
  ctaButton: string;
  sourcesTitle: string;
}

export const COPY: Record<"es" | "en", Copy> = {
  es: {
    seoTitle: "EU AI Act: guía de cumplimiento 2026 en PDF gratis | Privaro",
    seoDescription:
      "Descarga gratis la guía del Reglamento Europeo de IA (EU AI Act): fechas clave 2024–2027, niveles de riesgo, sanciones de hasta 35M€ y checklist de cumplimiento paso a paso para equipos que usan LLMs. PDF en español.",
    badge: "Guía de cumplimiento",
    h1a: "EU AI Act:",
    h1b: "guía práctica de cumplimiento",
    intro:
      "El Reglamento Europeo de Inteligencia Artificial ya está en vigor y sus obligaciones llegan por fases hasta 2027. Esta guía resume qué te aplica según lo que hagas con la IA, en qué fechas, qué sanciones hay y qué tienes que tener documentado antes de que te lo pidan.",
    ctaPrimary: "Evalúa tu riesgo en 3 minutos",
    ctaSecondary: "Ver cómo ayuda Privaro",
    updated: "Actualizado: septiembre de 2026",
    whatTitle: "Qué es el EU AI Act y a quién aplica",
    whatP1:
      "El Reglamento (UE) 2024/1689 es la primera norma integral del mundo sobre inteligencia artificial. No regula la tecnología en abstracto: regula usos. Clasifica cada sistema de IA por el riesgo que supone para los derechos de las personas y asigna obligaciones proporcionales a ese riesgo.",
    whatP2:
      "Aplica a proveedores que ponen sistemas de IA en el mercado europeo y a organizaciones que los despliegan en su operativa, estén o no establecidas en la UE, siempre que el resultado se use dentro de la Unión. Es decir: si tu equipo usa un LLM para tratar datos de clientes europeos, te afecta, aunque el modelo sea de un tercero.",
    timelineTitle: "Fechas clave",
    timelineDesc: "Las obligaciones no llegan de golpe. Este es el calendario oficial de aplicación.",
    milestones: [
      {
        date: "1 agosto 2024",
        title: "Entrada en vigor",
        desc: "El Reglamento entra en vigor y arranca el reloj de todos los plazos posteriores.",
      },
      {
        date: "2 febrero 2025",
        title: "Prácticas prohibidas y alfabetización en IA",
        desc: "Quedan prohibidos usos como la puntuación social o el scraping indiscriminado de rostros. Además, las organizaciones deben garantizar un nivel suficiente de formación en IA a su personal.",
      },
      {
        date: "2 agosto 2025",
        title: "Modelos de propósito general (GPAI)",
        desc: "Obligaciones de transparencia, documentación técnica y política de derechos de autor para los proveedores de modelos fundacionales. Empiezan a aplicarse las normas de gobernanza y las sanciones.",
      },
      {
        date: "2 agosto 2026",
        title: "Aplicación general",
        desc: "Entra en vigor el grueso del Reglamento, incluidos los sistemas de alto riesgo del Anexo III y las obligaciones de transparencia para sistemas que interactúan con personas.",
      },
      {
        date: "2 agosto 2027",
        title: "Alto riesgo integrado en productos",
        desc: "Se aplica a los sistemas de IA que son componente de seguridad de productos ya regulados por otra normativa de la Unión (Anexo I).",
      },
    ],
    riskTitle: "Los cuatro niveles de riesgo",
    riskDesc: "Tu primera tarea de cumplimiento es clasificar correctamente cada sistema de IA que uses.",
    riskColWhat: "Qué incluye",
    riskColDuties: "Qué te exige",
    tiers: [
      {
        level: "Riesgo inaceptable",
        tone: "danger",
        what: "Puntuación social, manipulación subliminal, reconocimiento de emociones en el trabajo o el aula, categorización biométrica por datos sensibles.",
        duties: "Prohibido. No hay medida de mitigación posible: el uso debe cesar.",
      },
      {
        level: "Alto riesgo",
        tone: "warn",
        what: "Selección de personal, evaluación crediticia, educación, servicios esenciales, justicia, migración, e IA como componente de seguridad de un producto.",
        duties:
          "Sistema de gestión de riesgos, gobernanza de datos, documentación técnica, registro automático de eventos, supervisión humana, precisión y ciberseguridad, y registro en la base de datos de la UE.",
      },
      {
        level: "Riesgo de transparencia",
        tone: "info",
        what: "Chatbots, generadores de contenido, ultrafalsificaciones, sistemas que interactúan directamente con personas.",
        duties:
          "Informar al usuario de que está interactuando con una IA y etiquetar de forma legible por máquina el contenido generado o manipulado.",
      },
      {
        level: "Riesgo mínimo",
        tone: "ok",
        what: "Filtros de spam, videojuegos, recomendadores internos y la mayoría de usos ofimáticos.",
        duties: "Sin obligaciones específicas. Se fomentan códigos de conducta voluntarios.",
      },
    ],
    finesTitle: "Sanciones",
    fines: [
      "Hasta 35 millones de euros o el 7% de la facturación mundial anual por incurrir en prácticas prohibidas.",
      "Hasta 15 millones de euros o el 3% por incumplir las obligaciones de sistemas de alto riesgo, transparencia o GPAI.",
      "Hasta 7,5 millones de euros o el 1% por facilitar información incorrecta o engañosa a las autoridades.",
    ],
    checklistTitle: "Checklist de cumplimiento",
    checklistDesc:
      "Diez pasos concretos que puedes empezar hoy, ordenados por lo que las autoridades pedirán primero.",
    checklist: [
      {
        title: "Inventaría todos tus sistemas de IA",
        desc: "Incluye los que no compraste como IA: asistentes integrados en tu CRM, copilotos de código, transcriptores de reuniones. Lo que no está inventariado no se puede gobernar.",
      },
      {
        title: "Clasifica cada sistema por nivel de riesgo",
        desc: "Documenta el razonamiento, no solo la conclusión. La justificación de por qué algo no es de alto riesgo es tan importante como la clasificación.",
      },
      {
        title: "Define tu rol en cada caso",
        desc: "Proveedor y responsable del despliegue tienen obligaciones muy distintas. Ajustar un modelo con datos propios puede convertirte en proveedor.",
      },
      {
        title: "Acredita la formación en IA de tu equipo",
        desc: "Obligatoria desde febrero de 2025. Registra quién recibió qué formación y cuándo.",
      },
      {
        title: "Establece gobernanza de datos",
        desc: "Qué datos entran en cada sistema, de dónde vienen, con qué base legal y qué se hace con los datos sensibles antes de enviarlos a un modelo.",
      },
      {
        title: "Registra cada interacción con IA",
        desc: "El Reglamento exige trazabilidad automática de eventos en alto riesgo. Un histórico de quién preguntó qué, a qué modelo y con qué datos es la evidencia base.",
      },
      {
        title: "Diseña la supervisión humana",
        desc: "Define quién puede revisar, corregir o revertir una decisión asistida por IA, y deja constancia de que puede hacerlo de verdad.",
      },
      {
        title: "Cumple la transparencia de cara al usuario",
        desc: "Avisa cuando alguien habla con una IA y marca el contenido generado. Es de las obligaciones más fáciles de comprobar desde fuera.",
      },
      {
        title: "Revisa contratos con proveedores de modelos",
        desc: "Retención de datos, uso para entrenamiento, ubicación del tratamiento y subencargados. Su incumplimiento acaba siendo tuyo.",
      },
      {
        title: "Prepara el expediente de evidencias",
        desc: "Documentación técnica, evaluaciones de riesgo, registros e incidentes en un mismo sitio y exportables. La conformidad se demuestra, no se declara.",
      },
    ],
    privaroTitle: "Dónde encaja Privaro",
    privaroDesc:
      "Privaro no te da el cumplimiento entero: cubre la parte técnica más difícil de improvisar, que es controlar y demostrar qué datos salen hacia los modelos.",
    privaroItems: [
      "Detecta datos personales y sensibles en cada prompt antes de que llegue al modelo.",
      "Aplica políticas por tipo de dato, equipo y proveedor: tokenizar, anonimizar o bloquear.",
      "Registra cada interacción con usuario, modelo, datos detectados y decisión aplicada.",
      "Analiza también la respuesta del modelo para detectar fugas de datos en la salida.",
      "Exporta informes listos para auditoría y para tu responsable de protección de datos.",
      "Funciona con OpenAI, Anthropic, Gemini y otros sin cambiar tu integración.",
    ],
    faqTitle: "Preguntas frecuentes",
    faq: [
      {
        q: "¿Me aplica el EU AI Act si mi empresa no está en la UE?",
        a: "Sí, si el resultado del sistema se usa dentro de la Unión o pones el sistema en el mercado europeo. El criterio es dónde se produce el efecto, no dónde está tu sede.",
      },
      {
        q: "¿Usar ChatGPT en la empresa me convierte en proveedor de IA?",
        a: "Normalmente no: serías responsable del despliegue, con obligaciones más ligeras. Pero si ajustas el modelo, lo comercializas con tu marca o modificas sustancialmente su finalidad, puedes pasar a ser proveedor y asumir el bloque completo de obligaciones.",
      },
      {
        q: "¿El EU AI Act sustituye al RGPD?",
        a: "No, se suman. El RGPD sigue regulando el tratamiento de datos personales y el AI Act añade obligaciones sobre el sistema de IA en sí. Un mismo caso de uso puede infringir ambos de forma independiente.",
      },
      {
        q: "¿Qué pasa si uso un modelo en streaming y no puedo enmascarar la respuesta?",
        a: "En respuestas en streaming la salida se audita en tiempo real en lugar de enmascararse. Queda registrada la detección para evidencia y alerta, aunque el texto ya haya llegado al usuario. Conviene documentar esa limitación en tu análisis de riesgos.",
      },
    ],
    disclaimer:
      "Esta guía es informativa y no constituye asesoramiento jurídico. Para decisiones de cumplimiento concretas, consulta con tu asesor legal.",
    ctaTitle: "Pon control y evidencia sobre tu uso de IA",
    ctaDesc: "Empieza por saber dónde estás: el diagnóstico de riesgo te da una foto en pocos minutos.",
    ctaButton: "Solicitar una demo",
    sourcesTitle: "Fuentes oficiales",
  },
  en: {
    seoTitle: "EU AI Act Compliance Guide 2026 — Free PDF | Privaro",
    seoDescription:
      "Free downloadable EU AI Act guide: key dates 2024–2027, risk tiers, fines up to €35M and a step-by-step compliance checklist for teams running LLMs in production. English PDF.",
    badge: "Compliance guide",
    h1a: "EU AI Act:",
    h1b: "a practical compliance guide",
    intro:
      "The European AI Act is already in force and its obligations land in phases through 2027. This guide covers what applies to you depending on how you use AI, on which dates, what the fines are, and what you need documented before anyone asks for it.",
    ctaPrimary: "Assess your risk in 3 minutes",
    ctaSecondary: "See how Privaro helps",
    updated: "Updated: September 2026",
    whatTitle: "What the EU AI Act is and who it applies to",
    whatP1:
      "Regulation (EU) 2024/1689 is the world's first comprehensive law on artificial intelligence. It does not regulate the technology in the abstract: it regulates uses. Every AI system is classified by the risk it poses to people's rights, with obligations proportional to that risk.",
    whatP2:
      "It applies to providers placing AI systems on the EU market and to organisations deploying them in their operations, whether or not they are established in the EU, as long as the output is used within the Union. In practice: if your team uses an LLM to process European customer data, it affects you, even when the model belongs to someone else.",
    timelineTitle: "Key dates",
    timelineDesc: "Obligations do not arrive all at once. This is the official application timeline.",
    milestones: [
      {
        date: "1 August 2024",
        title: "Entry into force",
        desc: "The Regulation enters into force and starts the clock on every later deadline.",
      },
      {
        date: "2 February 2025",
        title: "Prohibited practices and AI literacy",
        desc: "Uses such as social scoring and untargeted facial scraping become banned. Organisations must also ensure a sufficient level of AI literacy among their staff.",
      },
      {
        date: "2 August 2025",
        title: "General-purpose AI models (GPAI)",
        desc: "Transparency, technical documentation and copyright-policy duties for foundation model providers. Governance rules and penalties start to apply.",
      },
      {
        date: "2 August 2026",
        title: "General application",
        desc: "The bulk of the Regulation applies, including Annex III high-risk systems and transparency duties for systems interacting with people.",
      },
      {
        date: "2 August 2027",
        title: "High-risk embedded in products",
        desc: "Applies to AI systems that are safety components of products already covered by other Union legislation (Annex I).",
      },
    ],
    riskTitle: "The four risk tiers",
    riskDesc: "Your first compliance task is classifying every AI system you use correctly.",
    riskColWhat: "What it covers",
    riskColDuties: "What it requires",
    tiers: [
      {
        level: "Unacceptable risk",
        tone: "danger",
        what: "Social scoring, subliminal manipulation, emotion recognition at work or school, biometric categorisation using sensitive traits.",
        duties: "Banned. There is no mitigation available: the use must stop.",
      },
      {
        level: "High risk",
        tone: "warn",
        what: "Recruitment, credit scoring, education, essential services, justice, migration, and AI acting as a product safety component.",
        duties:
          "Risk management system, data governance, technical documentation, automatic event logging, human oversight, accuracy and cybersecurity, plus registration in the EU database.",
      },
      {
        level: "Transparency risk",
        tone: "info",
        what: "Chatbots, content generators, deepfakes, systems interacting directly with people.",
        duties:
          "Tell users they are interacting with an AI and label generated or manipulated content in a machine-readable way.",
      },
      {
        level: "Minimal risk",
        tone: "ok",
        what: "Spam filters, video games, internal recommenders and most office use cases.",
        duties: "No specific obligations. Voluntary codes of conduct are encouraged.",
      },
    ],
    finesTitle: "Fines",
    fines: [
      "Up to EUR 35 million or 7% of global annual turnover for engaging in prohibited practices.",
      "Up to EUR 15 million or 3% for breaching high-risk, transparency or GPAI obligations.",
      "Up to EUR 7.5 million or 1% for supplying incorrect or misleading information to authorities.",
    ],
    checklistTitle: "Compliance checklist",
    checklistDesc: "Ten concrete steps you can start today, ordered by what regulators ask for first.",
    checklist: [
      {
        title: "Inventory every AI system",
        desc: "Include the ones you did not buy as AI: assistants inside your CRM, code copilots, meeting transcribers. What is not inventoried cannot be governed.",
      },
      {
        title: "Classify each system by risk tier",
        desc: "Document the reasoning, not just the conclusion. Justifying why something is not high risk matters as much as the classification itself.",
      },
      {
        title: "Establish your role in each case",
        desc: "Providers and deployers carry very different duties. Fine-tuning a model on your own data can turn you into a provider.",
      },
      {
        title: "Evidence your team's AI literacy",
        desc: "Mandatory since February 2025. Record who received what training and when.",
      },
      {
        title: "Set up data governance",
        desc: "Which data enters each system, where it comes from, on what legal basis, and what happens to sensitive data before it reaches a model.",
      },
      {
        title: "Log every AI interaction",
        desc: "The Regulation requires automatic event traceability for high-risk systems. A record of who asked what, to which model, with which data, is your baseline evidence.",
      },
      {
        title: "Design human oversight",
        desc: "Define who can review, correct or reverse an AI-assisted decision, and show they genuinely can.",
      },
      {
        title: "Meet user-facing transparency",
        desc: "Disclose when someone is talking to an AI and label generated content. These are the easiest duties to check from the outside.",
      },
      {
        title: "Review contracts with model providers",
        desc: "Data retention, training use, processing location and sub-processors. Their failures end up being yours.",
      },
      {
        title: "Build the evidence file",
        desc: "Technical documentation, risk assessments, logs and incidents in one exportable place. Conformity is demonstrated, not declared.",
      },
    ],
    privaroTitle: "Where Privaro fits",
    privaroDesc:
      "Privaro does not deliver compliance on its own: it covers the technical part that is hardest to improvise, which is controlling and proving what data leaves for the models.",
    privaroItems: [
      "Detects personal and sensitive data in every prompt before it reaches the model.",
      "Applies policies by data type, team and provider: tokenize, anonymize or block.",
      "Logs every interaction with user, model, detected entities and the decision applied.",
      "Scans model responses too, catching data leaks on the way out.",
      "Exports audit-ready reports for your data protection officer.",
      "Works with OpenAI, Anthropic, Gemini and others without changing your integration.",
    ],
    faqTitle: "Frequently asked questions",
    faq: [
      {
        q: "Does the EU AI Act apply if my company is outside the EU?",
        a: "Yes, if the system's output is used within the Union or you place the system on the EU market. The test is where the effect happens, not where you are headquartered.",
      },
      {
        q: "Does using ChatGPT at work make me an AI provider?",
        a: "Usually not: you would be a deployer, with lighter duties. But if you fine-tune the model, ship it under your own brand or substantially change its intended purpose, you can become a provider and take on the full set of obligations.",
      },
      {
        q: "Does the EU AI Act replace GDPR?",
        a: "No, they stack. GDPR still governs personal data processing while the AI Act adds duties about the AI system itself. One use case can breach both independently.",
      },
      {
        q: "What if I use streaming responses and cannot mask the output?",
        a: "With streaming, the output is audited in real time rather than masked. The detection is recorded for evidence and alerting even though the text already reached the user. Document that limitation in your risk assessment.",
      },
    ],
    disclaimer:
      "This guide is informational and is not legal advice. For specific compliance decisions, consult your legal counsel.",
    ctaTitle: "Put control and evidence around your AI usage",
    ctaDesc: "Start by knowing where you stand: the risk assessment gives you a picture in minutes.",
    ctaButton: "Request a demo",
    sourcesTitle: "Official sources",
  },
};
