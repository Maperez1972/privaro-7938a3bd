// Build-time llms.txt: generated on every publish from real sources —
// page titles/descriptions (prerender snapshots), prices (src/content/pricing-data.ts)
// and endpoints (live OpenAPI spec). Never edit a static llms.txt by hand.
import { SPEC_METHODS, type Spec } from "./openapi-static";
import {
  ANNUAL_DISCOUNT_PCT,
  ENTERPRISE_PLAN,
  EXTRA_REQUESTS_PRICE,
  PRICED_PLANS,
  TRIAL_DAYS,
} from "../src/content/pricing-data";

interface SnapLike {
  title: string;
  description: string | null;
}

const BASE = "https://privaro.ai";
const fmt = (n: number) => n.toLocaleString("en-US");
const clean = (t: string) => t.replace(/\s*[|—]\s*Privaro( Blog)?\s*$/i, "").trim();

const SECTIONS: { name: string; test: (r: string) => boolean }[] = [
  { name: "Use Cases", test: (r) => r.startsWith("/use-cases/") },
  { name: "Comparisons", test: (r) => r.startsWith("/vs/") },
  { name: "Blog", test: (r) => r.startsWith("/blog/") },
  { name: "Legal", test: (r) => r === "/privacy" || r === "/terms" },
  { name: "Pages", test: () => true },
];

export function buildLlmsTxt(snaps: Record<string, SnapLike>, spec: Spec | null): string {
  const out: string[] = [];
  out.push(
    "# Privaro",
    "",
    "> Privaro is a runtime AI governance proxy for enterprise applications and AI agents. It intercepts every LLM call, detects and tokenizes sensitive data (PII, financial identifiers, health records, contract data) before it reaches any AI model, scans model outputs, and records a blockchain-certified audit trail per interaction via iCommunity Blockchain Services (iBS) on Fantom Opera Mainnet. Built for GDPR and EU AI Act compliance.",
    "",
    "## What Privaro Does",
    "",
    "1. **Detect** — hybrid regex + NLP engine for names, emails, phones, national IDs, IBANs, cards, health data, amounts and custom entities.",
    "2. **Apply policy** — tokenize (reversible), anonymize (irreversible) or block, per data type, role, organization and provider.",
    "3. **Relay** — only the sanitized prompt reaches the LLM provider (OpenAI, Anthropic, Gemini, Mistral or any OpenAI-compatible endpoint).",
    "4. **Scan output** — model responses are checked before they return to the user or agent.",
    "5. **Audit** — every interaction is logged and certified through iBS; exportable DPO reports.",
    "",
    "## Pricing",
    "",
    `Prices in EUR, VAT not included. Annual billing saves ${ANNUAL_DISCOUNT_PCT}%. ${TRIAL_DAYS}-day free trial, no credit card. Source: ${BASE}/pricing`,
    "",
  );
  for (const p of PRICED_PLANS) {
    out.push(
      `- **${p.name}** — €${p.annualPrice}/month billed annually (€${p.monthlyPrice} billed monthly), ${fmt(p.requestsPerMonth)} requests/month`,
    );
  }
  out.push(
    `- **${ENTERPRISE_PLAN.name}** — ${ENTERPRISE_PLAN.summary}`,
    `- Extra requests: €${EXTRA_REQUESTS_PRICE.eur} per ${fmt(EXTRA_REQUESTS_PRICE.per)}.`,
    "",
    "## API Endpoints",
    "",
  );
  const ops: string[] = [];
  for (const [path, item] of Object.entries(spec?.paths ?? {})) {
    for (const m of SPEC_METHODS) {
      const op = item?.[m];
      if (op) ops.push(`- \`${m.toUpperCase()} ${path}\`${op.summary ? ` — ${op.summary}` : ""}`);
    }
  }
  if (ops.length) {
    const server = spec?.servers?.[0]?.url;
    if (server) out.push(`Base URL: ${server}`, "");
    out.push(...ops);
  }
  out.push("", `Full reference (live OpenAPI spec): ${BASE}/docs/api`, "");

  const routes = Object.keys(snaps).sort();
  // Pages whose snapshot kept the generic site description add no information.
  const generic = snaps["/"]?.description ?? null;
  const used = new Set<string>();
  for (const sec of SECTIONS) {
    const list = routes.filter((r) => !used.has(r) && sec.test(r));
    if (!list.length) continue;
    out.push(`## ${sec.name}`, "");
    for (const r of list) {
      used.add(r);
      const s = snaps[r];
      out.push(`- [${clean(s.title)}](${BASE}${r === "/" ? "/" : r})${s.description && (r === "/" || s.description !== generic) ? `: ${s.description}` : ""}`);
    }
    out.push("");
  }
  out.push(
    "## Company",
    "",
    "Privaro is built by iCommunity Labs & Tech S.L. (Madrid, Spain), creators of iCommunity Blockchain Services (iBS). Contact: contact@privaro.ai",
    "",
  );
  return out.join("\n");
}
