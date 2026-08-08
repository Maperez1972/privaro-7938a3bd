import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const PROXY_URL = "https://api.privaro.ai";

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

interface RequestBody {
  pipeline_id: string;
  messages: ChatMessage[];
  max_tokens?: number;
  stream?: boolean;
  conversation_id?: string;
}

/**
 * chat-completion — v2 (2026-08-08)
 *
 * CRITICAL rewrite — found during app-wide functional audit. v1 decrypted
 * the org's real LLM provider key and called OpenAI/Anthropic/etc.
 * DIRECTLY from this Edge Function with the raw messages it received —
 * completely bypassing Privaro's own tokenization. It even shipped a
 * system prompt telling the model "PII has already been tokenized",
 * which was false for anything reaching this function directly (this
 * function itself never protected anything; it happened to look safe
 * only because useChat.ts's sendMessage() separately calls
 * protect-chat-message first and only ever sends already-tokenized
 * content_protected through the history it builds — a caller that
 * didn't do that, or a future bug in that call site, would have sent
 * raw PII straight to the LLM with this function's blessing).
 *
 * Fixed properly, not patched: this function no longer talks to any LLM
 * provider at all. It resolves the caller's org + verifies the pipeline
 * belongs to it (kept from v1 — this check itself was correct and
 * necessary), then forwards the request to Privaro's own
 * /v1/relay/complete or /v1/relay/stream, authenticated with the
 * internal shared-secret pattern (X-Internal-Secret + X-Internal-Org-Id)
 * every other first-party Edge Function already uses for /v1/proxy/*.
 * That endpoint owns tokenization, the actual LLM call, response
 * detokenization, audit logging and quota — once, correctly, in the one
 * place designed to do it — instead of this function reimplementing (and
 * silently skipping) any of that.
 *
 * This also fixes a real functional bug, not just the security one: v1
 * never detokenized the assistant's response, so a reply that echoed
 * back a token like [NM-0001] would show that literal string to the
 * user instead of their real name. /v1/relay/*'s detokenise_response
 * option (enabled here) fixes this as a side effect of the real fix.
 *
 * relay.py was changed in the same pass (privaro-proxy, 2026-08-08) to
 * accept this internal auth pattern — previously only verify_api_key_or_dev
 * was accepted there, which requires a real API key this Edge Function
 * has no way to hold for an arbitrary org (keys are stored as
 * irreversible hashes by design).
 */
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

    const { pipeline_id, messages, max_tokens = 2048, stream = true, conversation_id }: RequestBody =
      await req.json();
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
      .select("org_id")
      .eq("id", pipeline_id)
      .single();

    if (pipelineErr || !pipeline) {
      return new Response(JSON.stringify({ error: "Pipeline not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Kept from v1 — this check was correct: never trust a pipeline_id
    // without verifying it belongs to the caller's own org.
    const { data: callerProfile } = await adminClient
      .from("profiles")
      .select("org_id")
      .eq("id", user.id)
      .single();

    if (!callerProfile?.org_id || callerProfile.org_id !== pipeline.org_id) {
      return new Response(JSON.stringify({ error: "Pipeline not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const cleanMessages = (messages ?? []).filter(
      (m) => typeof m?.content === "string" && m.content.trim().length > 0
    );
    if (!cleanMessages.length) {
      return new Response(JSON.stringify({ error: "no_valid_messages" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const internalSecret = Deno.env.get("INTERNAL_NOTIFY_SECRET");
    if (!internalSecret) {
      return new Response(JSON.stringify({ error: "server_misconfigured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const relayBody = {
      pipeline_id,
      messages: cleanMessages,
      options: {
        max_tokens,
        detokenise_response: true,
        // conversation_id ties this call's tokens to the rest of the chat
        // thread — required for anything reversible later, and without it
        // every call would be treated as an unrelated conversation.
      },
      ...(conversation_id ? { conversation_id } : {}),
    };

    if (!stream) {
      const proxyRes = await fetch(`${PROXY_URL}/v1/relay/complete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Internal-Secret": internalSecret,
          "X-Internal-Org-Id": pipeline.org_id,
        },
        body: JSON.stringify(relayBody),
      });
      const result = await proxyRes.json();
      if (!proxyRes.ok) {
        return new Response(JSON.stringify(result), {
          status: proxyRes.status, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ text: result.response }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Streaming: proxy /v1/relay/stream's SSE through, translating its
    // {"delta": "..."} shape to the {"text": "..."} shape this function's
    // callers (useChat.ts's callLLMStreaming) already parse, so the
    // frontend needs no changes. ──
    const proxyRes = await fetch(`${PROXY_URL}/v1/relay/stream`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Internal-Secret": internalSecret,
        "X-Internal-Org-Id": pipeline.org_id,
      },
      body: JSON.stringify(relayBody),
    });

    if (!proxyRes.ok || !proxyRes.body) {
      const errBody = await proxyRes.json().catch(() => ({ error: "relay_stream_failed" }));
      return new Response(JSON.stringify(errBody), {
        status: proxyRes.status || 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const reader = proxyRes.body.getReader();
    const decoder = new TextDecoder();
    const encoder = new TextEncoder();

    const transformed = new ReadableStream({
      async start(controller) {
        let buffer = "";
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";
            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed || !trimmed.startsWith("data: ")) continue;
              if (trimmed === "data: [DONE]") {
                controller.enqueue(encoder.encode("data: [DONE]\n\n"));
                continue;
              }
              try {
                const json = JSON.parse(trimmed.slice(6));
                if (json.error) {
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: json.error })}\n\n`));
                  continue;
                }
                if (typeof json.delta === "string") {
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: json.delta })}\n\n`));
                }
              } catch { /* skip malformed line */ }
            }
          }
        } finally {
          controller.close();
        }
      },
    });

    return new Response(transformed, {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
    });

  } catch (err) {
    console.error("[chat-completion] error:", err);
    return new Response(
      JSON.stringify({ error: "internal_error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
