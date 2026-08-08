import { createClient } from 'jsr:@supabase/supabase-js@2';

/**
 * iBS Sync Cron v7 — Batch certification for audit_logs + agent_runs + resilience
 *
 * Phase 1a — BATCH audit_logs: up to 100 pending → 1 TX
 * Phase 1b — BATCH agent_runs: completed/failed/cancelled pending → 1 TX
 * Phase 1c — ZOMBIE cleanup: running > 2h with 0 steps → cancelled
 * Phase 2  — RETRY: ibs_sync_queue individual retries
 * Phase 3  — SWEEP: orphaned pending logs > 30 min → re-enqueue
 */

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const IBS_API_KEY = Deno.env.get('IBS_API_KEY')!;
const IBS_BASE = 'https://api.icommunitylabs.com/v2';
const IBS_SIGNATURE_ID = 'sig_G5zivdkPD226iTWDCYKBuh';
const BATCH_SIZE = 100;

function ibsHeaders() {
  return { 'Authorization': `Bearer ${IBS_API_KEY}`, 'Content-Type': 'application/json' };
}

function buildHash(payload: object): string {
  const json = JSON.stringify(payload, Object.keys(payload).sort());
  return btoa(json).slice(0, 88);
}

async function postIbsBatch(batchId: string, files: Array<{ name: string; file: string }>): Promise<string | null> {
  try {
    const res = await fetch(`${IBS_BASE}/evidences`, {
      method: 'POST',
      headers: ibsHeaders(),
      body: JSON.stringify({
        payload: { title: `privaro_batch_${batchId}`, files },
        signatures: [{ id: IBS_SIGNATURE_ID }],
      }),
    });
    console.log(`[iBS-Batch] POST /evidences status: ${res.status}`);
    if (!res.ok) { console.error(`[iBS-Batch] Error: ${await res.text()}`); return null; }
    const data = await res.json();
    const evidenceId = data?.id ?? data?.evidence_id ?? data?._id ?? null;
    console.log(`[iBS-Batch] Evidence created: ${evidenceId}`);
    return evidenceId;
  } catch (e) { console.error(`[iBS-Batch] Exception: ${e}`); return null; }
}

async function getIbsEvidence(evidenceId: string) {
  try {
    const res = await fetch(`${IBS_BASE}/evidences/${evidenceId}`, { headers: ibsHeaders() });
    return res.ok ? await res.json() : null;
  } catch { return null; }
}

