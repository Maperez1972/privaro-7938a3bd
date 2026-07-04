import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

const PREFIXES: Record<string, { type: string; description: string }> = {
  NM: { type: "full_name", description: "Person full name" },
  EM: { type: "email", description: "Email address" },
  BK: { type: "iban", description: "IBAN / bank account" },
  ID: { type: "dni", description: "Spanish DNI / NIE" },
  PH: { type: "phone", description: "Phone number" },
  SS: { type: "ssn", description: "US Social Security Number" },
  CC: { type: "credit_card", description: "Credit card number" },
  IP: { type: "ip_address", description: "Private IP address" },
  SI: { type: "session_id", description: "Session or API token" },
  PN: { type: "policy_number", description: "Policy / contract / invoice number" },
};

export default defineTool({
  name: "explain_token",
  title: "Explain a Privaro token",
  description:
    "Given a Privaro token like [NM-0001] or [BK-0007], return which entity type it represents. Reveal of the original value requires an authenticated request through the Privaro dashboard and is not exposed via MCP.",
  inputSchema: {
    token: z.string().regex(/^\[[A-Z]{2}-\d{4,}\]$/).describe("A Privaro token, e.g. [NM-0001]."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ token }) => {
    const prefix = token.slice(1, 3);
    const info = PREFIXES[prefix];
    if (!info) {
      return {
        content: [{ type: "text", text: `Unknown Privaro token prefix: ${prefix}` }],
        isError: true,
      };
    }
    const out = { token, prefix, ...info, reveal: "Requires authenticated reveal in the Privaro dashboard." };
    return {
      content: [{ type: "text", text: JSON.stringify(out, null, 2) }],
      structuredContent: out,
    };
  },
});
