import { defineTool } from "@lovable.dev/mcp-js";

const REGULATIONS = [
  {
    id: "gdpr",
    name: "GDPR",
    region: "EU",
    scope: "Personal data of EU residents",
    privaro_support: ["detection", "tokenization", "audit trail", "DPO reports", "right to be forgotten via vault purge"],
  },
  {
    id: "hipaa",
    name: "HIPAA",
    region: "US",
    scope: "Protected Health Information (PHI)",
    privaro_support: ["PHI detection", "de-identification", "access audit logs"],
  },
  {
    id: "pci_dss",
    name: "PCI-DSS",
    region: "Global",
    scope: "Cardholder data",
    privaro_support: ["credit card detection", "tokenization", "vault encryption AES-256"],
  },
  {
    id: "lopdgdd",
    name: "LOPDGDD",
    region: "ES",
    scope: "Spanish data protection (DNI, NIE, IBAN)",
    privaro_support: ["DNI/NIE detection", "IBAN detection", "AEPD-ready audit"],
  },
  {
    id: "eu_ai_act",
    name: "EU AI Act",
    region: "EU",
    scope: "High-risk AI system governance",
    privaro_support: ["policy engine", "human-in-the-loop reveal", "immutable audit"],
  },
  {
    id: "soc2",
    name: "SOC 2",
    region: "Global",
    scope: "Security, availability, confidentiality",
    privaro_support: ["access controls", "audit logs", "encryption at rest"],
  },
];

export default defineTool({
  name: "list_regulations",
  title: "List supported regulations",
  description:
    "Return the list of privacy and AI regulations Privaro helps organizations comply with (GDPR, HIPAA, PCI-DSS, LOPDGDD, EU AI Act, SOC 2), including region, scope, and how Privaro supports each.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => ({
    content: [{ type: "text", text: JSON.stringify(REGULATIONS, null, 2) }],
    structuredContent: { regulations: REGULATIONS },
  }),
});
