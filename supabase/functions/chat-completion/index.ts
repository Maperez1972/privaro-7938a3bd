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
  stream?: boolean;
}

/* ── Provider-specific streaming callers ── */

async function streamOpenAI(
  apiKey: string,
  model: string,
  messages: ChatMessage[],
  maxTokens: number,
  baseUrl?: string
): Promise<ReadableStream> {
  const url = `${baseUrl || "https://api.openai.com"}/v1/chat/completions`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model, messages, max_tokens: maxTokens, stream: true }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI error ${res.status}: ${err}`);
  }
  return transformSSE(res.body!, (json) => {
    return json.choices?.[0]?.delta?.content ?? "";
  });
}

async function streamAnthropic(
  apiKey: string,
  model: string,
  messages: ChatMessage[],
  maxTokens: number
): Promise<ReadableStream> {
  const systemMsg = messages.find((m) => m.role === "system");
  const chatMsgs = messages.filter((m) => m.role !== "system");

  const body: Record<string, unknown> = {
    model,
    max_tokens: maxTokens,
    stream: true,
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
  return transformSSE(res.body!, (json) => {
    if (json.type === "content_block_delta") {
      return json.delta?.text ?? "";
    }
    return "";
  });
}

async function streamDeepSeek(
  apiKey: string,
  model: string,
  messages: ChatMessage[],
  maxTokens: number
): Promise<ReadableStream> {
  return streamOpenAI(apiKey, model, messages, maxTokens, "https://api.deepseek.com");
}

async function streamGoogle(
  apiKey: string,
  model: string,
  messages: ChatMessage[],
  maxTokens: number
): Promise<ReadableStream> {
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
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${apiKey}`,
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
  return transformSSE(res.body!, (json) => {
    return json.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  });
}

/* ── Non-streaming fallbacks ── */

async function callOpenAI(apiKey: string, model: string, messages: ChatMessage[], maxTokens: number, baseUrl?: string): Promise<string> {
  const url = `${baseUrl || "https://api.openai.com"}/v1/chat/completions`;
  const res = await fetch(url, { method: "POST", headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" }, body: JSON.stringify({ model, messages, max_tokens: maxTokens }) });
  if (!res.ok) { const err = await res.text(); throw new Error(`OpenAI error ${res.status}: ${err}`); }
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}

async function callAnthropic(apiKey: string, model: string, messages: ChatMessage[], maxTokens: number): Promise<string> {
  const systemMsg = messages.find((m) => m.role === "system");
  const chatMsgs = messages.filter((m) => m.role !== "system");
  const body: Record<string, unknown> = { model, max_tokens: maxTokens, messages: chatMsgs.map((m) => ({ role: m.role, content: m.content })) };
  if (systemMsg) body.system = systemMsg.content;
  const res = await fetch("https://api.anthropic.com/v1/messages", { method: "POST", headers: { "x-api-key": apiKey, "anthropic-version": "2023-06-01", "Content-Type": "application/json" }, body: JSON.stringify(body) });
  if (!res.ok) { const err = await res.text(); throw new Error(`Anthropic error ${res.status}: ${err}`); }
  const data = await res.json();
  return data.content?.[0]?.text ?? "";
}

async function callGoogle(apiKey: string, model: string, messages: ChatMessage[], maxTokens: number): Promise<string> {
  const systemInstruction = messages.find((m) => m.role === "system");
  const contents = messages.filter((m) => m.role !== "system").map((m) => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] }));
  const body: Record<string, unknown> = { contents, generationConfig: { maxOutputTokens: maxTokens } };
  if (systemInstruction) body.systemInstruction = { parts: [{ text: systemInstruction.content }] };
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  if (!res.ok) { const err = await res.text(); throw new Error(`Google error ${res.status}: ${err}`); }
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
}

/* ── SSE Transform helper ── */

