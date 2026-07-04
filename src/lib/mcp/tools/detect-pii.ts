import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { detectPii, protectText } from "../../pii-engine";

export default defineTool({
  name: "detect_pii",
  title: "Detect PII in text",
  description:
    "Scan a block of text with Privaro's PII detection engine. Returns detected entities (names, emails, IBAN, DNI, phone, SSN, credit cards, IPs, session IDs, policy numbers) and an optional tokenized/protected version of the text.",
  inputSchema: {
    text: z.string().min(1).describe("Raw text to scan for sensitive data."),
    protect: z
      .boolean()
      .default(false)
      .describe("If true, also return the text with detected entities replaced by Privaro tokens."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ text, protect }) => {
    const detections = detectPii(text);
    const summary = {
      count: detections.length,
      types: Array.from(new Set(detections.map((d) => d.type))),
      detections,
      ...(protect
        ? (() => {
            const r = protectText(text);
            return { protectedText: r.protectedText, tokenMap: r.tokenMap };
          })()
        : {}),
    };
    return {
      content: [{ type: "text", text: JSON.stringify(summary, null, 2) }],
      structuredContent: summary,
    };
  },
});
