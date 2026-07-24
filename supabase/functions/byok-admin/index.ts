import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// FOUND STALE 2026-07-23 during full audit — same as protect-document,
// still points at the old Railway auto-generated domain, never updated
// when api.privaro.ai was set up. Works today because the Railway URL
// still resolves in parallel, but should be updated for consistency.
const PROXY_URL = 'https://privaro-proxy-production.up.railway.app';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') as string;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string;
const ADMIN_API_KEY = Deno.env.get('PRIVARO_ADMIN_API_KEY') as string;

if (!ADMIN_API_KEY) throw new Error('PRIVARO_ADMIN_API_KEY is not set');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 1. Extraer y validar el JWT manualmente (gateway verify_jwt=false)
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const token = authHeader.replace('Bearer ', '');

    // 2. Verificar el token contra Supabase Auth usando service role
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid or expired token' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 3. Verificar rol admin o dpo en user_roles
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .in('role', ['admin', 'dpo'])
      .limit(1)
      .single();

    if (roleError || !roleData) {
      return new Response(JSON.stringify({ error: 'Insufficient permissions. Admin or DPO role required.' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 4. Extraer subpath: /byok-admin/{key_id?} → /v1/admin/keys/{key_id?}
    const url = new URL(req.url);
    const pathMatch = url.pathname.match(/^\/byok-admin\/?(.*)?$/);
    const subPath = pathMatch ? pathMatch[1] : '';
    const proxyPath = subPath ? `/v1/admin/keys/${subPath}` : '/v1/admin/keys';
    const proxyUrl = `${PROXY_URL}${proxyPath}${url.search}`;

    console.log(`[byok-admin] ${req.method} ${proxyUrl} | user: ${user.email} | role: ${roleData.role}`);

    // 5. Reenviar al proxy Railway con la admin API key
    const proxyOptions: RequestInit = {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        'X-Privaro-Key': ADMIN_API_KEY,
      },
    };

    if (req.method !== 'GET' && req.method !== 'DELETE') {
      proxyOptions.body = await req.text();
    }

    const proxyResponse = await fetch(proxyUrl, proxyOptions);
    const responseBody = await proxyResponse.text();

    console.log(`[byok-admin] proxy status: ${proxyResponse.status}`);

    return new Response(responseBody, {
      status: proxyResponse.status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err: any) {
    console.error('[byok-admin] ERROR:', err?.message);
    return new Response(JSON.stringify({ error: err?.message || 'Internal error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
