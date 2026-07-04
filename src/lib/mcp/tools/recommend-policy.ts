import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { detectPii } from "../../pii-engine";

const ACTION_BY_SEVERITY: Record<string, "tokenize" | "anonymize" | "block" | "allow"> = {
  critical: "block",
  high: "tokenize",
  medium: "tokenize",
  low: "allow",
};

export default defineTool({
  name: "recommend_policy",
  title: "Recommend a Privaro policy for a text sample",
  description:
    "Analyze a text sample and return a suggested Privaro policy: per detected entity type, the recommended action (allow / tokenize / anonymize / block), plus the recommended regulations to enable.",
  inputSchema: {
    text: z.string().min(1).describe("Representative text sample from the workload."),
    context: z
      .enum(["internal", "external_llm", "public_agent"])
      .default("external_llm")
      .describe("Where the sanitized text will be sent. External LLMs get stricter defaults."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ text, context }) => {
    const detections = detectPii(text);
    const perType: Record<string, { count: number; severity: string; category: string; action: string }> = {};
    for (const d of detections) {
      const base = ACTION_BY_SEVERITY[d.severity] ?? "tokenize";
      const action = context === "internal" && base !== "block" ? "allow" : base;
      const existing = perType[d.type];
      perType[d.type] = {
        count: (existing?.count ?? 0) + 1,
        severity: d.severity,
        category: d.category,
        action,
      };
    }
    const regulations = new Set<string>();
    for (const d of detections) {
      if (d.category === "financial") regulations.add("pci_dss");
      if (d.category === "personal") {
        regulations.add("gdpr");
        if (d.type === "dni") regulations.add("lopdgdd");
        if (d.type === "ssn") regulations.add("hipaa");
      }
    }
    const summary = {
      context,
      totalDetections: detections.length,
      policy: Object.entries(perType).map(([type, v]) => ({ entity_type: type, ...v })),
      recommended_regulations: [...regulations],
    };
    return {
      content: [{ type: "text", text: JSON.stringify(summary, null, 2) }],
      structuredContent: summary,
    };
  },
});
