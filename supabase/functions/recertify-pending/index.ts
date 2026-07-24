import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const IBS_BASE = "https://api.icommunitylabs.com/v2";
const IBS_SIGNATURE_ID = "sig_G5zivdkPD226iTWDCYKBuh";

async function buildHash(payload: object): Promise<string> {
  const json = JSON.stringify(payload, Object.keys(payload as Record<string,unknown>).sort());
  const buf = await crypto.subtle.digest("SHA-512", new TextEncoder().encode(json));
  return btoa(String.fromCharCode(...new Uint8Array(buf)));
}

async function postEvidence(title: string, hash: string, fileName: string, apiKey: string): Promise<string | null> {
  const body = JSON.stringify({
    payload: { title, files: [{ name: fileName, file: hash }] },
    signatures: [{ id: IBS_SIGNATURE_ID }],
  });
  const r = await fetch(`${IBS_BASE}/evidences`, {
    method: "POST",
    headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body,
  });
  const data = await r.json();
  if (r.ok) return data.id || null;
  console.error("[iBS] error:", r.status, JSON.stringify(data));
  return null;
}

serve(async (req) => {
  // Simple auth — only allow with admin secret
  const authHeader = req.headers.get("Authorization") || "";
  const ADMIN_SECRET = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  if (!authHeader.includes(ADMIN_SECRET.slice(-20))) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const IBS_API_KEY = Deno.env.get("IBS_API_KEY") || "";
  if (!IBS_API_KEY) {
    return new Response(JSON.stringify({ error: "IBS_API_KEY not set" }), { status: 500 });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // Get all pending audit_logs
  const { data: pending, error } = await supabase
    .from("audit_logs")
    .select("id, org_id, entity_type, metadata")
    .eq("ibs_status", "pending")
    .order("created_at", { ascending: true });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  console.log(`[recertify] Found ${pending?.length || 0} pending audit logs`);

  const results = { certified: 0, failed: 0, total: pending?.length || 0 };

  for (const log of (pending || [])) {
    try {
      const metadata = log.metadata || {};
      const payload = {
        audit_log_id: log.id,
        org_id: log.org_id,
        source: "privaro-proxy",
        ...metadata,
      };
      const hash = await buildHash(payload);
      const title = `privaro_${log.id.slice(0, 16)}`;
      const entityTypes = Object.keys(metadata.by_type || {}).slice(0, 2).join("_") || log.entity_type || "pii";
      const fileName = `pii_audit_${entityTypes}.json`;

      const evidenceId = await postEvidence(title, hash, fileName, IBS_API_KEY);

      if (evidenceId) {
        // Insert into ibs_sync_queue so webhook can update it
        await supabase.from("ibs_sync_queue").upsert({
          audit_log_id: log.id,
          org_id: log.org_id,
          ibs_payload_hash: hash,
          ibs_evidence_id: evidenceId,
          status: "waiting",
        }, { onConflict: "audit_log_id" });

        console.log(`[recertify] ✅ ${log.id} → ${evidenceId}`);
        results.certified++;
      } else {
        results.failed++;
      }

      // Small delay to avoid rate limiting
      await new Promise(r => setTimeout(r, 300));
    } catch (e) {
      console.error(`[recertify] ❌ ${log.id}:`, e);
      results.failed++;
    }
  }

  console.log(`[recertify] Done: ${results.certified} certified, ${results.failed} failed`);
  return new Response(JSON.stringify(results), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
