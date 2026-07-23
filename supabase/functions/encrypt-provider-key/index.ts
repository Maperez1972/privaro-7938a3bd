/**
 * encrypt-provider-key — Edge Function v2 (DIAGNOSTIC — temporary)
 *
 * Fixes a real security bug: AdminProviders.tsx was saving LLM provider API
 * keys as PLAINTEXT into llm_providers.api_key_encrypted. This Edge
 * Function is the missing link — the frontend must call THIS instead of
 * writing api_key_encrypted directly.
 *
 * Flow: authenticated admin's raw key -> this function -> proxy's
 * /internal/encrypt-provider-key (AES-256-GCM, same ENCRYPTION_KEY the
 * proxy already uses to decrypt at call time) -> store only the encrypted
 * result. The raw key exists in memory for the duration of this one
 * request and is never returned or logged.
 *
 * v2 is a TEMPORARY diagnostic build — surfaces the real proxy error
 * detail (stage, proxy_status, detail) in the response instead of a
 * generic 502, to debug a "server_misconfigured" issue currently being
 * chased (INTERNAL_NOTIFY_SECRET not resolving in this function's env,
 * despite being set for send-usage-notification). Revert to a quieter
 * error response once resolved — don't leak proxy error internals to
 * the browser in the long run.
 *
 * Auth: standard Supabase user JWT. Caller must be admin of the org they're
 * configuring a provider for.
 *
 * POST /functions/v1/encrypt-provider-key
 * Body: { provider: string, raw_key: string, base_url?: string }
 * -> { success: true, api_key_hint: string }
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json; charset=utf-8" },
  });

const PROXY_URL = "https://api.privaro.ai";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return json({ error: "unauthorized" }, 401);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const internalSecret = Deno.env.get("INTERNAL_NOTIFY_SECRET");

    if (!internalSecret) {
      return json({ error: "server_misconfigured", detail: "INTERNAL_NOTIFY_SECRET not set in Supabase Edge Function secrets" }, 500);
    }

    const authClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await authClient.auth.getUser(token);
    if (userError || !userData?.user) return json({ error: "invalid_token" }, 401);
    const userId = userData.user.id;

    const supabase = createClient(supabaseUrl, serviceKey);

    const { data: userRole } = await supabase
      .from("user_roles")
      .select("org_id, role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();

    if (!userRole) return json({ error: "admin_role_required" }, 403);
    const orgId = userRole.org_id;

    let body: any;
    try {
      body = await req.json();
    } catch {
      return json({ error: "invalid_json" }, 400);
    }

    const { provider, raw_key, base_url } = body ?? {};
    if (!provider || typeof provider !== "string") return json({ error: "missing_provider" }, 400);
    if (!raw_key || typeof raw_key !== "string" || raw_key.length < 8) return json({ error: "invalid_key" }, 400);

    let encryptRes;
    try {
      encryptRes = await fetch(`${PROXY_URL}/internal/encrypt-provider-key`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Internal-Secret": internalSecret },
        body: JSON.stringify({ raw_key }),
      });
    } catch (fetchErr) {
      return json({ error: "encryption_failed", stage: "fetch_to_proxy", detail: String(fetchErr) }, 502);
    }

    if (!encryptRes.ok) {
      const errText = await encryptRes.text();
      return json({
        error: "encryption_failed",
        stage: "proxy_response",
        proxy_status: encryptRes.status,
        detail: errText,
      }, 502);
    }

    const { encrypted } = await encryptRes.json();
    const apiKeyHint = `...${raw_key.slice(-4)}`;

    const { data: existing } = await supabase
      .from("llm_providers")
      .select("id")
      .eq("org_id", orgId)
      .eq("provider", provider)
      .maybeSingle();

    const updatePayload: Record<string, unknown> = {
      api_key_encrypted: encrypted,
      api_key_hint: apiKeyHint,
      is_active: true,
    };
    if (base_url) updatePayload.base_url = base_url;

    if (existing) {
      const { error: updateError } = await supabase.from("llm_providers").update(updatePayload).eq("id", existing.id);
      if (updateError) return json({ error: "save_failed", detail: updateError.message }, 500);
    } else {
      const { error: insertError } = await supabase.from("llm_providers").insert({ org_id: orgId, provider, ...updatePayload });
      if (insertError) return json({ error: "save_failed", detail: insertError.message }, 500);
    }

    return json({ success: true, api_key_hint: apiKeyHint });
  } catch (e) {
    return json({ error: "internal_error", detail: e?.message ?? String(e) }, 500);
  }
});
