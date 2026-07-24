import { Resend } from "npm:resend@4.0.0";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") as string;
if (!RESEND_API_KEY) throw new Error('RESEND_API_KEY is not set');

const resend = new Resend(RESEND_API_KEY);
const APP_URL = 'https://privaro.ai';
const SUPABASE_URL = 'https://evtfdgjliyhpubbrxzuq.supabase.co';

function baseHtml(content: string): string {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Privaro</title></head>
<body style="margin:0;padding:0;background:#F3F4F6;font-family:-apple-system,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
<tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;">
<tr><td style="background:#1A1A2E;padding:28px 40px;">
<span style="font-size:22px;font-weight:800;color:#fff;">PRIVA<span style="color:#A78BFA;">RO</span></span>
</td></tr>
<tr><td style="padding:40px;color:#1F2937;">${content}</td></tr>
<tr><td style="background:#F9FAFB;padding:20px 40px;border-top:1px solid #E5E7EB;">
<p style="margin:0;font-size:12px;color:#9CA3AF;">&copy; 2026 iCommunity Labs &mdash; <a href="${APP_URL}" style="color:#7B2D8B;">privaro.ai</a></p>
</td></tr>
</table></td></tr></table></body></html>`;
}

const btn = (url: string, label: string) =>
  `<a href="${url}" style="display:inline-block;background:#7B2D8B;color:#fff;font-weight:600;font-size:15px;padding:14px 28px;border-radius:8px;text-decoration:none;margin:24px 0;">${label}</a>`;

// Construye la URL de verificacion correcta
// Supabase Auth la maneja y luego redirige al redirect_to del frontend
function buildVerifyUrl(tokenHash: string, type: string, redirectTo: string): string {
  const params = new URLSearchParams({
    token: tokenHash,
    type: type,
    redirect_to: redirectTo || APP_URL,
  });
  return `${SUPABASE_URL}/auth/v1/verify?${params.toString()}`;
}

function getTemplate(
  emailType: string,
  token: string,
  tokenHash: string,
  redirectTo: string,
) {
  // Para recovery, el redirect_to debe apuntar a /reset-password del frontend
  const recoveryRedirect = redirectTo || `${APP_URL}/reset-password`;
  const defaultRedirect = redirectTo || APP_URL;

  switch (emailType) {
    case 'recovery':
      return {
        subject: 'Reset your Privaro password',
        html: baseHtml(`
          <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#1A1A2E;">Reset your password</h1>
          <p style="color:#4B5563;line-height:1.6;">Click below to choose a new password for your Privaro account.</p>
          ${btn(buildVerifyUrl(tokenHash, 'recovery', recoveryRedirect), 'Reset password')}
          <p style="font-size:12px;color:#9CA3AF;margin-top:24px;">This link expires in 1 hour. If you did not request this, ignore this email.</p>
        `),
      };

    case 'signup': case 'confirmation': case 'email':
      return {
        subject: 'Confirm your Privaro account',
        html: baseHtml(`
          <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#1A1A2E;">Confirm your account</h1>
          <p style="color:#4B5563;line-height:1.6;">Welcome to Privaro. Click below to confirm your email.</p>
          ${btn(buildVerifyUrl(tokenHash, 'email', defaultRedirect), 'Confirm email')}
          <p style="color:#4B5563;font-size:14px;margin-top:8px;">Or enter this one-time code: <strong style="font-family:monospace;font-size:18px;color:#1A1A2E;letter-spacing:0.1em;">${token}</strong></p>
          <p style="font-size:12px;color:#9CA3AF;margin-top:24px;">This link expires in 24 hours.</p>
        `),
      };

    case 'magiclink':
      return {
        subject: 'Your Privaro login link',
        html: baseHtml(`
          <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#1A1A2E;">Your magic link</h1>
          <p style="color:#4B5563;line-height:1.6;">Click below to log in to Privaro. Single use only.</p>
          ${btn(buildVerifyUrl(tokenHash, 'magiclink', defaultRedirect), 'Log in to Privaro')}
          <p style="font-size:12px;color:#9CA3AF;margin-top:24px;">Expires in 1 hour.</p>
        `),
      };

    case 'invite':
      return {
        subject: "You've been invited to Privaro",
        html: baseHtml(`
          <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#1A1A2E;">You've been invited</h1>
          <p style="color:#4B5563;line-height:1.6;">You have been invited to join an organization on Privaro.</p>
          ${btn(buildVerifyUrl(tokenHash, 'invite', defaultRedirect), 'Accept invitation')}
          <p style="font-size:12px;color:#9CA3AF;margin-top:24px;">Expires in 7 days.</p>
        `),
      };

    case 'email_change': case 'email_change_new': case 'email_change_current':
      return {
        subject: 'Confirm your new email — Privaro',
        html: baseHtml(`
          <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#1A1A2E;">Confirm your new email</h1>
          <p style="color:#4B5563;line-height:1.6;">Click below to confirm your new email address for Privaro.</p>
          ${btn(buildVerifyUrl(tokenHash, 'email_change', defaultRedirect), 'Confirm new email')}
          <p style="font-size:12px;color:#9CA3AF;margin-top:24px;">If you did not request this, contact security@icommunity.io immediately.</p>
        `),
      };

    default:
      return {
        subject: 'Action required — Privaro',
        html: baseHtml(`
          <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#1A1A2E;">Your verification code</h1>
          <p style="font-family:monospace;font-size:32px;font-weight:700;color:#7B2D8B;letter-spacing:0.2em;margin:24px 0;">${token}</p>
          <p style="font-size:12px;color:#9CA3AF;">Use this code to complete your action on Privaro.</p>
        `),
      };
  }
}

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') return new Response('not allowed', { status: 400 });

  try {
    const body = await req.text();
    let parsed: any;

    try {
      parsed = JSON.parse(body);
    } catch (e) {
      console.error('[hook] JSON parse error:', e?.message);
      return new Response(JSON.stringify({ error: { message: 'Invalid JSON payload' } }), {
        status: 401, headers: { 'Content-Type': 'application/json' },
      });
    }

    const user = parsed?.user;
    const email_data = parsed?.email_data;

    if (!user?.email) throw new Error('No recipient email in payload');

    const emailType: string = email_data?.email_action_type || 'confirmation';
    const token: string = email_data?.token || '';
    const tokenHash: string = email_data?.token_hash || '';
    const redirectTo: string = email_data?.redirect_to || '';

    console.log('[hook] emailType:', emailType, '| to:', user.email, '| redirectTo:', redirectTo);

    const { subject, html } = getTemplate(emailType, token, tokenHash, redirectTo);

    const result = await resend.emails.send({
      from: 'Privaro <noreply@privaro.ai>',
      to: [user.email],
      subject,
      html,
    });

    if (result?.error) {
      console.error('[hook] Resend error:', JSON.stringify(result.error));
      return new Response(JSON.stringify({ error: { message: 'Email delivery failed' } }), {
        status: 401, headers: { 'Content-Type': 'application/json' },
      });
    }

    console.log('[hook] email sent OK, id:', result?.data?.id);

    return new Response(JSON.stringify({}), {
      status: 200, headers: { 'Content-Type': 'application/json' },
    });

  } catch (err: any) {
    console.error('[hook] FATAL:', err?.message);
    return new Response(JSON.stringify({ error: { message: 'Internal error' } }), {
      status: 401, headers: { 'Content-Type': 'application/json' },
    });
  }
});
