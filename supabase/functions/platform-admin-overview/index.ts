/**
 * platform-admin-overview — Edge Function v1 (2026-07-23)
 *
 * Roadmap item #11(d). Cross-organization view for actual Privaro/
 * iCommunity staff — NOT an org-scoped role like admin/dpo/developer/
 * viewer (those only ever see their own organization by design). Gated by
 * profiles.is_platform_admin = true, a single global flag, not a role.
 *
 * Lists EVERY organization on the platform (partners, sub-accounts, direct
 * customers) with their plan and this month's own usage (org_usage_monthly)
 * — not just the aggregated billing_account number, which mixes a
 * partner's own traffic with all of its sub-accounts into one figure.
 *
 * Auth: standard Supabase user JWT. Caller must have
 * profiles.is_platform_admin = true — checked directly, no org_id scoping
 * at all (that's the whole point of this endpoint).
 *
 * GET /functions/v1/platform-admin-overview
 * -> { organizations: [{ id, name, org_type, parent_org_id, plan,
 *        requests_used_this_org, requests_limit, discount_phase,
 *        billing_requests_used_aggregate }] }
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json; charset=utf-8" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "GET") return json({ error: "method_not_allowed" }, 405);

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return json({ error: "unauthorized" }, 401);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const authClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await authClient.auth.getUser(token);
    if (userError || !userData?.user) return json({ error: "invalid_token" }, 401);
    const userId = userData.user.id;

    const supabase = createClient(supabaseUrl, serviceKey);

    const { data: profile } = await supabase
      .from("profiles")
      .select("is_platform_admin")
      .eq("id", userId)
      .maybeSingle();

    if (!profile?.is_platform_admin) {
      return json({ error: "platform_admin_required",
        message: "This view is only available to Privaro platform staff." }, 403);
    }

    // All organizations with their billing_account (plan, aggregate usage).
    const { data: orgs, error: orgsError } = await supabase
      .from("organizations")
      .select("id, name, org_type, parent_org_id, created_at, billing_account_id, " +
              "billing_accounts(plan, requests_used, requests_limit, discount_phase, billing_cycle_start)")
      .order("created_at", { ascending: false });

    if (orgsError) {
      console.error("[platform-admin-overview] orgs query failed:", orgsError);
      return json({ error: "orgs_query_failed" }, 500);
    }

    // Current-cycle usage per individual org (not the shared aggregate).
    const { data: usageRows, error: usageError } = await supabase
      .from("org_usage_monthly")
      .select("org_id, cycle_start, requests_used")
      .order("cycle_start", { ascending: false });

    if (usageError) {
      console.error("[platform-admin-overview] usage query failed:", usageError);
      return json({ error: "usage_query_failed" }, 500);
    }

    // Most recent cycle_start row per org_id (usageRows is already ordered
    // desc by cycle_start, so the first match per org_id is the current one).
    const usageByOrg = new Map<string, number>();
    for (const row of usageRows || []) {
      if (!usageByOrg.has(row.org_id)) usageByOrg.set(row.org_id, row.requests_used);
    }

    const result = (orgs || []).map((o: any) => {
      const ba = Array.isArray(o.billing_accounts) ? o.billing_accounts[0] : o.billing_accounts;
      return {
        id: o.id,
        name: o.name,
        org_type: o.org_type,
        parent_org_id: o.parent_org_id,
        created_at: o.created_at,
        plan: ba?.plan ?? null,
        discount_phase: ba?.discount_phase ?? null,
        requests_used_this_org: usageByOrg.get(o.id) ?? 0,
        billing_requests_used_aggregate: ba?.requests_used ?? null,
        requests_limit: ba?.requests_limit ?? null,
        billing_cycle_start: ba?.billing_cycle_start ?? null,
      };
    });

    return json({ organizations: result, count: result.length });
  } catch (e) {
    console.error("[platform-admin-overview] UNCAUGHT:", e);
    return json({ error: "internal_error" }, 500);
  }
});
