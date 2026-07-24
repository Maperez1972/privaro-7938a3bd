import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') as string;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
      status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

    const token = authHeader.replace('Bearer ', '');
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // 1. Verify JWT
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    console.log('[enforce-mfa] user:', user.email);

    // 2. Get role
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })
      .limit(1)
      .single();
    const userRole = roleData?.role || 'viewer';

    // 3. Check MFA policy
    const { data: policyData } = await supabase
      .from('mfa_policies')
      .select('mfa_required')
      .eq('role', userRole)
      .single();
    const mfaRequired = policyData?.mfa_required ?? false;

    if (!mfaRequired) {
      return new Response(JSON.stringify({
        mfa_required: false, mfa_enrolled: false, mfa_verified: false,
        role: userRole, factor_id: null,
      }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // 4. Read MFA factors DIRECTLY from auth.mfa_factors via SQL
    // This bypasses the broken listFactors() SDK method in Deno
    const { data: factors, error: factorsError } = await supabase
      .rpc('get_user_mfa_factors', { p_user_id: user.id });

    console.log('[enforce-mfa] factors:', JSON.stringify(factors), factorsError?.message);

    const verifiedFactor = (factors || []).find((f: any) => f.status === 'verified' && f.factor_type === 'totp');
    const mfaEnrolled = !!verifiedFactor;
    const factorId = verifiedFactor?.id || null;

    // 5. Check AAL2 from JWT
    let mfaVerified = false;
    try {
      const parts = token.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
        mfaVerified = payload?.aal === 'aal2';
        console.log('[enforce-mfa] aal:', payload?.aal);
      }
    } catch (_) {}

    console.log(`[enforce-mfa] enrolled=${mfaEnrolled} verified=${mfaVerified} factorId=${factorId}`);

    return new Response(JSON.stringify({
      mfa_required: mfaRequired,
      mfa_enrolled: mfaEnrolled,
      mfa_verified: mfaVerified,
      role: userRole,
      factor_id: factorId,
    }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (err: any) {
    console.error('[enforce-mfa] FATAL:', err?.message);
    return new Response(JSON.stringify({ error: err?.message || 'Internal error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
