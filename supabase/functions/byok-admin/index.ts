import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const PROXY_URL = 'https://api.privaro.ai';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') as string;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string;

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

    // Fixed 2026-07-24 — CRITICAL real finding: this used ONE static
    // global PRIVARO_ADMIN_API_KEY (owned by iCommunity Labs) for EVERY
    // caller, regardless of their real organization. Since the proxy
    // scopes every BYOK endpoint by the org_id resolved FROM that key,
    // any admin/dpo of ANY client or partner org was actually viewing
    // and managing iCommunity Labs' OWN encryption keys — able to view
    // them, register a new one and set it as default, or deactivate the
    // active one. Resolve the caller's REAL org_id and assert it to the
    // proxy via the internal shared-secret mechanism instead.
    const { data: profile } = await supabase
      .from('profiles')
      .select('org_id')
      .eq('id', user.id)
      .single();

    if (!profile?.org_id) {
      return new Response(JSON.stringify({ error: 'org_not_found' }), {
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 3. Verificar rol admin o dpo, escopeado a la organización REAL del caller
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('org_id', profile.org_id)
      .in('role', ['admin', 'dpo'])
      .limit(1)
      .single();

    if (roleError || !roleData) {
      return new Response(JSON.stringify({ error: 'Insufficient permissions. Admin or DPO role required.' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const internalSecret = Deno.env.get('INTERNAL_NOTIFY_SECRET');
    if (!internalSecret) {
      return new Response(JSON.stringify({ error: 'server_misconfigured' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 4. Extraer subpath: /byok-admin/{key_id?} → /v1/admin/keys/{key_id?}
    const url = new URL(req.url);
    const pathMatch = url.pathname.match(/^\/byok-admin\/?(.*)?$/);
    const subPath = pathMatch ? pathMatch[1] : '';
    const proxyPath = subPath ? `/v1/admin/keys/${subPath}` : '/v1/admin/keys';
    const proxyUrl = `${PROXY_URL}${proxyPath}${url.search}`;

    console.log(`[byok-admin] ${req.method} ${proxyUrl} | user: ${user.email} | org: ${profile.org_id} | role: ${roleData.role}`);

    // 5. Reenviar al proxy con el secreto interno, asertando la organización REAL del caller
    const proxyOptions: RequestInit = {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        'X-Internal-Secret': internalSecret,
        'X-Internal-Org-Id': profile.org_id,
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
    return new Response(JSON.stringify({ error: 'internal_error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
