import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

interface RequestBody {
  pipeline_id: string;
  messages: ChatMessage[];
  max_tokens?: number;
}

/* ── Provider-specific callers ── */

async function callOpenAI(
  apiKey: string,
  model: string,
  messages: ChatMessage[],
  maxTokens: number,
  baseUrl?: string
): Promise<string> {
  const url = `${baseUrl || "https://api.openai.com"}/v1/chat/completions`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model, messages, max_tokens: maxTokens }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI error ${res.status}: ${err}`);
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}

async function callAnthropic(
  apiKey: string,
  model: string,
  messages: ChatMessage[],
  maxTokens: number
): Promise<string> {
  // Anthropic uses system as a top-level param
  const systemMsg = messages.find((m) => m.role === "system");
  const chatMsgs = messages.filter((m) => m.role !== "system");

  const body: Record<string, unknown> = {
    model,
    max_tokens: maxTokens,
    messages: chatMsgs.map((m) => ({ role: m.role, content: m.content })),
  };
  if (systemMsg) body.system = systemMsg.content;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Anthropic error ${res.status}: ${err}`);
  }
  const data = await res.json();
  return data.content?.[0]?.text ?? "";
}

async function callDeepSeek(
  apiKey: string,
  model: string,
  messages: ChatMessage[],
  maxTokens: number
): Promise<string> {
  return callOpenAI(apiKey, model, messages, maxTokens, "https://api.deepseek.com");
}

async function callGoogle(
  apiKey: string,
  model: string,
  messages: ChatMessage[],
  maxTokens: number
): Promise<string> {
  // Convert to Gemini format
  const systemInstruction = messages.find((m) => m.role === "system");
  const contents = messages
    .filter((m) => m.role !== "system")
    .map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

  const body: Record<string, unknown> = {
    contents,
    generationConfig: { maxOutputTokens: maxTokens },
  };
  if (systemInstruction) {
    body.systemInstruction = { parts: [{ text: systemInstruction.content }] };
  }

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Google error ${res.status}: ${err}`);
  }
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
}

/* ── Main handler ── */

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Missing authorization" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const jwt = authHeader.replace("Bearer ", "");
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser(jwt);
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { pipeline_id, messages, max_tokens = 2048 }: RequestBody = await req.json();
    if (!pipeline_id || !messages?.length) {
      return new Response(
        JSON.stringify({ error: "pipeline_id and messages required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use admin client to read API keys
    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get pipeline info
    const { data: pipeline, error: pipelineErr } = await adminClient
      .from("pipelines")
      .select("llm_provider, llm_model, org_id")
      .eq("id", pipeline_id)
      .single();

    if (pipelineErr || !pipeline) {
      return new Response(
        JSON.stringify({ error: "Pipeline not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get provider API key
    const { data: provider, error: provErr } = await adminClient
      .from("llm_providers")
      .select("api_key_encrypted, base_url, provider")
      .eq("org_id", pipeline.org_id)
      .eq("provider", pipeline.llm_provider)
      .eq("is_active", true)
      .single();

    if (provErr || !provider?.api_key_encrypted) {
      return new Response(
        JSON.stringify({ error: `No active provider or API key for ${pipeline.llm_provider}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const apiKey = provider.api_key_encrypted;
    const model = pipeline.llm_model;

    // Add system message for Privaro context
    const systemMessage: ChatMessage = {
      role: "system",
      content:
        "You are an AI assistant operating through Privaro's privacy infrastructure. " +
        "All user messages have been automatically scanned for PII (personally identifiable information). " +
        "Any detected PII has been tokenized before reaching you. " +
        "Respond naturally and helpfully to the user's request. " +
        "If you see tokens like [DNI-0001] or [EMAIL-0001], treat them as references to protected data.",
    };
    const fullMessages = [systemMessage, ...messages];

    let responseText: string;

    switch (provider.provider) {
      case "openai":
        responseText = await callOpenAI(apiKey, model, fullMessages, max_tokens, provider.base_url);
        break;
      case "anthropic":
        responseText = await callAnthropic(apiKey, model, fullMessages, max_tokens);
        break;
      case "deepseek":
        responseText = await callDeepSeek(apiKey, model, fullMessages, max_tokens);
        break;
      case "google":
        responseText = await callGoogle(apiKey, model, fullMessages, max_tokens);
        break;
      default:
        // Try OpenAI-compatible API
        responseText = await callOpenAI(
          apiKey,
          model,
          fullMessages,
          max_tokens,
          provider.base_url || undefined
        );
    }

    return new Response(
      JSON.stringify({ content: responseText, model: `${provider.provider}/${model}` }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("chat-completion error:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
