import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PROXY_URL = "https://api.privaro.ai";

/**
 * protect-chat-message — v1 (2026-07-24)
 *
 * CRITICAL fix: replaces a direct browser-to-proxy call that used
 * VITE_PROXY_API_KEY (a real production key for iCommunity Labs' own
 * "Legal Document Reviewer" pipeline) embedded in the shipped frontend
 * bundle — visible to anyone opening devtools, letting them consume
 * iCommunity Labs' own quota and inject audit_logs indefinitely.
 *
 * Same internal shared-secret pattern as protect-document: this function
 * verifies the caller's Supabase session JWT, resolves their REAL org_id
 * and a pipeline that actually belongs to that org, then asserts org_id
 * to the proxy via X-Internal-Org-Id (authenticated with
 * X-Internal-Secret) — no client-visible API key involved at all.
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

    const body = await req.json();
    const { prompt, pipeline_id, conversation_id } = body as {
      prompt?: string; pipeline_id?: string; conversation_id?: string;
    };

    if (!prompt) {
      return new Response(JSON.stringify({ error: "prompt is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Resolve a pipeline that actually belongs to the caller's org — never
    // trust a pipeline_id without checking, and never fall back to a
    // hardcoded pipeline from a different organization.
    let resolvedPipelineId = pipeline_id;
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

    const proxyResponse = await fetch(`${PROXY_URL}/v1/proxy/protect`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Internal-Secret": internalSecret,
        "X-Internal-Org-Id": profile.org_id,
      },
      body: JSON.stringify({
        prompt,
        pipeline_id: resolvedPipelineId,
        conversation_id,
        options: { mode: "tokenise", include_detections: true, reversible: true },
      }),
    });

    const result = await proxyResponse.json();

    return new Response(JSON.stringify(result), {
      status: proxyResponse.status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("[protect-chat-message] error:", err);
    return new Response(
      JSON.stringify({ error: "internal_error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
