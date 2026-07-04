import { defineTool } from "@lovable.dev/mcp-js";

const PRICING = {
  currency: "EUR",
  plans: [
    {
      id: "starter",
      name: "Starter",
      target: "Small teams evaluating AI governance",
      price_month: 99,
      included_requests: 10_000,
      features: ["PII detection", "Tokenization", "Basic audit logs", "1 AI provider"],
    },
    {
      id: "business",
      name: "Business",
      target: "Growing companies with compliance needs",
      price_month: 499,
      included_requests: 100_000,
      features: ["All Starter features", "Multiple providers", "Custom policies", "Role-based access", "GDPR/HIPAA reports"],
    },
    {
      id: "enterprise",
      name: "Enterprise",
      target: "Regulated enterprises (banks, health, legal)",
      price_month: "custom",
      included_requests: "unlimited",
      features: [
        "All Business features",
        "BYOK encryption",
        "Blockchain audit certification",
        "SSO/SAML",
        "Dedicated support",
        "On-prem/private cloud",
      ],
    },
  ],
  addons: [
    { id: "blockchain_audit", name: "Blockchain audit certification", price_month: 199 },
    { id: "byok", name: "Bring Your Own Key (AES-256)", price_month: 149 },
  ],
  url: "https://privaro.ai/pricing",
};

export default defineTool({
  name: "get_pricing",
  title: "Get Privaro pricing",
  description:
    "Return Privaro's public pricing plans (Starter, Business, Enterprise), included request volumes, key features, and available add-ons.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => ({
    content: [{ type: "text", text: JSON.stringify(PRICING, null, 2) }],
    structuredContent: PRICING,
  }),
});
