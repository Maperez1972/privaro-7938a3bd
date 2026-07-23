/**
 * partner-sub-accounts — Edge Function v8 (stable)
 *
 * Self-service onboarding for partners. Lets a logged-in USER belonging to
 * a partner organization (org_type='partner') list and create their own
 * sub-account clients.
 *
 * History of bugs found and fixed while bringing this online (2026-07-03):
 *  - v3: user_roles lookup made robust against the signup trigger that
 *    gives every new user a default (iCommunity Labs, developer) row.
 *  - v5: auth.getClaims() threw "not a function" for this fresh function's
 *    esm.sh resolution — switched to the universally-stable auth.getUser().
 *  - v6: the embedded organizations!inner(...) relation came back as an
 *    array, not an object — normalized defensively.
 *  - Root cause of the persistent 500 on billing_accounts: the table was
 *    created via raw SQL migration and never received standard CRUD grants
 *    (only REFERENCES/TRIGGER/TRUNCATE) — fixed at the DB level with
 *    explicit GRANTs + ALTER DEFAULT PRIVILEGES for future tables.
 *
 * Auth: standard Supabase user JWT, NOT the X-Privaro-Key used by the
 * proxy API.
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json; charset=utf-8" },
  });

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    + "-" + crypto.randomUUID().slice(0, 6);
}

async function generateApiKey(): Promise<{ raw: string; hash: string; prefix: string }> {
  const bytes = new Uint8Array(20);
  crypto.getRandomValues(bytes);
  const hex = [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
  const raw = `prvr_${hex}`;
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(raw));
  const hash = [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
  return { raw, hash, prefix: raw.slice(0, 12) };
}

function normalizeOne<T>(v: T | T[] | null | undefined): T | null {
  if (!v) return null;
  return Array.isArray(v) ? (v[0] ?? null) : v;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

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

    const { data: allRoles, error: rolesError } = await supabase
      .from("user_roles")
      .select("org_id, role, organizations!inner(id, name, org_type, billing_account_id)")
      .eq("user_id", userId);

    if (rolesError) {
      console.error("[partner-sub-accounts] roles query failed:", rolesError);
      return json({ error: "roles_query_failed" }, 500);
    }

    const partnerRole = (allRoles || []).find((r: any) => {
      const org = normalizeOne(r.organizations);
      return r.role === "admin" && org?.org_type === "partner";
    });

    if (!partnerRole) {
      return json({ error: "not_a_partner_organization",
        message: "This self-service onboarding is only available to partner account admins." }, 403);
    }

    const partnerOrg = normalizeOne((partnerRole as any).organizations)!;

    if (req.method === "GET") {
      const { data: subAccounts, error: subErr } = await supabase
        .from("organizations")
        .select("id, name, created_at")
        .eq("parent_org_id", partnerOrg.id)
        .eq("org_type", "sub_account")
        .order("created_at", { ascending: false });

      if (subErr) {
        console.error("[partner-sub-accounts] sub_accounts query failed:", subErr);
        return json({ error: "sub_accounts_query_failed" }, 500);
      }

      const { data: billing, error: billErr } = await supabase
        .from("billing_accounts")
        .select("plan, requests_used, requests_limit, discount_phase, billing_cycle_start")
        .eq("id", partnerOrg.billing_account_id)
        .maybeSingle();

      if (billErr) {
        console.error("[partner-sub-accounts] billing query failed:", billErr);
        return json({ error: "billing_query_failed" }, 500);
      }

      return json({
        partner: { id: partnerOrg.id, name: partnerOrg.name },
        sub_accounts: subAccounts || [],
        billing: billing || null,
      });
    }

    if (req.method === "POST") {
      let body: any;
      try {
        body = await req.json();
      } catch {
        return json({ error: "invalid_json" }, 400);
      }

      const { name, sector, llm_provider, llm_model } = body ?? {};
      if (!name || typeof name !== "string" || name.trim().length < 2) {
        return json({ error: "invalid_name" }, 400);
      }
      if (!sector || !llm_provider || !llm_model) {
        return json({ error: "missing_fields",
          message: "sector, llm_provider and llm_model are all required" }, 400);
      }

      const slug = slugify(name.trim());

      const { data: newOrg, error: orgError } = await supabase
        .from("organizations")
        .insert({
          name: name.trim(),
          slug,
          org_type: "sub_account",
          parent_org_id: partnerOrg.id,
          billing_account_id: partnerOrg.billing_account_id,
          plan: "pro",
        })
        .select("id")
        .single();

      if (orgError) {
        console.error("[partner-sub-accounts] org insert failed:", orgError);
        return json({ error: "org_creation_failed", detail: orgError.message }, 500);
      }

      const { data: pipeline, error: pipelineError } = await supabase
        .from("pipelines")
        .insert({
          org_id: newOrg.id,
          name: `${name.trim()} — default pipeline`,
          sector,
          llm_provider,
          llm_model,
        })
        .select("id")
        .single();

      if (pipelineError) {
        console.error("[partner-sub-accounts] pipeline insert failed:", pipelineError);
        await supabase.from("organizations").delete().eq("id", newOrg.id);
        return json({ error: "pipeline_creation_failed", detail: pipelineError.message }, 500);
      }

      const { raw, hash, prefix } = await generateApiKey();
      const { error: keyError } = await supabase.from("api_keys").insert({
        org_id: newOrg.id,
        name: `${name.trim()} — proxy key`,
        key_hash: hash,
        key_prefix: prefix,
        pipeline_ids: [pipeline.id],
      });

      if (keyError) {
        console.error("[partner-sub-accounts] api_key insert failed:", keyError);
        await supabase.from("pipelines").delete().eq("id", pipeline.id);
        await supabase.from("organizations").delete().eq("id", newOrg.id);
        return json({ error: "api_key_creation_failed", detail: keyError.message }, 500);
      }

      return json({
        org_id: newOrg.id,
        pipeline_id: pipeline.id,
        api_key: raw,
        warning: "This key is shown only once. Store it securely now — Privaro cannot retrieve it again.",
      }, 201);
    }

    return json({ error: "method_not_allowed" }, 405);
  } catch (e: any) {
    console.error("[partner-sub-accounts] UNCAUGHT:", e);
    return json({ error: "internal_error" }, 500);
  }
});
