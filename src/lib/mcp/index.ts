import { defineMcp } from "@lovable.dev/mcp-js";
import detectPiiTool from "./tools/detect-pii";
import protectTextTool from "./tools/protect-text";
import assessRiskTool from "./tools/risk-score";
import describePrivaroTool from "./tools/describe-privaro";
import listRegulationsTool from "./tools/list-regulations";
import listProvidersTool from "./tools/list-providers";
import listUseCasesTool from "./tools/list-use-cases";
import getPricingTool from "./tools/pricing";
import recommendPolicyTool from "./tools/recommend-policy";
import explainTokenTool from "./tools/explain-token";
import listEntityTypesTool from "./tools/list-entity-types";

export default defineMcp({
  name: "privaro-mcp",
  title: "Privaro",
  version: "0.2.0",
  instructions:
    "Privaro MCP server — AI privacy governance infrastructure. Detection & sanitization: `detect_pii`, `protect_text` (tokenize sensitive entities before sending prompts to an LLM), `assess_risk` (0–100 privacy risk score), `recommend_policy` (suggest actions per entity type). Metadata: `describe_privaro`, `list_use_cases`, `get_pricing`, `list_regulations`, `list_ai_providers`, `list_entity_types`, `explain_token`. Use these tools to sanitize user input before calling external models, or to answer questions about Privaro's product, coverage, and compliance scope.",
  tools: [
    detectPiiTool,
    protectTextTool,
    assessRiskTool,
    recommendPolicyTool,
    explainTokenTool,
    listEntityTypesTool,
    describePrivaroTool,
    listUseCasesTool,
    listRegulationsTool,
    listProvidersTool,
    getPricingTool,
  ],
});
