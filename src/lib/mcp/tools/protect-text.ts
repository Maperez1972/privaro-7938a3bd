import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { protectText } from "../../pii-engine";

export default defineTool({
  name: "protect_text",
  title: "Tokenize sensitive data in text",
  description:
    "Replace every detected sensitive entity in a block of text with a Privaro token (e.g. [NM-0001], [EM-0001]). Returns the protected text, the token → original value map, detections, and processing time. Use this to sanitize prompts before sending them to an LLM.",
  inputSchema: {
    text: z.string().min(1).describe("Raw text to sanitize."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ text }) => {
    const r = protectText(text);
    return {
      content: [{ type: "text", text: r.protectedText }],
      structuredContent: {
        protectedText: r.protectedText,
        originalText: r.originalText,
        detections: r.detections,
        tokenMap: r.tokenMap,
        processingMs: r.processingMs,
      },
    };
  },
});
