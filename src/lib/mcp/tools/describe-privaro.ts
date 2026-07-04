import { defineTool } from "@lovable.dev/mcp-js";

const OVERVIEW = {
  product: "Privaro",
  tagline: "AI privacy governance infrastructure for regulated enterprises.",
  what_it_does:
    "Privaro sits between enterprise apps or AI agents and LLM providers (OpenAI, Anthropic, Gemini, etc). It detects sensitive data in prompts, applies policies (tokenize, anonymize, block), stores originals in an encrypted vault, and produces a full audit trail.",
  target_users: [
    "Legal teams (law firms, in-house legal)",
    "Fintech and banking compliance",
    "Healthcare organizations",
    "Security, compliance, and data governance teams",
    "AI agents exchanging sensitive data",
  ],
  core_components: [
    "Detection Engine (regex + NLP)",
    "Policy Engine (role/org/provider-aware)",
    "Token Vault (AES-256, reversible reveal with audit)",
    "AI Proxy (provider-agnostic)",
    "Audit & Evidence layer (optional blockchain certification)",
  ],
  urls: {
    website: "https://privaro.ai",
    pricing: "https://privaro.ai/pricing",
    docs: "https://privaro.ai/docs",
  },
};

export default defineTool({
  name: "describe_privaro",
  title: "About Privaro",
  description:
    "Return a structured overview of the Privaro platform: what it does, who it's for, its core components, and useful URLs.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => ({
    content: [{ type: "text", text: JSON.stringify(OVERVIEW, null, 2) }],
    structuredContent: OVERVIEW,
  }),
});
