import { defineTool } from "@lovable.dev/mcp-js";

const ENTITY_TYPES = [
  { type: "full_name", severity: "medium", category: "personal", token_prefix: "NM" },
  { type: "email", severity: "medium", category: "personal", token_prefix: "EM" },
  { type: "phone", severity: "high", category: "personal", token_prefix: "PH" },
  { type: "dni", severity: "critical", category: "personal", token_prefix: "ID", note: "Spanish DNI/NIE" },
  { type: "ssn", severity: "critical", category: "personal", token_prefix: "SS", note: "US SSN" },
  { type: "iban", severity: "critical", category: "financial", token_prefix: "BK" },
  { type: "credit_card", severity: "critical", category: "financial", token_prefix: "CC" },
  { type: "policy_number", severity: "high", category: "financial", token_prefix: "PN" },
  { type: "ip_address", severity: "low", category: "technical", token_prefix: "IP" },
  { type: "session_id", severity: "low", category: "technical", token_prefix: "SI" },
];

export default defineTool({
  name: "list_entity_types",
  title: "List detectable entity types",
  description:
    "Return every entity type the Privaro detection engine currently recognizes, with its severity, category, and token prefix.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => ({
    content: [{ type: "text", text: JSON.stringify(ENTITY_TYPES, null, 2) }],
    structuredContent: { entityTypes: ENTITY_TYPES },
  }),
});