async function postIbsEvidenceSingle(title: string, payloadHash: string): Promise<string | null> {
  try {
    const res = await fetch(`${IBS_BASE}/evidences`, {
      method: 'POST',
      headers: ibsHeaders(),
      body: JSON.stringify({
        payload: { title, files: [{ name: 'pii_audit_retry.json', file: payloadHash }] },
        signatures: [{ id: IBS_SIGNATURE_ID }],
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.id ?? data?.evidence_id ?? null;
  } catch { return null; }
}

Deno.serve(async (req: Request) => {
  // Fixed 2026-08-08 during app-wide functional audit — same finding
  // class already fixed in retention-cleanup on 2026-07-24: this
  // endpoint had zero authentication, so anyone who found the URL could
  // trigger it repeatedly, running up real costs against the paid iBS
  // blockchain evidence API on demand. Not destructive to customer data
  // like retention-cleanup was, but a real "denial of wallet" surface.
  // Only the pg_cron job (every 5 minutes) should call this.
  const internalSecret = Deno.env.get('INTERNAL_NOTIFY_SECRET');
  const providedSecret = req.headers.get('X-Internal-Secret');
  if (!internalSecret || providedSecret !== internalSecret) {
    return new Response(JSON.stringify({ error: 'unauthorized' }), {
      status: 401, headers: { 'Content-Type': 'application/json' },
    });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  const now = new Date();
  const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000).toISOString();
  const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000).toISOString();
  const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString();
  const batchRunId = crypto.randomUUID().slice(0, 8);

  const results = {
    audit_logs_certified: 0,
    agent_runs_certified: 0,
    zombies_cancelled: 0,
    batch_tx_count: 0,
    retry_certified: 0,
    retry_retried: 0,
    retry_exhausted: 0,
    requeued: 0,
    errors: [] as string[],
  };

  // ── Phase 1c: ZOMBIE cleanup ──────────────────────────────────────────────
  // Cancel running agent_runs with 0 steps open for > 2 hours
  const { count: zombieCount } = await supabase
    .from('agent_runs')
    .update({ status: 'cancelled', ended_at: now.toISOString(), ibs_status: 'certified' })
    .eq('status', 'running')
    .eq('step_count', 0)
    .lt('started_at', twoHoursAgo);
  results.zombies_cancelled = zombieCount ?? 0;

  // ── Phase 1a: BATCH audit_logs ────────────────────────────────────────────
  const { data: pendingLogs } = await supabase
    .from('audit_logs')
    .select('id, org_id, metadata, prompt_hash')
    .eq('ibs_status', 'pending')
    .is('ibs_batch_id', null)
    .order('created_at', { ascending: true })
    .limit(BATCH_SIZE);

  if (pendingLogs && pendingLogs.length > 0) {
    const files = pendingLogs.map(log => ({
      name: `audit_${log.id.slice(0, 16)}.json`,
      file: buildHash({ audit_log_id: log.id, org_id: log.org_id, prompt_hash: log.prompt_hash ?? '', source: 'privaro-proxy' }),
    }));

    const evidenceId = await postIbsBatch(`al_${batchRunId}`, files);

    if (evidenceId) {
      results.batch_tx_count++;
      results.audit_logs_certified = pendingLogs.length;

      await supabase.from('ibs_batches').insert({
        org_id: pendingLogs[0].org_id,
        evidence_id: evidenceId,
        batch_size: pendingLogs.length,
        status: 'pending',
      });

      await supabase
        .from('audit_logs')
        .update({ ibs_status: 'certified', ibs_evidence_id: evidenceId, ibs_batch_id: evidenceId, ibs_certified_at: now.toISOString() })
        .in('id', pendingLogs.map(l => l.id));

      console.log(`[iBS-Batch] ✅ audit_logs: ${pendingLogs.length} → 1 TX (${evidenceId})`);
    } else {
      console.error(`[iBS-Batch] ❌ audit_logs batch failed — enqueuing individually`);
      for (const log of pendingLogs) {
        await supabase.from('ibs_sync_queue').upsert({
          audit_log_id: log.id, org_id: log.org_id,
          ibs_payload_hash: buildHash({ audit_log_id: log.id, org_id: log.org_id }),
          status: 'waiting', retry_count: 0, max_retries: 3,
        }, { onConflict: 'audit_log_id' });
      }
    }
  }

  // ── Phase 1b: BATCH agent_runs ────────────────────────────────────────────
  // Certify completed/failed/cancelled runs that are still pending
  const { data: pendingRuns } = await supabase
    .from('agent_runs')
    .select('id, org_id, pipeline_id, total_pii_detected, max_risk_score')
    .eq('ibs_status', 'pending')
    .in('status', ['completed', 'failed', 'cancelled'])
    .order('started_at', { ascending: true })
    .limit(BATCH_SIZE);

  if (pendingRuns && pendingRuns.length > 0) {
    const files = pendingRuns.map(run => ({
      name: `agent_run_${run.id.slice(0, 16)}.json`,
      file: buildHash({ agent_run_id: run.id, org_id: run.org_id, pii_detected: run.total_pii_detected, source: 'privaro-agent' }),
    }));

    const evidenceId = await postIbsBatch(`ar_${batchRunId}`, files);

    if (evidenceId) {
      results.batch_tx_count++;
      results.agent_runs_certified = pendingRuns.length;

      await supabase
        .from('agent_runs')
        .update({ ibs_status: 'certified', ibs_evidence_id: evidenceId })
        .in('id', pendingRuns.map(r => r.id));

      console.log(`[iBS-Batch] ✅ agent_runs: ${pendingRuns.length} → 1 TX (${evidenceId})`);
    } else {
      console.error(`[iBS-Batch] ❌ agent_runs batch failed`);
    }
  }

  // ── Phase 2: RETRY individual queue entries ───────────────────────────────
  const { data: queueEntries } = await supabase
    .from('ibs_sync_queue')
    .select('*')
    .in('status', ['waiting', 'retrying'])
    .lt('ibs_request_sent_at', tenMinutesAgo);

  for (const entry of queueEntries ?? []) {
    try {
      if (entry.ibs_evidence_id) {
        const evidence = await getIbsEvidence(entry.ibs_evidence_id);
        const hash = evidence?.certification?.hash;
        if (hash) {
          await supabase.from('audit_logs').update({
            ibs_status: 'certified', ibs_evidence_id: entry.ibs_evidence_id,
            ibs_certification_hash: hash,
            ibs_network: evidence?.certification?.network ?? 'fantom_opera_mainnet',
            ibs_certified_at: evidence?.certification?.timestamp ?? now.toISOString(),
          }).eq('id', entry.audit_log_id);
          await supabase.from('ibs_sync_queue').delete().eq('id', entry.id);
          results.retry_certified++;
          continue;
        }
      }
      if (entry.retry_count >= entry.max_retries) {
        await supabase.from('ibs_sync_queue').update({ status: 'exhausted', error_detail: 'Max retries reached' }).eq('id', entry.id);
        await supabase.from('audit_logs').update({ ibs_status: 'failed' }).eq('id', entry.audit_log_id);
        results.retry_exhausted++;
        continue;
      }
      const newEvidenceId = await postIbsEvidenceSingle(
        `privaro_${entry.audit_log_id.substring(0, 16)}_r${entry.retry_count + 1}`,
        entry.ibs_payload_hash,
      );
      await supabase.from('ibs_sync_queue').update({
        status: 'retrying', retry_count: entry.retry_count + 1,
        last_retry_at: now.toISOString(),
        ibs_evidence_id: newEvidenceId ?? entry.ibs_evidence_id,
        ibs_request_sent_at: now.toISOString(),
      }).eq('id', entry.id);
      results.retry_retried++;
    } catch (err) {
      results.errors.push(`${entry.audit_log_id}: ${err}`);
    }
  }

  // ── Phase 3: SWEEP orphaned pending logs > 30 min ────────────────────────
  const { data: orphanedLogs } = await supabase
    .from('audit_logs')
    .select('id, org_id')
    .eq('ibs_status', 'pending')
    .is('ibs_batch_id', null)
    .lt('created_at', thirtyMinutesAgo);

  for (const log of orphanedLogs ?? []) {
    const { data: existing } = await supabase.from('ibs_sync_queue').select('id').eq('audit_log_id', log.id).maybeSingle();
    if (!existing) {
      await supabase.from('ibs_sync_queue').insert({
        audit_log_id: log.id, org_id: log.org_id,
        ibs_payload_hash: buildHash({ audit_log_id: log.id }),
        status: 'waiting', retry_count: 0, max_retries: 3,
      });
      results.requeued++;
    }
  }

  console.log('[iBS-Cron] Run complete:', JSON.stringify(results));
  return new Response(
    JSON.stringify({ ok: true, timestamp: now.toISOString(), batch_run_id: batchRunId, ...results }),
    { headers: { 'Content-Type': 'application/json' } },
  );
});
