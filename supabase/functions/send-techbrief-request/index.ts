import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { validateDemoRequest, isRateLimited, isEmailRateLimited, getClientIP } from "../_shared/validation.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const clientIP = getClientIP(req);
    if (isRateLimited(`techbrief:${clientIP}`)) {
      return new Response(JSON.stringify({ success: false, error: 'Too many requests.' }), {
        status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const rawBody = await req.json();
    const { data, error: validationError } = validateDemoRequest(rawBody);

    if (validationError) {
      if (validationError === "bot_detected") {
        return new Response(JSON.stringify({ success: true }), {
          status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      return new Response(JSON.stringify({ success: false, error: validationError }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { name, company, industry, role, email, concern } = data!;

    if (isEmailRateLimited(email)) {
      return new Response(JSON.stringify({ success: false, error: 'Too many requests for this email.' }), {
        status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = `Solicitud de Informe Técnico - Privaro\n\nNombre: ${name}\nEmpresa: ${company}\nSector: ${industry}\nCargo: ${role}\nEmail: ${email}\n\nComentarios:\n${concern || 'No especificado'}\n\nEnviado: ${new Date().toISOString()}`;

    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    if (!RESEND_API_KEY) throw new Error('RESEND_API_KEY not configured');

    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'Privaro <hello@icommunity.io>',
        to: ['hello@icommunity.io'],
        subject: 'Solicitud de informe técnico - Privaro',
        text: body,
      }),
    });

    if (!emailResponse.ok) throw new Error('Email delivery failed');

    return new Response(JSON.stringify({ success: true }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ success: false, error: 'Unable to send request.' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});