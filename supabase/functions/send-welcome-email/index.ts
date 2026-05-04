/**
 * send-welcome-email — Edge Function v1
 *
 * Triggered by the frontend after a user completes signup + onboarding
 * (step 4 — integration, when API key is generated).
 *
 * Sends a bilingual welcome email via Resend with:
 *   - API key (masked, with link to dashboard)
 *   - Quickstart code snippet (Node + Python)
 *   - Links to docs, demo, status page
 *
 * Updates organizations.welcome_email_sent = true to prevent duplicates.
 *
 * POST /functions/v1/send-welcome-email
 * Auth: Bearer <supabase_user_jwt>
 * Body: { org_id: string, api_key: string, lang: "en" | "es" }
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

// ── Email templates ───────────────────────────────────────────────────────────

function buildHtml(
  firstName: string,
  apiKey: string,
  pipelineId: string,
  lang: "en" | "es"
): string {
  const isEs = lang === "es";

  const subject = isEs
    ? "Tu cuenta Privaro está lista — aquí tienes tu API key"
    : "Your Privaro account is ready — here's your API key";

  const greeting = isEs ? `Hola ${firstName}` : `Hi ${firstName}`;

  const intro = isEs
    ? "Tu cuenta de Privaro está activa. Tienes <strong>500 requests gratuitas</strong> para probar el producto en condiciones reales."
    : "Your Privaro account is live. You have <strong>500 free requests</strong> to test the product in real conditions.";

  const keyLabel = isEs ? "Tu API key" : "Your API key";
  const maskedKey = apiKey.slice(0, 12) + "••••••••••••••••••";

  const step1 = isEs ? "1. Instala el SDK" : "1. Install the SDK";
  const step2 = isEs ? "2. Protege tu primer prompt" : "2. Protect your first prompt";

  const nodeSnippet = `import { PrivaroClient } from "privaro-sdk";

const privaro = new PrivaroClient({
  apiKey: "${apiKey}",
  pipelineId: "${pipelineId || "your-pipeline-uuid"}",
});

const result = await privaro.protect(
  "Patient María García, DNI 34521789X"
);
console.log(result.protected);
// "Patient [NM-0001], DNI [ID-0001]"`;

  const upgradeText = isEs
    ? "Cuando quieras aumentar el límite, puedes hacer upgrade desde el dashboard."
    : "When you're ready to increase the limit, upgrade from the dashboard.";

  const docsText = isEs ? "Ver documentación" : "Read the docs";
  const demoText = isEs ? "Probar la demo" : "Try the live demo";
  const dashboardText = isEs ? "Ir al dashboard" : "Go to dashboard";

  const footerText = isEs
    ? "Recibes este email porque te registraste en Privaro. Si tienes preguntas, responde a este email."
    : "You're receiving this because you signed up for Privaro. Reply to this email if you have questions.";

  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${subject}</title>
<style>
  body { margin: 0; padding: 0; background: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #e5e5e5; }
  .wrap { max-width: 560px; margin: 0 auto; padding: 40px 24px; }
  .logo { font-size: 20px; font-weight: 700; color: #22d3ee; margin-bottom: 32px; }
  h1 { font-size: 24px; font-weight: 600; color: #f5f5f5; margin: 0 0 16px; }
  p { font-size: 15px; line-height: 1.6; color: #a3a3a3; margin: 0 0 20px; }
  .key-box { background: #111; border: 1px solid #22d3ee33; border-radius: 10px; padding: 16px 20px; margin: 24px 0; }
  .key-label { font-size: 11px; text-transform: uppercase; letter-spacing: .08em; color: #737373; margin-bottom: 8px; }
  .key-value { font-family: monospace; font-size: 15px; color: #22d3ee; word-break: break-all; }
  .step { font-size: 13px; font-weight: 600; color: #f5f5f5; margin: 28px 0 8px; }
  pre { background: #111; border: 1px solid #262626; border-radius: 8px; padding: 16px; font-size: 12px; color: #a3a3a3; overflow-x: auto; margin: 0 0 20px; white-space: pre-wrap; word-break: break-all; }
  .btn-row { display: flex; gap: 12px; flex-wrap: wrap; margin: 28px 0; }
  .btn { display: inline-block; padding: 10px 20px; border-radius: 8px; font-size: 14px; font-weight: 500; text-decoration: none; }
  .btn-primary { background: #22d3ee; color: #0a0a0a; }
  .btn-outline { border: 1px solid #333; color: #a3a3a3; }
  .divider { border: none; border-top: 1px solid #1a1a1a; margin: 32px 0; }
  .footer { font-size: 12px; color: #525252; }
  .free-badge { display: inline-block; background: #22d3ee15; border: 1px solid #22d3ee33; color: #22d3ee; border-radius: 20px; padding: 2px 10px; font-size: 12px; font-weight: 500; margin-left: 8px; }
</style>
</head>
<body>
<div class="wrap">
  <div class="logo">▣ Privaro</div>
  <h1>${greeting} 👋</h1>
  <p>${intro}</p>

  <div class="key-box">
    <div class="key-label">${keyLabel} <span class="free-badge">Free plan · 500 requests</span></div>
    <div class="key-value">${maskedKey}</div>
  </div>

  <p style="font-size:13px;color:#525252">
    ${isEs
      ? "La key completa está en tu dashboard. Por seguridad no la incluimos en el email."
      : "The full key is in your dashboard. We don't include it in email for security."}
  </p>

  <div class="step">${step1}</div>
  <pre>npm install privaro-sdk</pre>

  <div class="step">${step2}</div>
  <pre>${nodeSnippet}</pre>

  <p>${upgradeText}</p>

  <div class="btn-row">
    <a href="https://privaro.ai/app" class="btn btn-primary">${dashboardText}</a>
    <a href="https://privaro.ai/docs" class="btn btn-outline">${docsText}</a>
    <a href="https://privaro.ai/demo" class="btn btn-outline">${demoText}</a>
  </div>

  <hr class="divider" />
  <p class="footer">${footerText}<br/>
    <a href="https://status.privaro.ai" style="color:#525252">status.privaro.ai</a> ·
    <a href="https://privaro.ai/changelog" style="color:#525252">${isEs ? "Novedades" : "Changelog"}</a>
  </p>
</div>
</body>
</html>`;
}

// ── Handler ───────────────────────────────────────────────────────────────────

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
  const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!RESEND_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error("[welcome] Missing env vars");
    return json({ error: "server_misconfigured" }, 500);
  }

  // Verify JWT — only authenticated users can trigger this
  const authHeader = req.headers.get("authorization") ?? "";
  if (!authHeader.startsWith("Bearer ")) {
    return json({ error: "unauthorized" }, 401);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  const { data: { user }, error: authError } = await supabase.auth.getUser(
    authHeader.replace("Bearer ", "")
  );
  if (authError || !user) return json({ error: "unauthorized" }, 401);

  // Parse body
  let body: { org_id?: string; api_key?: string; lang?: string; pipeline_id?: string };
  try {
    body = await req.json();
  } catch {
    return json({ error: "invalid_json" }, 400);
  }

  const { org_id, api_key, pipeline_id } = body;
  const lang = (body.lang === "es" ? "es" : "en") as "en" | "es";

  if (!org_id || !api_key) {
    return json({ error: "org_id and api_key are required" }, 400);
  }

  // Check if already sent (idempotency)
  const { data: org } = await supabase
    .from("organizations")
    .select("welcome_email_sent, name")
    .eq("id", org_id)
    .single();

  if (org?.welcome_email_sent) {
    console.log(`[welcome] Already sent for org ${org_id} — skipping`);
    return json({ success: true, skipped: true });
  }

  // Get user profile for first name
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  const fullName = profile?.full_name ?? user.email ?? "there";
  const firstName = fullName.split(" ")[0];
  const userEmail = user.email!;

  // Build and send email
  const html = buildHtml(firstName, api_key, pipeline_id ?? "", lang);

  const subject = lang === "es"
    ? "Tu cuenta Privaro está lista — aquí tienes tu API key"
    : "Your Privaro account is ready — here's your API key";

  const emailRes = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Privaro <noreply@privaro.ai>",
      to: [userEmail],
      subject,
      html,
    }),
  });

  if (!emailRes.ok) {
    const err = await emailRes.text();
    console.error(`[welcome] Resend error: ${err}`);
    return json({ error: "email_delivery_failed" }, 500);
  }

  // Mark as sent
  await supabase
    .from("organizations")
    .update({
      welcome_email_sent: true,
      trial_started_at: new Date().toISOString(),
    })
    .eq("id", org_id);

  console.log(`[welcome] Sent to ${userEmail} for org ${org_id}`);
  return json({ success: true });
});
