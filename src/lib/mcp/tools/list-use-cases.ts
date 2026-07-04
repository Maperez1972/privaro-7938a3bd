import { defineTool } from "@lovable.dev/mcp-js";

const USE_CASES = [
  {
    id: "legal",
    industry: "Legal",
    problem: "Law firms cannot use ChatGPT/Claude on client documents without leaking privileged information.",
    privaro_solution: "Detect client names, case IDs, contract clauses; tokenize before sending to the LLM; reveal only for authorized lawyers with audit.",
    url: "https://privaro.ai/use-cases/legal",
  },
  {
    id: "fintech",
    industry: "Fintech & Banking",
    problem: "IBAN, credit card numbers, and customer PII cannot reach third-party LLMs under PCI-DSS/GDPR.",
    privaro_solution: "Real-time detection + tokenization of financial identifiers, full audit trail for compliance teams.",
    url: "https://privaro.ai/use-cases/fintech",
  },
  {
    id: "health",
    industry: "Healthcare",
    problem: "Patient records contain PHI that cannot be exposed to public LLMs under HIPAA.",
    privaro_solution: "PHI detection (diagnoses, patient IDs, insurance numbers), de-identification, controlled reveal.",
    url: "https://privaro.ai/use-cases/health",
  },
  {
    id: "agents",
    industry: "AI Agents",
    problem: "Autonomous agents exchange sensitive data across tools without governance.",
    privaro_solution: "Policy engine sits between agents and providers; every interaction is inspected, tokenized, and logged.",
    url: "https://privaro.ai/use-cases/agents",
  },
];

export default defineTool({
  name: "list_use_cases",
  title: "List Privaro use cases",
  description:
    "Return the main industry use cases Privaro is designed for (Legal, Fintech, Healthcare, AI Agents), each with the problem, the Privaro solution, and a reference URL.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => ({
    content: [{ type: "text", text: JSON.stringify(USE_CASES, null, 2) }],
    structuredContent: { useCases: USE_CASES },
  }),
});