function transformSSE(
  body: ReadableStream<Uint8Array>,
  extractText: (json: any) => string
): ReadableStream {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = "";

  return new ReadableStream({
    async pull(controller) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          // Process remaining buffer
          if (buffer.trim()) {
            processLines(buffer, extractText, controller, encoder);
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
          return;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        let output = "";
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith(":")) continue;
          if (trimmed === "data: [DONE]") {
            controller.enqueue(encoder.encode("data: [DONE]\n\n"));
            controller.close();
            return;
          }
          if (trimmed.startsWith("data: ")) {
            try {
              const json = JSON.parse(trimmed.slice(6));
              const text = extractText(json);
              if (text) output += text;
            } catch {
              // skip malformed JSON
            }
          }
        }
        if (output) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: output })}\n\n`));
          return; // yield control
        }
      }
    },
  });
}

function processLines(
  text: string,
  extractText: (json: any) => string,
  controller: ReadableStreamDefaultController,
  encoder: TextEncoder
) {
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith(":")) continue;
    if (trimmed.startsWith("data: ") && trimmed !== "data: [DONE]") {
      try {
        const json = JSON.parse(trimmed.slice(6));
        const t = extractText(json);
        if (t) controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: t })}\n\n`));
      } catch { /* skip */ }
    }
  }
}

/* ── Main handler ── */

const systemMessage: ChatMessage = {
  role: "system",
  content:
    "You are an AI assistant operating through Privaro's privacy infrastructure. " +
    "All user messages have been automatically scanned for PII (personally identifiable information). " +
    "Any detected PII has been tokenized before reaching you. " +
    "Respond naturally and helpfully to the user's request. " +
    "If you see tokens like [DNI-0001] or [EMAIL-0001], treat them as references to protected data.",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const jwt = authHeader.replace("Bearer ", "");
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser(jwt);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { pipeline_id, messages, max_tokens = 2048, stream = true }: RequestBody = await req.json();
    if (!pipeline_id || !messages?.length) {
      return new Response(JSON.stringify({ error: "pipeline_id and messages required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: pipeline, error: pipelineErr } = await adminClient
      .from("pipelines")
      .select("llm_provider, llm_model, org_id")
      .eq("id", pipeline_id)
      .single();

    if (pipelineErr || !pipeline) {
      return new Response(JSON.stringify({ error: "Pipeline not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

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
    const fullMessages = [systemMessage, ...messages];

    // ── Streaming mode ──
    if (stream) {
      let sseStream: ReadableStream;

      switch (provider.provider) {
        case "openai":
          sseStream = await streamOpenAI(apiKey, model, fullMessages, max_tokens, provider.base_url);
          break;
        case "anthropic":
          sseStream = await streamAnthropic(apiKey, model, fullMessages, max_tokens);
          break;
        case "deepseek":
          sseStream = await streamDeepSeek(apiKey, model, fullMessages, max_tokens);
          break;
        case "google":
          sseStream = await streamGoogle(apiKey, model, fullMessages, max_tokens);
          break;
        default:
          sseStream = await streamOpenAI(apiKey, model, fullMessages, max_tokens, provider.base_url || undefined);
      }

      return new Response(sseStream, {
        headers: {
          ...corsHeaders,
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    }

    // ── Non-streaming mode ──
    let responseText: string;
    switch (provider.provider) {
      case "openai":
        responseText = await callOpenAI(apiKey, model, fullMessages, max_tokens, provider.base_url);
        break;
      case "anthropic":
        responseText = await callAnthropic(apiKey, model, fullMessages, max_tokens);
        break;
      case "deepseek":
        responseText = await callOpenAI(apiKey, model, fullMessages, max_tokens, "https://api.deepseek.com");
        break;
      case "google":
        responseText = await callGoogle(apiKey, model, fullMessages, max_tokens);
        break;
      default:
        responseText = await callOpenAI(apiKey, model, fullMessages, max_tokens, provider.base_url || undefined);
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
