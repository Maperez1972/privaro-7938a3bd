/**
 * send-usage-notification — Edge Function v1
 *
 * Internal, server-to-server only. Called by privaro-proxy (Railway) when
 * increment_billing_requests() reports a quota threshold (80%) or overage
 * (100%) crossing for the FIRST time in a billing cycle.
 *
 * Not user-facing, not triggered from the frontend. Auth is a shared
 * secret header (INTERNAL_NOTIFY_SECRET), not a user JWT — hence
 * verify_jwt=false at deploy time, with the check done manually below.
 *
 * POST /functions/v1/send-usage-notification
 * Headers: X-Internal-Secret: <INTERNAL_NOTIFY_SECRET>
 * Body: {
 *   org_id: string,        // owner_org_id of the billing_account (partner or direct customer)
 *   type: 'usage_threshold' | 'usage_overage',
 *   recipients: string[],
 *   org_name: string,
 *   plan: string,
 *   requests_used: number,
 *   requests_limit: number,
 * }
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type, x-internal-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json; charset=utf-8" },
  });

function buildSubjectAndHtml(
  type: string,
  orgName: string,
  plan: string,
  used: number,
  limit: number,
): { subject: string; html: string } {
  const pct = limit > 0 ? Math.round((used / limit) * 100) : 0;

  if (type === "usage_overage") {
    return {
      subject: `Privaro — ${orgName} ha superado su límite de plan (${plan})`,
      html: `
        <div style="font-family: -apple-system, Segoe UI, sans-serif; max-width: 560px; margin: 0 auto;">
          <div style="background:#0B1220; padding:24px; border-radius:8px 8px 0 0;">
            <span style="color:#fff; font-size:22px; font-weight:700;">privaro</span>
          </div>
          <div style="padding:24px; border:1px solid #E2E8F0; border-top:none; border-radius:0 0 8px 8px;">
            <h2 style="color:#0B1220; margin-top:0;">Habéis superado el límite de vuestro plan ${plan}</h2>
            <p style="color:#334155;">Organización: <strong>${orgName}</strong></p>
            <p style="color:#334155;">Consumo actual: <strong>${used.toLocaleString("es-ES")} / ${limit.toLocaleString("es-ES")}</strong> peticiones (${pct}%).</p>
            <p style="color:#334155;">No hemos bloqueado ningún tráfico — el exceso se está contando como overage y se facturará por separado. Si esperáis mantener este volumen, es buen momento para revisar el tier.</p>
          </div>
        </div>`,
    };
  }

  return {
    subject: `Privaro — ${orgName} al ${pct}% de su plan ${plan}`,
    html: `
      <div style="font-family: -apple-system, Segoe UI, sans-serif; max-width: 560px; margin: 0 auto;">
        <div style="background:#0B1220; padding:24px; border-radius:8px 8px 0 0;">
          <span style="color:#fff; font-size:22px; font-weight:700;">privaro</span>
        </div>
        <div style="padding:24px; border:1px solid #E2E8F0; border-top:none; border-radius:0 0 8px 8px;">
          <h2 style="color:#0B1220; margin-top:0;">Vais al ${pct}% de vuestro plan ${plan}</h2>
          <p style="color:#334155;">Organización: <strong>${orgName}</strong></p>
          <p style="color:#334155;">Consumo actual: <strong>${used.toLocaleString("es-ES")} / ${limit.toLocaleString("es-ES")}</strong> peticiones.</p>
          <p style="color:#334155;">No hace falta que hagáis nada — es solo un aviso. Si vais a mantener o superar este ritmo, podéis revisar el tier desde el dashboard.</p>
        </div>
      </div>`,
  };
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const INTERNAL_SECRET = Deno.env.get("INTERNAL_NOTIFY_SECRET");
  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

  if (!INTERNAL_SECRET || !RESEND_API_KEY) {
    return json({ error: "server_misconfigured" }, 500);
  }

  if (req.headers.get("x-internal-secret") !== INTERNAL_SECRET) {
    return json({ error: "unauthorized" }, 401);
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return json({ error: "invalid_json" }, 400);
  }

  const { org_id, type, recipients, org_name, plan, requests_used, requests_limit } = body ?? {};

  if (!org_id || !type || !Array.isArray(recipients) || recipients.length === 0) {
    return json({ error: "missing_fields" }, 400);
  }

  const { subject, html } = buildSubjectAndHtml(
    type, org_name ?? org_id, plan ?? "unknown",
    Number(requests_used ?? 0), Number(requests_limit ?? 0),
  );

  try {
    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Privaro <notifications@privaro.ai>",
        to: recipients,
        subject,
        html,
      }),
    });

    if (!emailRes.ok) {
      const errText = await emailRes.text();
      console.error("[send-usage-notification] Resend error:", errText);
      return json({ error: "email_send_failed", detail: errText }, 502);
    }

    return json({ status: "sent", type, org_id });
  } catch (e) {
    console.error("[send-usage-notification] Unexpected error:", e);
    return json({ error: "internal_error" }, 500);
  }
});
