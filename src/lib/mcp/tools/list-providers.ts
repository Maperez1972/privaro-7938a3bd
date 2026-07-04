import { defineTool } from "@lovable.dev/mcp-js";

const PROVIDERS = [
  { id: "openai", name: "OpenAI", models: ["gpt-5", "gpt-5-mini", "gpt-4o", "gpt-4o-mini"], modes: ["chat", "embeddings", "images"] },
  { id: "anthropic", name: "Anthropic", models: ["claude-sonnet-4.5", "claude-haiku-4.5", "claude-opus-4"], modes: ["chat"] },
  { id: "google", name: "Google", models: ["gemini-3-flash", "gemini-3-pro", "gemini-2.5-flash", "gemini-2.5-pro"], modes: ["chat", "multimodal"] },
  { id: "mistral", name: "Mistral", models: ["mistral-large", "mistral-medium"], modes: ["chat"] },
  { id: "azure_openai", name: "Azure OpenAI", models: ["gpt-4o", "gpt-4-turbo"], modes: ["chat", "embeddings"] },
  { id: "aws_bedrock", name: "AWS Bedrock", models: ["claude", "titan", "llama"], modes: ["chat", "embeddings"] },
];

export default defineTool({
  name: "list_ai_providers",
  title: "List supported AI providers",
  description:
    "Return the list of LLM providers and model families the Privaro AI Proxy can route traffic to, including supported modes (chat, embeddings, images).",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => ({
    content: [{ type: "text", text: JSON.stringify(PROVIDERS, null, 2) }],
    structuredContent: { providers: PROVIDERS },
  }),
});
