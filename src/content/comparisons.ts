export interface ComparisonRow {
  feature: string;
  privaro: string;
  competitor: string;
  privaroWins: boolean;
}

export interface Comparison {
  slug: string;
  competitorName: string;
  competitorUrl: string;
  tagline: string;
  seoTitle: string;
  seoDescription: string;
  hero: {
    h1: string;
    subtitle: string;
  };
  summary: string;
  positioning: {
    privaro: string;
    competitor: string;
  };
  rows: ComparisonRow[];
  bestFor: {
    privaro: string[];
    competitor: string[];
  };
  faq: { q: string; a: string }[];
}

export const COMPARISONS: Comparison[] = [
  {
    slug: "skyflow",
    competitorName: "Skyflow",
    competitorUrl: "https://www.skyflow.com",
    tagline: "Privaro vs Skyflow",
    seoTitle: "Privaro vs Skyflow — AI Privacy & PII Protection Compared",
    seoDescription:
      "Compare Privaro and Skyflow for AI privacy, PII tokenization and LLM governance. Features, pricing, EU AI Act readiness and integration effort side by side.",
    hero: {
      h1: "Privaro vs Skyflow",
      subtitle:
        "Both protect sensitive data — but they solve very different problems. Skyflow is a data privacy vault for storing regulated data. Privaro is a real-time AI governance proxy that keeps PII out of every LLM call.",
    },
    summary:
      "Skyflow shines when you need a persistent, encrypted vault for customer PII across your product. Privaro shines when your risk sits in outbound LLM traffic — prompts leaking names, contracts, IBANs or medical data into OpenAI, Anthropic or Gemini.",
    positioning: {
      privaro:
        "AI governance proxy. Intercepts every prompt and response, detects sensitive entities, tokenizes them reversibly, applies role- and org-scoped policies, and produces an EU AI Act–ready audit trail.",
      competitor:
        "Data privacy vault. Stores regulated data in an isolated, encrypted database and exposes it via APIs and polymorphic tokens for use across the product stack.",
    },
    rows: [
      { feature: "Primary use case", privaro: "AI/LLM governance & compliance", competitor: "Data vault for stored PII", privaroWins: true },
      { feature: "Real-time PII detection — prompts AND LLM responses", privaro: "Native, both directions (sub-100 ms)", competitor: "Requires custom integration", privaroWins: true },
      { feature: "Reversible tokenization for LLMs", privaro: "Built-in, org-scoped", competitor: "Polymorphic tokens (general purpose)", privaroWins: false },
      { feature: "Multi-provider proxy (OpenAI, Anthropic, Gemini)", privaro: "Single endpoint", competitor: "Not included", privaroWins: true },
      { feature: "MCP server for AI agents", privaro: "Included", competitor: "Not available", privaroWins: true },
      { feature: "EU AI Act audit trail", privaro: "Native + blockchain certification", competitor: "General audit logs", privaroWins: true },
      { feature: "GDPR / HIPAA / PCI mappings", privaro: "Yes", competitor: "Yes", privaroWins: false },
      { feature: "Deployment", privaro: "SaaS, self-hosted, hybrid", competitor: "SaaS, private cloud", privaroWins: false },
      { feature: "Starting price", privaro: "€150/mo", competitor: "Enterprise sales only", privaroWins: true },
      { feature: "Time to first protected prompt", privaro: "Minutes (drop-in proxy)", competitor: "Weeks (schema modelling)", privaroWins: true },
    ],
    bestFor: {
      privaro: [
        "Teams shipping LLM features who need to prove GDPR and EU AI Act compliance",
        "Legal, fintech and healthcare orgs using OpenAI, Anthropic or Gemini",
        "AI agent platforms that need PII-safe MCP tooling",
        "Startups that need enterprise-grade governance without enterprise sales cycles",
      ],
      competitor: [
        "Companies rebuilding customer data storage around a privacy vault",
        "Multi-app organizations sharing tokenized PII across many internal services",
        "Teams with the engineering bandwidth for a 3–6 month vault migration",
      ],
    },
    faq: [
      {
        q: "Can I use Skyflow and Privaro together?",
        a: "Yes. A common pattern is Skyflow as the storage vault for structured customer PII and Privaro as the runtime governance layer for LLM traffic. Privaro's tokens can reference Skyflow records when both systems are deployed.",
      },
      {
        q: "Does Privaro require me to re-architect my database?",
        a: "No. Privaro is a proxy — you point your LLM SDK at Privaro's endpoint instead of the provider's, and detection, tokenization and audit happen inline. Your existing databases and apps stay untouched.",
      },
      {
        q: "Which is more cost-effective for an AI-only use case?",
        a: "Privaro. Skyflow's pricing model is designed around vault seats and stored records; Privaro is priced per LLM interaction (starting at €150/mo), which matches how AI risk actually scales.",
      },
    ],
  },
  {
    slug: "nightfall",
    competitorName: "Nightfall AI",
    competitorUrl: "https://www.nightfall.ai",
    tagline: "Privaro vs Nightfall AI",
    seoTitle: "Privaro vs Nightfall AI — AI DLP & LLM Governance Compared",
    seoDescription:
      "Privaro vs Nightfall AI: real-time LLM proxy vs SaaS DLP. Compare PII detection, prompt tokenization, EU AI Act audit, and pricing for enterprise AI privacy.",
    hero: {
      h1: "Privaro vs Nightfall AI",
      subtitle:
        "Nightfall is DLP for SaaS apps — it scans Slack, Jira, Google Drive. Privaro is governance for LLM traffic — it stops PII from ever leaving your prompt to OpenAI, Anthropic or Gemini.",
    },
    summary:
      "If your risk is employees pasting secrets into third-party SaaS, Nightfall is a strong choice. If your risk is your own product sending customer data to LLMs, Privaro is purpose-built for it.",
    positioning: {
      privaro:
        "Runtime AI proxy. Every prompt and response passes through Privaro; sensitive data is detected, tokenized and logged with a full audit trail before it reaches any model.",
      competitor:
        "SaaS-focused DLP. Scans messages and files in third-party tools (Slack, GitHub, Drive) to alert on exposed secrets and PII.",
    },
    rows: [
      { feature: "Primary use case", privaro: "LLM prompt/response governance", competitor: "SaaS content DLP", privaroWins: true },
      { feature: "Real-time PII detection — prompts AND LLM responses", privaro: "Native, both directions (sub-100 ms); streaming responses audited in real time", competitor: "Post-hoc scanning", privaroWins: true },
      { feature: "Reversible tokenization", privaro: "Yes", competitor: "Redaction (irreversible)", privaroWins: true },
      { feature: "Coverage of OpenAI / Anthropic / Gemini", privaro: "Native", competitor: "Requires API integration", privaroWins: true },
      { feature: "MCP server for AI agents", privaro: "Included", competitor: "Not available", privaroWins: true },
      { feature: "Slack / Jira / Drive scanning", privaro: "Not the focus", competitor: "Strong", privaroWins: false },
      { feature: "EU AI Act audit trail", privaro: "Native + blockchain option", competitor: "General DLP logs", privaroWins: true },
      { feature: "Detection accuracy on prompts", privaro: "Optimized for prompt context", competitor: "Optimized for documents", privaroWins: true },
      { feature: "Starting price", privaro: "€150/mo", competitor: "Contact sales", privaroWins: true },
    ],
    bestFor: {
      privaro: [
        "Product teams embedding LLMs in customer-facing features",
        "Regulated industries needing to prove no PII reached a model",
        "AI agent and multi-agent systems requiring MCP-native governance",
      ],
      competitor: [
        "Security teams protecting SaaS collaboration tools",
        "Enterprises worried about secrets in GitHub or credentials in Slack",
        "Compliance teams needing broad content scanning across many SaaS apps",
      ],
    },
    faq: [
      {
        q: "Isn't Nightfall enough if I already scan Slack and GitHub?",
        a: "Nightfall protects human collaboration channels. It doesn't sit on the API path between your app and OpenAI. If your product sends prompts to LLMs, that traffic bypasses Nightfall entirely — Privaro is what closes that gap.",
      },
      {
        q: "Does Privaro do post-hoc scanning too?",
        a: "Privaro's primary value is inline interception, but every request is logged with detected entities, so you can also run retrospective audits over your entire LLM traffic history.",
      },
      {
        q: "Can I get Nightfall-style redaction with Privaro?",
        a: "Yes. Policies can be set to irreversible anonymization instead of reversible tokenization, per data type and per role.",
      },
    ],
  },
  {
    slug: "private-ai",
    competitorName: "Private AI",
    competitorUrl: "https://www.private-ai.com",
    tagline: "Privaro vs Private AI",
    seoTitle: "Privaro vs Private AI — AI Governance Proxy vs PII Redaction API",
    seoDescription:
      "Compare Privaro and Private AI for LLM privacy. Full governance proxy with policies, audit and MCP vs a redaction API — features, pricing and use cases.",
    hero: {
      h1: "Privaro vs Private AI",
      subtitle:
        "Private AI is a best-in-class PII detection and redaction API. Privaro is the full governance layer around it: policies, roles, audit, multi-provider proxy and MCP for AI agents.",
    },
    summary:
      "Choose Private AI if you want a detection engine to wire into your own stack. Choose Privaro if you want the whole compliance layer — proxy, policy engine, token vault, audit trail — out of the box.",
    positioning: {
      privaro:
        "End-to-end AI governance platform. Detection + policy engine + reversible tokenization + multi-provider proxy + EU AI Act audit trail + MCP server.",
      competitor:
        "PII detection and redaction API. Excellent accuracy on 50+ entity types; you build the rest (policy, proxy, audit, tokenization) around it.",
    },
    rows: [
      { feature: "Primary product", privaro: "Governance platform (proxy + engine)", competitor: "Detection & redaction API", privaroWins: true },
      { feature: "PII detection quality", privaro: "Rules + ML, tuned for prompts and LLM responses", competitor: "Best-in-class, 50+ entities", privaroWins: false },
      { feature: "Real-time PII detection — prompts AND LLM responses", privaro: "Native, both directions (sub-100 ms)", competitor: "Detection API only — you wire up each direction", privaroWins: true },
      { feature: "Reversible tokenization", privaro: "Built-in", competitor: "Not included", privaroWins: true },
      { feature: "Policy engine (role + org scoped)", privaro: "Yes", competitor: "Build it yourself", privaroWins: true },
      { feature: "Audit trail for GDPR / EU AI Act", privaro: "Native + blockchain option", competitor: "Not included", privaroWins: true },
      { feature: "Multi-provider proxy", privaro: "OpenAI, Anthropic, Gemini in one endpoint", competitor: "Not included", privaroWins: true },
      { feature: "MCP server for AI agents", privaro: "Included", competitor: "Not available", privaroWins: true },
      { feature: "Deployment", privaro: "SaaS, self-hosted, hybrid", competitor: "SaaS, on-prem container", privaroWins: false },
      { feature: "Time to production", privaro: "Minutes", competitor: "Weeks of integration work", privaroWins: true },
      { feature: "Starting price", privaro: "€150/mo", competitor: "Contact sales", privaroWins: true },
    ],
    bestFor: {
      privaro: [
        "Teams that want a compliance layer out of the box, not a toolkit",
        "Organizations that need audit-ready evidence for regulators",
        "AI agent platforms needing MCP-native, PII-safe tooling",
      ],
      competitor: [
        "Engineering teams building their own AI privacy platform from scratch",
        "Vendors embedding PII detection inside a larger product",
        "On-prem-only environments with strict egress rules",
      ],
    },
    faq: [
      {
        q: "Can Privaro use Private AI's detection under the hood?",
        a: "Privaro's detection engine is designed to be swappable. Enterprise deployments can plug in Private AI (or another engine) while keeping Privaro's policy engine, proxy and audit trail.",
      },
      {
        q: "If I already integrated Private AI, why add Privaro?",
        a: "You still need policies, role-based access, a token vault, a multi-provider proxy, and audit evidence. Privaro provides all of that on top of detection — the parts most teams underestimate.",
      },
      {
        q: "Which one is EU AI Act ready?",
        a: "Privaro is designed with EU AI Act obligations built in: record-keeping, transparency, human oversight controls, and immutable audit trails. Private AI provides one of the technical building blocks — Privaro provides the compliance evidence.",
      },
    ],
  },
  {
    slug: "microsoft-purview",
    competitorName: "Microsoft Purview",
    competitorUrl: "https://www.microsoft.com/security/business/microsoft-purview",
    tagline: "Privaro vs Microsoft Purview",
    seoTitle: "Privaro vs Microsoft Purview — Runtime AI Governance Compared",
    seoDescription:
      "Compare Privaro and Microsoft Purview for AI governance, runtime PII protection, reversible tokenization, multi-LLM coverage and EU AI Act audit evidence.",
    hero: {
      h1: "Privaro vs Microsoft Purview",
      subtitle:
        "Microsoft Purview governs data across Microsoft 365 and Copilot. Privaro is a provider-agnostic runtime layer that protects prompts and responses across OpenAI, Anthropic, Gemini and Azure OpenAI.",
    },
    summary:
      "Choose Microsoft Purview if you're governing data inside the Microsoft 365 / Copilot ecosystem. Choose Privaro if you need a provider-agnostic runtime layer across any LLM, with reversible tokenization and blockchain-certified audit.",
    positioning: {
      privaro:
        "Runtime AI governance proxy. Intercepts prompts and responses before sensitive data reaches any supported LLM, applies policy, tokenizes data reversibly and records audit-ready evidence.",
      competitor:
        "Microsoft 365 data governance suite. Classifies and protects information across SharePoint, Teams, Exchange and Copilot within the Microsoft ecosystem.",
    },
    rows: [
      { feature: "Primary product", privaro: "Provider-agnostic runtime AI governance", competitor: "Microsoft 365 data governance suite", privaroWins: true },
      { feature: "PII detection quality", privaro: "Rules + ML, tuned for prompts and LLM responses", competitor: "Strong classification across Microsoft 365 content", privaroWins: false },
      { feature: "Real-time PII detection — prompts AND LLM responses", privaro: "Native, both directions", competitor: "Not for LLM traffic outside Microsoft Copilot", privaroWins: true },
      { feature: "Reversible tokenization", privaro: "Built-in, controlled token vault", competitor: "Not included for runtime LLM prompts", privaroWins: true },
      { feature: "Policy engine", privaro: "Role-, organization-, data- and provider-scoped", competitor: "Microsoft 365 information protection and DLP policies", privaroWins: false },
      { feature: "Audit trail for the EU AI Act", privaro: "LLM interaction evidence + blockchain certification", competitor: "General data governance and compliance logs", privaroWins: true },
      { feature: "Multi-provider proxy", privaro: "OpenAI, Anthropic, Gemini and Azure OpenAI", competitor: "Not included outside the Microsoft ecosystem", privaroWins: true },
      { feature: "MCP server for AI agents", privaro: "Included", competitor: "Not included", privaroWins: true },
      { feature: "Deployment", privaro: "SaaS, self-hosted, hybrid", competitor: "Microsoft cloud ecosystem", privaroWins: false },
      { feature: "Time to production", privaro: "Minutes with a drop-in proxy", competitor: "Depends on Microsoft 365 configuration", privaroWins: true },
      { feature: "Starting price", privaro: "€150/mo", competitor: "Licensed via M365 E5 / add-on", privaroWins: true },
    ],
    bestFor: {
      privaro: [
        "Organizations using multiple LLM providers across products and internal workflows",
        "Teams that must protect PII in prompts and responses before it reaches a model",
        "AI agent platforms needing MCP-native governance and reversible tokenization",
        "Compliance teams needing evidence for each actual LLM interaction",
      ],
      competitor: [
        "Enterprises governing information primarily inside Microsoft 365",
        "Teams standardizing data classification across SharePoint, Teams and Exchange",
        "Organizations whose AI workflows stay inside Microsoft Copilot",
      ],
    },
    faq: [
      {
        q: "Can we use Privaro if we already have Microsoft Purview?",
        a: "Yes. They are complementary: Purview governs the Microsoft 365 data perimeter, while Privaro governs the runtime of any LLM outside that perimeter, including OpenAI, Anthropic, Gemini and Azure OpenAI workflows.",
      },
      {
        q: "Does Microsoft Purview comply with the EU AI Act?",
        a: "Purview supports data classification, information protection and DLP controls. It does not by itself generate an interaction-level audit record showing what each LLM processed, which policies ran and how sensitive data was protected.",
      },
      {
        q: "Why add Privaro to an existing Microsoft security stack?",
        a: "Privaro closes the runtime gap for AI traffic that does not pass through Microsoft Copilot. It adds inline detection, reversible tokenization, provider-agnostic routing and LLM-specific audit evidence without replacing your Microsoft 365 controls.",
      },
    ],
  },
  {
    slug: "onetrust",
    competitorName: "OneTrust",
    competitorUrl: "https://www.onetrust.com",
    tagline: "Privaro vs OneTrust",
    seoTitle: "Privaro vs OneTrust — AI Runtime Evidence vs Privacy GRC",
    seoDescription:
      "Compare Privaro and OneTrust for AI compliance: real-time PII detection, tokenization and LLM audit evidence versus DPIAs, records of processing and privacy GRC.",
    hero: {
      h1: "Privaro vs OneTrust",
      subtitle:
        "OneTrust manages privacy policies, DPIAs, records of processing and consent. Privaro controls what actually happens inside every LLM prompt and response, in real time.",
    },
    summary:
      "Choose OneTrust for policy, DPIAs and documentation-based privacy management. Choose Privaro for the technical evidence layer OneTrust can't generate on its own — real-time detection, tokenization and an immutable audit trail of every actual LLM interaction.",
    positioning: {
      privaro:
        "Technical AI governance layer. Detects and protects sensitive data inline, routes sanitized requests to any supported LLM and records immutable evidence of every interaction.",
      competitor:
        "Privacy GRC platform. Manages assessments, policies, consent, data maps and records such as DPIAs and records of processing activities.",
    },
    rows: [
      { feature: "Primary product", privaro: "Runtime AI governance and evidence", competitor: "Privacy GRC and documentation", privaroWins: true },
      { feature: "PII detection quality", privaro: "Rules + ML, tuned for prompts and LLM responses", competitor: "Not included for runtime LLM traffic", privaroWins: true },
      { feature: "Real-time PII detection — prompts AND LLM responses", privaro: "Native, both directions", competitor: "Not included", privaroWins: true },
      { feature: "Reversible tokenization", privaro: "Built-in, controlled token vault", competitor: "Not included", privaroWins: true },
      { feature: "Policy engine", privaro: "Technical enforcement by role, organization, data and provider", competitor: "Strong privacy policy and workflow management", privaroWins: false },
      { feature: "Audit trail for the EU AI Act", privaro: "Evidence from actual LLM interactions + blockchain certification", competitor: "Documentation and assessment records", privaroWins: true },
      { feature: "Multi-provider proxy", privaro: "OpenAI, Anthropic, Gemini and Azure OpenAI", competitor: "Not included", privaroWins: true },
      { feature: "MCP server for AI agents", privaro: "Included", competitor: "Not included", privaroWins: true },
      { feature: "Regulatory documentation / DPIA / RoPA", privaro: "Not the focus — complements OneTrust", competitor: "Core capability", privaroWins: false },
      { feature: "Deployment", privaro: "SaaS, self-hosted, hybrid", competitor: "Enterprise SaaS", privaroWins: false },
      { feature: "Time to production", privaro: "Minutes with a drop-in proxy", competitor: "Enterprise implementation", privaroWins: true },
      { feature: "Starting price", privaro: "€150/mo", competitor: "Contact sales", privaroWins: true },
    ],
    bestFor: {
      privaro: [
        "Teams that need technical proof of what each LLM actually processed",
        "Organizations that must detect and protect PII before it reaches an AI provider",
        "Multi-provider AI products and agents requiring runtime policy enforcement",
        "DPOs who need interaction-level evidence for audits and assessments",
      ],
      competitor: [
        "Privacy teams managing DPIAs and records of processing activities",
        "Organizations centralizing consent, data mapping and regulatory workflows",
        "Enterprises coordinating privacy documentation across many business units",
      ],
    },
    faq: [
      {
        q: "Does Privaro replace OneTrust?",
        a: "No. Privaro does not manage DPIAs or consent. It generates the technical evidence a DPO needs to complete those records with real data about how AI is being used and what sensitive information was processed.",
      },
      {
        q: "Why do I need Privaro if our record of processing is already in OneTrust?",
        a: "A documentary record does not prove what a model actually processed. Privaro records each prompt and response, detected entities, policy decisions and protection actions — the precise evidence gap an AEPD or EU AI Act auditor may identify.",
      },
      {
        q: "Can Privaro evidence feed our OneTrust privacy workflows?",
        a: "Yes. Privaro provides the interaction-level audit evidence that can support DPIAs, records of processing and ongoing AI risk reviews managed in OneTrust.",
      },
    ],
  },
];

export const getComparisonBySlug = (slug: string) =>
  COMPARISONS.find((c) => c.slug === slug);
