import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { token_id, password } = await req.json();
    if (!token_id || !password) {
      return new Response(JSON.stringify({ error: "token_id and password required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Missing authorization header" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const jwt = authHeader.replace("Bearer ", "");
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    // Validate user with getUser (works with ES256 tokens)
    const { data: { user }, error: authError } = await supabase.auth.getUser(jwt);
    if (authError || !user) {
      console.error("Auth error:", authError);
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify password
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password,
    });
    if (signInError) {
      return new Response(JSON.stringify({ error: "Invalid password" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check role with admin client
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: roleData } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (!roleData || !["admin", "dpo"].includes(roleData.role)) {
      return new Response(JSON.stringify({ error: "Insufficient permissions" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get token from vault
    const { data: vaultToken, error: tokenError } = await supabaseAdmin
      .from("tokens_vault")
      .select("encrypted_original, org_id, entity_type, token_value, is_reversible, reversal_count")
      .eq("id", token_id)
      .single();

    if (tokenError || !vaultToken) {
      return new Response(JSON.stringify({ error: "Token not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!vaultToken.is_reversible) {
      return new Response(JSON.stringify({ error: "Token is not reversible" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Decrypt
    const ENCRYPTION_KEY = Deno.env.get("ENCRYPTION_KEY") || "";
    const keyBytes = hexToBytes(ENCRYPTION_KEY);
    const encryptedBytes = base64ToBytes(vaultToken.encrypted_original);

    const nonce = encryptedBytes.slice(0, 12);
    const ciphertext = encryptedBytes.slice(12);

    const cryptoKey = await crypto.subtle.importKey(
      "raw", keyBytes, { name: "AES-GCM" }, false, ["decrypt"]
    );

    const decryptedBytes = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: nonce }, cryptoKey, ciphertext
    );

    const value = new TextDecoder().decode(decryptedBytes);

    // Update reversal count
    await supabaseAdmin
      .from("tokens_vault")
      .update({
        reversal_count: (vaultToken.reversal_count || 0) + 1,
        last_reversed_by: user.id,
        last_reversed_at: new Date().toISOString(),
      })
      .eq("id", token_id);

    // Log access
    await supabaseAdmin
      .from("vault_access_log")
      .insert({
        org_id: vaultToken.org_id,
        token_id,
        user_id: user.id,
        action: "reveal",
        ip_address: req.headers.get("x-forwarded-for") || "unknown",
      });

    return new Response(JSON.stringify({ value, entity_type: vaultToken.entity_type }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("reveal-token error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  }
  return bytes;
}

function base64ToBytes(b64: string): Uint8Array {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}
