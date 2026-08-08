/**
 * usage-alerts — Edge Function v1
 *
 * Barrido periódico (pg_cron -> pg_net, o llamada manual desde ops) que
 * revisa el consumo de cada billing_account del ciclo en curso y dispara
 * avisos cuando se cruzan los umbrales del 90% y del 95% del plan.
 *
 * Complementa lo que ya existía:
 *  - el proxy (Railway) avisa en el 80% y en el 100% (overage) desde
 *    increment_billing_requests().
 *  - esta función cubre los umbrales intermedios 90% / 95%, que son los
 *    que sirven para empujar un upgrade de plan antes de tocar el límite.
 *
 * Para cuentas de partner el consumo evaluado es el AGREGADO: la suma de
 * org_usage_monthly de la organización partner y de todas sus sub-cuentas
 * (todas comparten billing_account_id).
 *
 * Cada (billing_account, ciclo, umbral) se notifica UNA sola vez; el
 * registro vive en public.billing_usage_alerts.
 *
 * Destinatarios: los admins de las organizaciones del billing account +
 * el buzón interno de ops (USAGE_ALERTS_OPS_EMAIL, por defecto
 * soporte@icommunity.io -- mismo buzón usado para el aviso de cambio de
 * cupón de Stripe en apply_discount_reviews(); hello@icommunity.io está
 * descartado como default porque ya es el buzón público de leads/prensa,
 * no el operativo interno).
 *
 * Auth: secreto compartido, no JWT de usuario.
 * POST /functions/v1/usage-alerts
 * Headers: X-Internal-Secret: <INTERNAL_NOTIFY_SECRET>
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type, x-internal-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const THRESHOLDS = [90, 95] as const;

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json; charset=utf-8" },
  });

function alertHtml(orgName: string, plan: string, used: number, limit: number, pct: number) {
  return `
    <div style="font-family: -apple-system, Segoe UI, sans-serif; max-width: 560px; margin: 0 auto;">
      <div style="background:#0B1220; padding:24px; border-radius:8px 8px 0 0;">
        <span style="color:#fff; font-size:22px; font-weight:700;">privaro</span>
      </div>
      <div style="padding:24px; border:1px solid #E2E8F0; border-top:none; border-radius:0 0 8px 8px;">
        <h2 style="color:#0B1220; margin-top:0;">Vais al ${pct}% de vuestro plan ${plan}</h2>
        <p style="color:#334155;">Organización: <strong>${orgName}</strong></p>
        <p style="color:#334155;">Consumo del ciclo actual: <strong>${used.toLocaleString("es-ES")} / ${limit.toLocaleString("es-ES")}</strong> peticiones.</p>
        <p style="color:#334155;">Al superar el 100% no bloqueamos tráfico: el exceso se factura como overage. Si vais a mantener este ritmo, sale a cuenta subir de plan antes de fin de ciclo.</p>
        <p style="color:#334155;"><a href="https://privaro.ai/pricing" style="color:#0D9488;">Ver planes →</a></p>
      </div>
    </div>`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const INTERNAL_SECRET = Deno.env.get("INTERNAL_NOTIFY_SECRET");
  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
  const OPS_EMAIL = Deno.env.get("USAGE_ALERTS_OPS_EMAIL") ?? "soporte@icommunity.io";

  if (!INTERNAL_SECRET || !RESEND_API_KEY) return json({ error: "server_misconfigured" }, 500);
  if (req.headers.get("x-internal-secret") !== INTERNAL_SECRET) return json({ error: "unauthorized" }, 401);

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  try {
    const { data: accounts, error: accErr } = await supabase
      .from("billing_accounts")
      .select("id, plan, requests_used, requests_limit, billing_cycle_start");

    if (accErr) {
      console.error("[usage-alerts] billing_accounts query failed:", accErr);
      return json({ error: "billing_query_failed", detail: accErr.message }, 500);
    }

    const { data: orgs, error: orgErr } = await supabase
      .from("organizations")
      .select("id, name, org_type, billing_account_id");

    if (orgErr) {
      console.error("[usage-alerts] organizations query failed:", orgErr);
      return json({ error: "orgs_query_failed", detail: orgErr.message }, 500);
    }

    const orgsByAccount = new Map<string, any[]>();
    for (const o of orgs || []) {
      if (!o.billing_account_id) continue;
      const list = orgsByAccount.get(o.billing_account_id) ?? [];
      list.push(o);
      orgsByAccount.set(o.billing_account_id, list);
    }

    const results: any[] = [];

    for (const acc of accounts || []) {
      const limit = Number(acc.requests_limit) || 0;
      if (limit <= 0) continue;

      const accountOrgs = orgsByAccount.get(acc.id) ?? [];
      if (accountOrgs.length === 0) continue;

      const cycleStart = acc.billing_cycle_start
        ? new Date(acc.billing_cycle_start).toISOString().slice(0, 10)
        : null;

      // Consumo agregado del ciclo: suma de todas las orgs del billing
      // account (partner + sub-cuentas). Si no hay filas de uso por org,
      // caemos al contador del propio billing account.
      let used = Number(acc.requests_used) || 0;
      if (cycleStart) {
        const { data: usageRows } = await supabase
          .from("org_usage_monthly")
          .select("org_id, requests_used")
          .eq("cycle_start", cycleStart)
          .in("org_id", accountOrgs.map((o) => o.id));

        const summed = (usageRows || []).reduce(
          (sum: number, r: any) => sum + (Number(r.requests_used) || 0),
          0,
        );
        if (summed > 0) used = summed;
      }

      const pct = Math.floor((used / limit) * 100);
      const crossed = THRESHOLDS.filter((t) => pct >= t);
      if (crossed.length === 0) continue;

      // Solo el umbral más alto cruzado, para no mandar dos correos seguidos.
      const threshold = crossed[crossed.length - 1];

      const { data: existing } = await supabase
        .from("billing_usage_alerts")
        .select("id")
        .eq("billing_account_id", acc.id)
        .eq("cycle_start", cycleStart)
        .eq("threshold", threshold)
        .maybeSingle();

      if (existing) continue;

      const ownerOrg =
        accountOrgs.find((o) => o.org_type === "partner") ??
        accountOrgs.find((o) => o.org_type !== "sub_account") ??
        accountOrgs[0];

      // Admins de cualquiera de las orgs del billing account.
      const { data: adminRoles } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "admin")
        .in("org_id", accountOrgs.map((o) => o.id));

      const recipients = new Set<string>([OPS_EMAIL]);
      for (const r of adminRoles || []) {
        const { data: u } = await supabase.auth.admin.getUserById(r.user_id);
        if (u?.user?.email) recipients.add(u.user.email);
      }

      const subject = `Privaro — ${ownerOrg.name} al ${pct}% de su plan ${acc.plan}`;
      const emailRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Privaro <notifications@privaro.ai>",
          to: [...recipients],
          subject,
          html: alertHtml(ownerOrg.name, acc.plan, used, limit, pct),
        }),
      });

      if (!emailRes.ok) {
        const detail = await emailRes.text();
        console.error("[usage-alerts] Resend error:", emailRes.status, detail);
        results.push({ billing_account_id: acc.id, threshold, sent: false, detail });
        continue;
      }

      const { error: insErr } = await supabase.from("billing_usage_alerts").insert({
        billing_account_id: acc.id,
        cycle_start: cycleStart,
        threshold,
        pct_at_send: pct,
        requests_used: used,
        requests_limit: limit,
        recipients: [...recipients],
      });
      if (insErr) console.error("[usage-alerts] alert insert failed:", insErr);

      results.push({ billing_account_id: acc.id, threshold, pct, sent: true, recipients: recipients.size });
    }

    return json({ status: "ok", checked: (accounts || []).length, alerts: results });
  } catch (e) {
    console.error("[usage-alerts] UNCAUGHT:", e);
    return json({ error: "internal_error" }, 500);
  }
});
