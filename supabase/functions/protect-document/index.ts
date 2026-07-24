import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PROXY_URL = "https://api.privaro.ai";

/**
 * protect-document — v2 (2026-07-23)
 *
 * Fixed a real per-org isolation bug: this used to authenticate to the
 * proxy with a single shared PRIVARO_PRODUCTION_KEY for every
 * organization, which not only broke attribution (all usage credited to
 * one fixed org) but literally could not work for any org other than that
 * key's owner (the proxy checks pipeline.org_id == key's org_id).
 *
 * Root cause: Privaro never stores a recoverable raw API key for any org
 * (SHA-256 hashed only, by design) -- so there was no real key to look up
 * and forward on the user's behalf. Fixed by using the same internal
 * shared-secret pattern already used for encrypt/decrypt-provider-key:
 * this function has ALREADY verified the calling user's identity via their
 * Supabase session JWT and resolved their real org_id below -- it now
 * asserts that org_id to the proxy via X-Internal-Org-Id, authenticated
 * with X-Internal-Secret (INTERNAL_NOTIFY_SECRET) so only Privaro's own
 * trusted Edge Functions can do this, never a customer or partner.
 */
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // ── Auth: verify JWT ──────────────────────────────────────────────────
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

    // ── Resolve the user's REAL org_id ─────────────────────────────────────
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

    const internalSecret = Deno.env.get("INTERNAL_NOTIFY_SECRET");
    if (!internalSecret) {
      return new Response(JSON.stringify({ error: "server_misconfigured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Forward multipart to proxy, asserting the user's real org_id ──────
    const contentType = req.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) {
      return new Response(JSON.stringify({ error: "multipart/form-data required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const proxyResponse = await fetch(`${PROXY_URL}/v1/proxy/protect-document`, {
      method: "POST",
      headers: {
        "X-Internal-Secret": internalSecret,
        "X-Internal-Org-Id": profile.org_id,
        "content-type": contentType,
      },
      body: req.body,
    });

    const result = await proxyResponse.json();

    return new Response(JSON.stringify(result), {
      status: proxyResponse.status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("[protect-document] error:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
