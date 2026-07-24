import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * create-api-key — v1 (2026-07-24)
 *
 * CRITICAL functional bug fix: AdminApiKeys.tsx generated API keys
 * entirely client-side (crypto.randomUUID() in the browser) and inserted
 * the RAW key directly into api_keys.key_hash — no hashing at all. The
 * proxy's real verify_api_key() looks up SHA-256(received_key) against
 * that same column, so every key generated from that screen could NEVER
 * work — confirmed against real data: the only two rows with this bug
 * (one for iCommunity Labs itself, one for Octupus/"Robin Api Key") both
 * have a hash_len of 35/37 chars instead of a real SHA-256's 64.
 *
 * This mirrors the correct pattern already used in partner-sub-accounts:
 * generate the raw key server-side, hash it with SHA-256, store only the
 * hash, and return the raw key to the caller exactly once.
 */
async function generateApiKey(): Promise<{ raw: string; hash: string; prefix: string }> {
  const bytes = new Uint8Array(20);
  crypto.getRandomValues(bytes);
  const hex = [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
  const raw = `prvr_${hex}`;
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(raw));
  const hash = [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
  return { raw, hash, prefix: raw.slice(0, 12) };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

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

    // Only admins should be able to create API keys for their own org.
    const { data: roleData } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("org_id", profile.org_id)
      .maybeSingle();

    if (roleData?.role !== "admin") {
      return new Response(JSON.stringify({ error: "Only admins can create API keys" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { name, permissions } = body as { name?: string; permissions?: { detect?: boolean; protect?: boolean } };

    if (!name?.trim()) {
      return new Response(JSON.stringify({ error: "name is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const permMap: Record<string, string> = { detect: "proxy:read", protect: "proxy:write" };
    const selected = Object.entries(permissions || { detect: true, protect: true }).filter(([, v]) => v).map(([k]) => k);
    const selectedPerms = selected.map((k) => permMap[k]);

    const { raw, hash, prefix } = await generateApiKey();

    const { data: inserted, error: insertError } = await adminClient
      .from("api_keys")
      .insert({
        name: name.trim(),
        key_hash: hash,
        key_prefix: prefix,
        org_id: profile.org_id,
        is_active: true,
        permissions: selectedPerms,
        display_permissions: selected,
      })
      .select()
      .single();

    if (insertError) {
      console.error("[create-api-key] insert failed:", insertError);
      return new Response(JSON.stringify({ error: "internal_error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ...inserted, raw_key: raw }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("[create-api-key] error:", err);
    return new Response(JSON.stringify({ error: "internal_error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
