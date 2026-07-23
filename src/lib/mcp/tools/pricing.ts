import { defineTool } from "@lovable.dev/mcp-js";

const PRICING = {
  currency: "EUR",
  billing: "monthly",
  tiers: [
    { id: "tier_1", name: "Tier 1 — Starter", price_month: 150, included_requests: 100_000, target: "Small teams evaluating AI governance" },
    { id: "tier_2", name: "Tier 2 — Growth", price_month: 250, included_requests: 250_000, target: "Startups in production" },
    { id: "tier_3", name: "Tier 3 — Business", price_month: 400, included_requests: 500_000, target: "Recommended starting plan for SaaS with GDPR obligations", recommended: true },
    { id: "tier_4", name: "Tier 4 — Scale", price_month: 700, included_requests: 1_000_000, target: "Active compliance workloads" },
    { id: "tier_5", name: "Tier 5 — Enterprise", price_month: 1_250, included_requests: 2_000_000, target: "Regulated enterprises (banking, health, legal)" },
    { id: "tier_6", name: "Tier 6 — Enterprise+", price_month: 2_500, included_requests: 5_000_000, target: "High volume / multi-tenant" },
    { id: "enterprise_custom", name: "Enterprise / ISV (custom)", price_month: "custom", included_requests: ">5M or unlimited", target: "White-label, dedicated VPC, on-prem, BYOK, SSO — talk to sales" },
  ],
  highlighted_plans: ["tier_1", "tier_3", "enterprise_custom"],
  addons: [
    { id: "blockchain_audit", name: "Blockchain audit certification", price_month: 199 },
    { id: "byok", name: "Bring Your Own Key (AES-256)", price_month: 149 },
  ],
  partner_program: {
    model: "20% recurring monthly discount",
    description: "Partners are billed at Privaro list price minus 20%, on every renewal, across all tiers. Partners monetize their end clients freely (markup, bundle, managed service).",
    legacy_option: "Revenue share available case-by-case for pre-revenue ISVs, on request only.",
  },
  url: "https://privaro.ai/pricing",
};

export default defineTool({
  name: "get_pricing",
  title: "Get Privaro pricing",
  description:
    "Return Privaro's public pricing: 6 monthly tiers (Starter €150 / 100k req → Enterprise+ €2,500 / 5M req), a custom Enterprise/ISV tier, add-ons (BYOK, blockchain audit) and the partner discount model (20% recurring).",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => ({
    content: [{ type: "text", text: JSON.stringify(PRICING, null, 2) }],
    structuredContent: PRICING,
  }),
});
