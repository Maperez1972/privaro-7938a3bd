import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PROXY_URL = "https://api.privaro.ai";

/**
 * ocr-chat-image — v1 (2026-08-11)
 *
 * Companion to protect-chat-message, for image attachments in the chat.
 * Extracts real text from a photographed/scanned document image (OCR)
 * BEFORE the user hits send — same point in the flow where PDF/DOCX
 * attachments already extract their real text client-side, via
 * FileAttachment.tsx's extractFilePages().
 *
 * Fixes a real gap found during a functional test (2026-08-11): a DNI
 * photo attached in chat never had its content extracted at all — the
 * frontend only generated a placeholder label ("[Image file: name —
 * size KB]"), so nothing about the image was ever available to protect.
 * The LLM's response describing what a Spanish DNI "typically contains"
 * was a plausible-sounding inference from the filename + conversation
 * context, not an actual leak — no code path anywhere sent the raw image
 * to any LLM (confirmed by exhaustive repo search for "image_url"/
 * multimodal payload construction, none found) — but the feature was
 * simply a no-op for images: neither protected NOR useful.
 *
 * This function calls the real proxy's protect-image-document with
 * extract_only=true — OCR only, no detection/tokenisation/audit-log/
 * vault write at this point, exactly mirroring how PDF/DOCX extraction
 * has no backend call at all until send. Real protection happens once,
 * later, when protect-chat-message tokenises the full message (user
 * text + this extracted OCR text) before it ever reaches the LLM.
 *
 * Same internal shared-secret auth pattern as protect-chat-message/
 * protect-document: verifies the caller's session JWT, resolves their
 * real org_id and a pipeline that belongs to it, then asserts org_id to
 * the proxy via X-Internal-Org-Id — no client-visible API key.
 *
 * multipart/form-data: { file: image, pipeline_id?: string }
 * -> { extracted_text, extracted_chars, ocr_quality }
 */
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
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
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: profile } = await adminClient
      .from("profiles")
      .select("org_id")
      .eq("id", user.id)
      .single();

    if (!profile?.org_id) {
      return new Response(JSON.stringify({ error: "org_not_found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const incomingForm = await req.formData();
    const file = incomingForm.get("file");
    const pipelineIdInput = incomingForm.get("pipeline_id");

    if (!(file instanceof File)) {
      return new Response(JSON.stringify({ error: "file is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Same never-trust-a-bare-id pattern as protect-chat-message: resolve a
    // pipeline that actually belongs to the caller's org, or fall back to
    // their first active one — never a hardcoded/unchecked pipeline_id.
    let resolvedPipelineId = typeof pipelineIdInput === "string" ? pipelineIdInput : undefined;
    if (resolvedPipelineId) {
      const { data: pipeline } = await adminClient
        .from("pipelines")
        .select("id")
        .eq("id", resolvedPipelineId)
        .eq("org_id", profile.org_id)
        .maybeSingle();
      if (!pipeline) {
        return new Response(JSON.stringify({ error: "Pipeline not found" }), {
          status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    } else {
      const { data: defaultPipeline } = await adminClient
        .from("pipelines")
        .select("id")
        .eq("org_id", profile.org_id)
        .eq("status", "active")
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();
      if (!defaultPipeline) {
        return new Response(JSON.stringify({ error: "No active pipeline for this organization" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      resolvedPipelineId = defaultPipeline.id;
    }

    const internalSecret = Deno.env.get("INTERNAL_NOTIFY_SECRET");
    if (!internalSecret) {
      return new Response(JSON.stringify({ error: "server_misconfigured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const outgoingForm = new FormData();
    outgoingForm.append("file", file, file.name);
    outgoingForm.append("pipeline_id", resolvedPipelineId!);
    outgoingForm.append("extract_only", "true");

    const proxyResponse = await fetch(`${PROXY_URL}/v1/proxy/protect-image-document`, {
      method: "POST",
      headers: {
        "X-Internal-Secret": internalSecret,
        "X-Internal-Org-Id": profile.org_id,
        // Content-Type deliberately omitted — fetch sets the correct
        // multipart boundary automatically for a FormData body.
      },
      body: outgoingForm,
    });

    const result = await proxyResponse.json();

    return new Response(JSON.stringify(result), {
      status: proxyResponse.status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("[ocr-chat-image] error:", err);
    return new Response(
      JSON.stringify({ error: "internal_error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
