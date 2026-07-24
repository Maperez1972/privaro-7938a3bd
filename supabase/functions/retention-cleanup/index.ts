import { createClient } from 'jsr:@supabase/supabase-js@2';

/**
 * Retention Cleanup — runs daily at 02:00 UTC
 *
 * Per-org retention policies:
 *   retention_tokens_vault_days   — soft-revoke tokens past TTL
 *   retention_audit_logs_days     — anonymize logs (preserve ibs hashes)
 *   retention_pii_detections_days — hard delete detections
 *   retention_conversations_days  — hard delete messages
 *
 * DPO Reports: independent 7-year retention
 *   - When audit_logs are anonymized, mark reports as logs_anonymized_at
 *   - When retain_until is reached, delete from Storage + DB
 */

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

Deno.serve(async (req: Request) => {
  // Fixed 2026-07-24 — CRITICAL real finding: this destructive,
  // org-wide retention job (revokes tokens, anonymizes audit logs,
  // deletes PII detections/conversation messages/DPO reports across
  // EVERY organization) had zero authentication — verify_jwt was false
  // and there was no secret check at all, meaning anyone who found this
  // URL could trigger irreversible data deletion for every customer, on
  // demand, repeatedly. Only the daily pg_cron job should call this.
  const internalSecret = Deno.env.get('INTERNAL_NOTIFY_SECRET');
  const providedSecret = req.headers.get('X-Internal-Secret');
  if (!internalSecret || providedSecret !== internalSecret) {
    return new Response(JSON.stringify({ error: 'unauthorized' }), {
      status: 401, headers: { 'Content-Type': 'application/json' },
    });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  const now = new Date();
  const today = now.toISOString().split('T')[0];

  const totals = {
    tokens_expired: 0,
    tokens_revoked: 0,
    logs_anonymized: 0,
    messages_deleted: 0,
    detections_deleted: 0,
    reports_flagged: 0,
    reports_deleted: 0,
    orgs_processed: 0,
    errors: [] as string[],
  };

  const { data: orgs } = await supabase
    .from('organizations')
    .select('id, name, gdpr_dpo_email, retention_audit_logs_days, retention_tokens_vault_days, retention_conversations_days, retention_pii_detections_days');

  if (!orgs?.length) {
    return new Response(JSON.stringify({ error: 'No orgs' }), { status: 500 });
  }

  for (const org of orgs) {
    const runResult = {
      tokens_expired: 0, tokens_revoked: 0,
      logs_anonymized: 0, messages_deleted: 0,
    };

    try {
      // ── 1. Tokens Vault: expire tokens with explicit expires_at ───────────
      const { data: expiredTokens } = await supabase
        .from('tokens_vault')
        .select('id')
        .eq('org_id', org.id)
        .eq('is_reversible', true)
        .lt('expires_at', now.toISOString())
        .not('expires_at', 'is', null);

      if (expiredTokens?.length) {
        await supabase.from('tokens_vault')
          .update({ is_reversible: false, encrypted_original: '[EXPIRED — retention policy]' })
          .in('id', expiredTokens.map((t: any) => t.id));
        runResult.tokens_expired = expiredTokens.length;
      }

      // ── 2. Tokens Vault: retention-based revocation ──────────────────
      const tokenCutoff = new Date(now.getTime() - (org.retention_tokens_vault_days ?? 90) * 86400000).toISOString();
      const { data: oldTokens } = await supabase
        .from('tokens_vault')
        .select('id')
        .eq('org_id', org.id)
        .eq('is_reversible', true)
        .is('expires_at', null)
        .lt('created_at', tokenCutoff);

      if (oldTokens?.length) {
        await supabase.from('tokens_vault')
          .update({ is_reversible: false, encrypted_original: '[REVOKED — retention policy]', expires_at: now.toISOString() })
          .in('id', oldTokens.map((t: any) => t.id));
        runResult.tokens_revoked = oldTokens.length;
      }

      // ── 3. Audit Logs: anonymize (preserve ibs hashes) ────────────────
      const logCutoff = new Date(now.getTime() - (org.retention_audit_logs_days ?? 365) * 86400000).toISOString();
      const { data: oldLogs } = await supabase
        .from('audit_logs')
        .select('id')
        .eq('org_id', org.id)
        .is('anonymized_at', null)
        .lt('created_at', logCutoff);

      if (oldLogs?.length) {
        await supabase.from('audit_logs')
          .update({ prompt_hash: '[ANONYMIZED]', metadata: {}, anonymized_at: now.toISOString() })
          .in('id', oldLogs.map((l: any) => l.id));
        runResult.logs_anonymized = oldLogs.length;

        // ── 3b. Flag DPO reports whose logs have been anonymized ─────────
        // Reports generated before logCutoff now contain data that no longer
        // exists in clear in the DB — mark them so DPO is aware
        const { data: affectedReports } = await supabase
          .from('dpo_reports')
          .select('id')
          .eq('org_id', org.id)
          .eq('status', 'ready')
          .is('logs_anonymized_at', null)
          .lt('period_end', logCutoff.split('T')[0]);

        if (affectedReports?.length) {
          await supabase.from('dpo_reports')
            .update({
              logs_anonymized_at: now.toISOString(),
              contains_raw_data: false,
            })
            .in('id', affectedReports.map((r: any) => r.id));
          totals.reports_flagged += affectedReports.length;
          console.log(`[Retention] Flagged ${affectedReports.length} reports as logs_anonymized for org=${org.name}`);
        }
      }

      // ── 4. PII Detections: hard delete ─────────────────────────────
      const detectionCutoff = new Date(now.getTime() - (org.retention_pii_detections_days ?? 365) * 86400000).toISOString();
      const { data: oldDetections } = await supabase
        .from('pii_detections')
        .select('id')
        .eq('org_id', org.id)
        .lt('created_at', detectionCutoff);

      if (oldDetections?.length) {
        await supabase.from('pii_detections').delete()
          .in('id', oldDetections.map((d: any) => d.id));
        totals.detections_deleted += oldDetections.length;
      }

      // ── 5. Conversation Messages: hard delete ──────────────────────
      const convCutoff = new Date(now.getTime() - (org.retention_conversations_days ?? 180) * 86400000).toISOString();
      const { data: oldMessages } = await supabase
        .from('conversation_messages')
        .select('id')
        .eq('org_id', org.id)
        .lt('created_at', convCutoff);

      if (oldMessages?.length) {
        await supabase.from('conversation_messages').delete()
          .in('id', oldMessages.map((m: any) => m.id));
        runResult.messages_deleted = oldMessages.length;
      }

      // ── 6. DPO Reports: delete from Storage when retain_until reached ───
      // 7-year retention — independent of audit_logs anonymization
      const { data: expiredReports } = await supabase
        .from('dpo_reports')
        .select('id, storage_path')
        .eq('org_id', org.id)
        .eq('status', 'ready')
        .lt('retain_until', today);

      for (const report of expiredReports ?? []) {
        if (report.storage_path) {
          await supabase.storage
            .from('dpo-reports')
            .remove([report.storage_path]);
        }
        await supabase.from('dpo_reports')
          .update({ status: 'expired', storage_path: null })
          .eq('id', report.id);
        totals.reports_deleted++;
      }

      // ── 7. Log retention run ────────────────────────────────────
      await supabase.from('retention_runs').insert({
        org_id: org.id,
        run_at: now.toISOString(),
        tokens_expired: runResult.tokens_expired,
        tokens_revoked: runResult.tokens_revoked,
        logs_anonymized: runResult.logs_anonymized,
        messages_deleted: runResult.messages_deleted,
        status: 'completed',
      });

      totals.tokens_expired  += runResult.tokens_expired;
      totals.tokens_revoked  += runResult.tokens_revoked;
      totals.logs_anonymized += runResult.logs_anonymized;
      totals.messages_deleted += runResult.messages_deleted;
      totals.orgs_processed++;

    } catch (err) {
      const msg = `org=${org.id}: ${err}`;
      totals.errors.push(msg);
      console.error('[Retention] Error:', msg);
      await supabase.from('retention_runs').insert({
        org_id: org.id, run_at: now.toISOString(),
        status: 'failed', error_detail: String(err),
      });
    }
  }

  console.log('[Retention] Run complete:', JSON.stringify(totals));
  return new Response(
    JSON.stringify({ ok: true, timestamp: now.toISOString(), ...totals }),
    { headers: { 'Content-Type': 'application/json' } }
  );
});
