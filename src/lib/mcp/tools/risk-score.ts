import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { detectPii } from "../../pii-engine";

const SEVERITY_WEIGHT: Record<string, number> = {
  critical: 40,
  high: 20,
  medium: 10,
  low: 3,
};

export default defineTool({
  name: "assess_risk",
  title: "Assess privacy risk of text",
  description:
    "Score the privacy/compliance risk of a block of text based on detected sensitive entities. Returns a 0–100 risk score, a risk level (none/low/medium/high/critical), and a breakdown by severity and category.",
  inputSchema: {
    text: z.string().min(1).describe("Text to assess."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ text }) => {
    const detections = detectPii(text);
    let score = 0;
    const bySeverity: Record<string, number> = {};
    const byCategory: Record<string, number> = {};
    for (const d of detections) {
      score += SEVERITY_WEIGHT[d.severity] ?? 5;
      bySeverity[d.severity] = (bySeverity[d.severity] ?? 0) + 1;
      byCategory[d.category] = (byCategory[d.category] ?? 0) + 1;
    }
    score = Math.min(100, score);
    const level =
      score === 0 ? "none" : score < 15 ? "low" : score < 40 ? "medium" : score < 70 ? "high" : "critical";
    const summary = {
      score,
      level,
      totalDetections: detections.length,
      bySeverity,
      byCategory,
      recommendation:
        level === "none"
          ? "Safe to send to an LLM without transformation."
          : level === "low"
            ? "Consider tokenizing before sending to third-party LLMs."
            : level === "medium"
              ? "Tokenize sensitive entities and log the interaction."
              : "Tokenize or block. Do not send raw text to external providers.",
    };
    return {
      content: [{ type: "text", text: JSON.stringify(summary, null, 2) }],
      structuredContent: summary,
    };
  },
});
