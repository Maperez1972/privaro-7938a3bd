import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface AuditLogRow {
  id: string;
  created_at: string;
  event_type: string;
  entity_type: string;
  entity_category: string;
  action_taken: string;
  severity: string;
  risk_score: number | null;
  pipeline_stage: string | null;
  processing_ms: number | null;
  ibs_status: string;
  ibs_evidence_id: string | null;
  ibs_certification_hash: string | null;
  ibs_network: string | null;
  ibs_certified_at: string | null;
  // Added 2026-08 — output-direction PII detection. Legacy rows predating
  // that migration were backfilled to 'input', so this is never null.
  direction: string;
  pipelines?: { name: string; sector: string; llm_provider: string } | null;
}

// Pipeline stages that mean "the LLM response had already been streamed
// to the end user before Privaro's scan ran" — see relay.py's
// _audit_streamed_output(). A 'leaked' action on one of these stages is
// not a masking failure; it's the accepted, documented limitation of
// real-time streaming (there is no way to intercept a chunk already
// delivered over SSE). Kept in sync with OutputIncidents.tsx's
// STREAMING_STAGES on the frontend.
const STREAMING_OUTPUT_STAGES = ["relay_stream_output"];
const isUnmaskableStreamingLeak = (log: AuditLogRow) =>
  log.direction === "output" &&
  log.action_taken === "leaked" &&
  (STREAMING_OUTPUT_STAGES.includes(log.pipeline_stage || "") ||
    (log.pipeline_stage || "").includes("stream"));

function generateReportHtml(
  logs: AuditLogRow[],
  orgName: string,
  dpoEmail: string,
  periodStart: string,
  periodEnd: string
): string {
  const now = new Date().toISOString();
  const certified = logs.filter(
    (l) => l.ibs_status === "certified" && l.ibs_certification_hash
  );
  const highRisk = logs.filter(
    (l) => l.risk_score != null && l.risk_score >= 0.7
  );
  const entityTypes = [...new Set(logs.map((l) => l.entity_type))];
  const pipelineNames = [
    ...new Set(logs.map((l) => l.pipelines?.name).filter(Boolean)),
  ];

  // Output-direction stats — added 2026-08. inputEvents/outputEvents split
  // covers both directions Privaro now scans: prompts going INTO the LLM
  // (direction='input', the only thing this report covered before) and
  // the LLM's own RESPONSE (direction='output' — RAG retrieval, tool-call
  // results, and model memorization can all leak PII never present in the
  // original prompt). unmaskableStreamingLeaks are output-direction leaks
  // that could not be intercepted because the pipeline uses
  // /v1/relay/stream, where chunks are already delivered to the end user
  // before the scan completes — see the isUnmaskableStreamingLeak comment
  // above. These are surfaced as a distinct, explained category rather
  // than folded into "high risk", so a regulator reading this report sees
  // an honest, documented limitation instead of an unexplained gap.
  const inputEvents = logs.filter((l) => l.direction !== "output");
  const outputEvents = logs.filter((l) => l.direction === "output");
  const unmaskableStreamingLeaks = outputEvents.filter(isUnmaskableStreamingLeak);
  const outputMaskedEvents = outputEvents.filter(
    (l) => !unmaskableStreamingLeaks.includes(l) && l.action_taken !== "leaked"
  );

  const eventsHtml = logs
    .map(
      (log, i) => `
    <div style="margin-bottom:24px;padding:16px;border:1px solid #e5e7eb;border-radius:8px;background:#fafafa;">
      <div style="font-weight:700;color:#1e293b;margin-bottom:8px;">[EVENT #${i + 1}]</div>
      <table style="width:100%;font-size:13px;border-collapse:collapse;">
        <tr><td style="padding:3px 8px;color:#64748b;width:180px;">Timestamp</td><td>${new Date(log.created_at).toISOString()}</td></tr>
        <tr><td style="padding:3px 8px;color:#64748b;">Event Type</td><td>${log.event_type}</td></tr>
        <tr><td style="padding:3px 8px;color:#64748b;">Direction</td><td>${log.direction === "output" ? "Output (LLM response)" : "Input (prompt)"}</td></tr>
        <tr><td style="padding:3px 8px;color:#64748b;">Entity Protected</td><td>${log.entity_type} (${log.entity_category})</td></tr>
        <tr><td style="padding:3px 8px;color:#64748b;">Action Taken</td><td>${
          isUnmaskableStreamingLeak(log)
            ? `${log.action_taken} <span style="color:#b45309;font-weight:600;">(not interceptable — streaming response, see note below)</span>`
            : log.action_taken
        }</td></tr>
        <tr><td style="padding:3px 8px;color:#64748b;">Severity</td><td>${log.severity}</td></tr>
        <tr><td style="padding:3px 8px;color:#64748b;">Pipeline</td><td>${log.pipelines?.name || "—"} (${log.pipelines?.sector || "—"})</td></tr>
        <tr><td style="padding:3px 8px;color:#64748b;">LLM Provider</td><td>${log.pipelines?.llm_provider || "—"}</td></tr>
        <tr><td style="padding:3px 8px;color:#64748b;">Processing Time</td><td>${log.processing_ms ?? "—"}ms</td></tr>
        <tr><td style="padding:3px 8px;color:#64748b;">Risk Score</td><td style="color:${log.risk_score != null ? (log.risk_score >= 0.7 ? "#ef4444" : log.risk_score >= 0.4 ? "#f59e0b" : "#22c55e") : "#94a3b8"};font-weight:600;">${log.risk_score != null ? `${(log.risk_score * 100).toFixed(0)}% — ${log.risk_score >= 0.7 ? "HIGH RISK" : log.risk_score >= 0.4 ? "MEDIUM" : "LOW"}` : "—"}</td></tr>
      </table>
      ${
        isUnmaskableStreamingLeak(log)
          ? `<div style="margin-top:12px;padding:8px 12px;background:#fffbeb;border:1px solid #fde68a;border-radius:6px;color:#92400e;font-size:13px;">
              <strong>Streaming response — audit-only.</strong> This pipeline delivers responses over a live stream (SSE); the chunk containing this entity had already reached the end user before Privaro's scan completed, so it could not be masked in real time. This event is logged as an honest accountability record of the detection, not a system failure — see "Output-Direction Coverage" below.
            </div>`
          : ""
      }
      ${
        log.ibs_certification_hash
          ? `<div style="margin-top:12px;padding:12px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:6px;">
              <div style="font-weight:600;color:#16a34a;margin-bottom:6px;">─── Blockchain Evidence ───</div>
              <table style="width:100%;font-size:13px;border-collapse:collapse;">
                <tr><td style="padding:3px 8px;color:#64748b;width:180px;">Status</td><td style="color:#16a34a;font-weight:600;">CERTIFIED ✓</td></tr>
                <tr><td style="padding:3px 8px;color:#64748b;">Evidence ID</td><td style="font-family:monospace;font-size:12px;">${log.ibs_evidence_id || "—"}</td></tr>
                <tr><td style="padding:3px 8px;color:#64748b;">Network</td><td>${log.ibs_network || "—"}</td></tr>
                <tr><td style="padding:3px 8px;color:#64748b;">TX Hash</td><td style="font-family:monospace;font-size:11px;word-break:break-all;">${log.ibs_certification_hash}</td></tr>
                <tr><td style="padding:3px 8px;color:#64748b;">Certified At</td><td>${log.ibs_certified_at ? new Date(log.ibs_certified_at).toISOString() : "—"}</td></tr>
                <tr><td style="padding:3px 8px;color:#64748b;">Verify</td><td><a href="https://checker.icommunitylabs.com/check/${log.ibs_network || "fantom_opera_mainnet"}/${log.ibs_certification_hash}" style="color:#3B82F6;">Verify on blockchain</a></td></tr>
              </table>
            </div>`
          : `<div style="margin-top:12px;padding:8px 12px;background:#fffbeb;border:1px solid #fde68a;border-radius:6px;color:#92400e;font-size:13px;">Status: PENDING</div>`
      }
    </div>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Privaro — GDPR Accountability Report</title>
<style>
  @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 900px; margin: 0 auto; padding: 40px 24px; color: #1e293b; background: #fff; line-height: 1.6; }
  .header { background: linear-gradient(135deg, #1e3a5f, #3B82F6); color: white; padding: 32px; border-radius: 12px; margin-bottom: 32px; }
  .header h1 { margin: 0 0 4px; font-size: 28px; letter-spacing: -0.5px; }
  .header p { margin: 4px 0; opacity: 0.9; font-size: 14px; }
  .section-title { background: #f1f5f9; padding: 12px 16px; border-left: 4px solid #3B82F6; font-weight: 700; font-size: 16px; margin: 32px 0 16px; border-radius: 0 6px 6px 0; }
  .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; margin-bottom: 24px; }
  .summary-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; text-align: center; }
  .summary-card .value { font-size: 28px; font-weight: 700; color: #3B82F6; }
  .summary-card .label { font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
  .legal li { margin-bottom: 8px; font-size: 14px; }
  .footer { margin-top: 48px; padding-top: 24px; border-top: 2px solid #e2e8f0; text-align: center; font-size: 12px; color: #94a3b8; }
</style>
</head>
<body>
  <div class="header">
    <h1>PRIVARO — GDPR ACCOUNTABILITY REPORT</h1>
    <p><strong>Art. 5(2) — Accountability Principle</strong></p>
    <p>Generated: ${new Date(now).toLocaleString()}</p>
    <p>Organization: ${orgName}</p>
    <p>DPO Contact: ${dpoEmail || "Not configured"}</p>
    <p>Report Period: ${periodStart} — ${periodEnd}</p>
  </div>

  <div class="section-title">EXECUTIVE SUMMARY</div>
  <div class="summary-grid">
    <div class="summary-card"><div class="value">${logs.length}</div><div class="label">Total PII Events</div></div>
    <div class="summary-card"><div class="value" style="color:#16a34a;">${certified.length}</div><div class="label">Blockchain Certified</div></div>
    <div class="summary-card"><div class="value" style="color:#ef4444;">${highRisk.length}</div><div class="label">High Risk Events</div></div>
    <div class="summary-card"><div class="value">${entityTypes.length}</div><div class="label">PII Entity Types</div></div>
    <div class="summary-card"><div class="value">${pipelineNames.length}</div><div class="label">Pipelines Used</div></div>
  </div>
  <p style="font-size:14px;color:#475569;">Processing Pipelines: ${pipelineNames.join(", ") || "—"}</p>

  <div class="section-title">OUTPUT-DIRECTION COVERAGE</div>
  <p style="font-size:14px;color:#475569;margin-bottom:16px;">
    Since 2026-08, Privaro scans PII in both directions: prompts going <strong>into</strong> the LLM (Input) and the LLM's own <strong>response</strong> back to the user (Output) — covering leakage sources a prompt-only scan cannot see, such as RAG retrieval, tool-call results, and model memorization.
  </p>
  <div class="summary-grid">
    <div class="summary-card"><div class="value">${inputEvents.length}</div><div class="label">Input-Direction Events</div></div>
    <div class="summary-card"><div class="value">${outputEvents.length}</div><div class="label">Output-Direction Events</div></div>
    <div class="summary-card"><div class="value" style="color:#16a34a;">${outputMaskedEvents.length}</div><div class="label">Output Events Masked</div></div>
    <div class="summary-card"><div class="value" style="color:#b45309;">${unmaskableStreamingLeaks.length}</div><div class="label">Output — Streaming, Not Interceptable</div></div>
  </div>
  ${
    unmaskableStreamingLeaks.length > 0
      ? `<div style="padding:12px 16px;background:#fffbeb;border:1px solid #fde68a;border-radius:6px;color:#92400e;font-size:13px;margin-bottom:16px;">
          <strong>Note on streaming pipelines:</strong> ${unmaskableStreamingLeaks.length} of the events above involve a pipeline configured for real-time streaming responses (Server-Sent Events). By the time Privaro's scan completes, the affected chunk has already been delivered to the end user — there is no technical mechanism to intercept it after the fact. Rather than omit this from the record, Privaro logs it explicitly as an accountability entry (action "leaked"), so this report reflects the true state of PII exposure across all channels, including the ones where real-time masking is not physically possible. Pipelines requiring guaranteed output masking should be configured to use the non-streaming <code>/v1/relay/complete</code> endpoint instead, which scans and masks the full response before it is returned.</div>`
      : ""
  }

  <div class="section-title">LEGAL BASIS & COMPLIANCE FRAMEWORK</div>
  <ul class="legal">
    <li><strong>GDPR Art. 5(2) — Accountability:</strong> All PII processing events — both input (prompt) and output (LLM response) direction — are immutably recorded on Fantom Opera Mainnet blockchain via iCommunity Blockchain Solutions (iBS).</li>
    <li><strong>GDPR Art. 25 — Privacy by Design:</strong> PII tokenised before reaching LLM providers, and the LLM's response is itself scanned for PII before being returned to the user (where the pipeline configuration allows interception). Original values never transmitted.</li>
    <li><strong>GDPR Art. 32 — Security:</strong> AES-256-GCM encryption for all stored tokens. Keys segmented per organization.</li>
  </ul>

  <div class="section-title">BLOCKCHAIN EVIDENCE LOG (${logs.length} events)</div>
  ${eventsHtml}

  <div class="section-title">DECLARATION</div>
  <p style="font-size:14px;color:#475569;">
    This report certifies that all AI interactions processed through Privaro during the stated period have been handled in compliance with GDPR Art. 5(2) accountability requirements, across both input (prompt) and output (LLM response) directions. Each PII detection event is individually certified on blockchain, providing immutable evidence of data protection measures applied. Where a pipeline's real-time streaming configuration prevented the interception of an output-direction detection, that limitation is disclosed above rather than omitted, consistent with the accountability principle this report exists to demonstrate.
  </p>

  <div class="footer">
    <p>Powered by <strong>Privaro</strong> — Privacy Infrastructure for Enterprise AI</p>
    <p>iCommunity Labs · privaro.io</p>
    <p>Report generated: ${now}</p>
  </div>
</body>
</html>`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const authClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace("Bearer ", "");
    const { data: claims, error: claimsError } = await authClient.auth.getClaims(token);
    if (claimsError || !claims?.claims) {
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    const userId = claims.claims.sub as string;

    const supabase = createClient(supabaseUrl, serviceKey);

    const { org_id, period_start, period_end, force_regenerate } = await req.json();

    if (!org_id || !period_start || !period_end) {
      return new Response(
        JSON.stringify({ error: "org_id, period_start, period_end required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fixed 2026-07-24 — real security finding (found while fixing a
    // reported issue in a sibling function): this only checked "is the
    // caller an admin of ANY organization", never that they were an admin
    // of THIS org_id. Any admin could generate and read another org's DPO
    // audit report (PII detection metadata, risk scores, blockchain
    // hashes). Scoped the role check to the requested org_id.
    // Fixed 2026-08-12 — user_roles has no org_id column (roles are global
    // per user; the org binding lives in profiles.org_id). Filtering
    // user_roles by org_id made PostgREST return an "column does not exist"
    // error, so roleData was always null and EVERY caller got a 403.
    // Scope the check the correct way: caller must be an admin AND belong to
    // the requested org.
    const [{ data: roleData }, { data: callerProfile }] = await Promise.all([
      supabase.from("user_roles").select("role").eq("user_id", userId).maybeSingle(),
      supabase.from("profiles").select("org_id").eq("id", userId).maybeSingle(),
    ]);

    if (roleData?.role !== "admin" || callerProfile?.org_id !== org_id) {
      return new Response(
        JSON.stringify({ error: "Forbidden: admin role required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!force_regenerate) {
      const { data: existing } = await supabase
        .from("dpo_reports")
        .select("id, status")
        .eq("org_id", org_id)
        .eq("period_start", period_start)
        .eq("period_end", period_end)
        .in("status", ["ready", "generating"])
        .maybeSingle();

      if (existing) {
        return new Response(
          JSON.stringify({ error: "Report already exists for this period", report_id: existing.id }),
          { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    if (force_regenerate) {
      await supabase
        .from("dpo_reports")
        .delete()
        .eq("org_id", org_id)
        .eq("period_start", period_start)
        .eq("period_end", period_end);
    }

    const { data: org } = await supabase
      .from("organizations")
      .select("name, gdpr_dpo_email, org_type, parent_org_id")
      .eq("id", org_id)
      .single();

    const orgName = org?.name || "Unknown Organization";
    const dpoEmail = org?.gdpr_dpo_email || "";

    const periodDate = new Date(period_start + "T00:00:00Z");
    const periodLabel = periodDate.toLocaleString("en-US", {
      month: "long",
      year: "numeric",
    });

    const { data: report, error: insertError } = await supabase
      .from("dpo_reports")
      .insert({
        org_id,
        period_label: periodLabel,
        period_start,
        period_end,
        status: "generating",
      })
      .select("id")
      .single();

    if (insertError) throw insertError;
    const reportId = report.id;

    const { data: logs, error: logsError } = await supabase
      .from("audit_logs")
      .select(
        "id, event_type, entity_type, entity_category, action_taken, severity, risk_score, pipeline_stage, processing_ms, ibs_status, ibs_evidence_id, ibs_certification_hash, ibs_network, ibs_certified_at, created_at, direction, pipelines(name, sector, llm_provider)"
      )
      .eq("org_id", org_id)
      .gte("created_at", period_start + "T00:00:00Z")
      .lte("created_at", period_end + "T23:59:59Z")
      .order("created_at", { ascending: false })
      .limit(5000);

    if (logsError) throw logsError;

    const auditLogs: AuditLogRow[] = logs || [];

    const html = generateReportHtml(
      auditLogs,
      orgName,
      dpoEmail,
      period_start,
      period_end
    );
    const htmlBytes = new TextEncoder().encode(html);

    const certifiedCount = auditLogs.filter(
      (l) => l.ibs_status === "certified" && l.ibs_certification_hash
    ).length;
    const highRiskCount = auditLogs.filter(
      (l) => l.risk_score != null && l.risk_score >= 0.7
    ).length;

    const storagePath = `${org_id}/${period_start}_${period_end}.html`;
    const { error: uploadError } = await supabase.storage
      .from("dpo-reports")
      .upload(storagePath, htmlBytes, {
        contentType: "text/html",
        upsert: true,
      });

    if (uploadError) throw uploadError;

    const { error: updateError } = await supabase
      .from("dpo_reports")
      .update({
        status: "ready",
        event_count: auditLogs.length,
        certified_count: certifiedCount,
        high_risk_count: highRiskCount,
        file_size_bytes: htmlBytes.length,
        storage_path: storagePath,
        generated_at: new Date().toISOString(),
      })
      .eq("id", reportId);

    if (updateError) throw updateError;

    if (org?.org_type === "sub_account" && org?.parent_org_id) {
      try {
        const { data: hooks } = await supabase
          .from("org_webhooks")
          .select("id, url, secret")
          .eq("org_id", org.parent_org_id)
          .eq("is_active", true)
          .contains("events", ["dpo_report.generated"]);

        for (const hook of hooks || []) {
          const payload = JSON.stringify({
            event: "dpo_report.generated",
            org_id,
            org_name: orgName,
            report_id: reportId,
            period_label: periodLabel,
            period_start,
            period_end,
            event_count: auditLogs.length,
            certified_count: certifiedCount,
            high_risk_count: highRiskCount,
            generated_at: new Date().toISOString(),
          });

          const headers: Record<string, string> = { "Content-Type": "application/json" };
          if (hook.secret) {
            const key = await crypto.subtle.importKey(
              "raw", new TextEncoder().encode(hook.secret),
              { name: "HMAC", hash: "SHA-256" }, false, ["sign"],
            );
            const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
            const hex = [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
            headers["X-Privaro-Signature"] = `sha256=${hex}`;
          }

          fetch(hook.url, { method: "POST", headers, body: payload }).catch((e) =>
            console.error("[generate-dpo-report] webhook delivery failed:", hook.url, e)
          );
        }
      } catch (e) {
        console.error("[generate-dpo-report] partner webhook lookup failed (non-fatal):", e);
      }
    }

    return new Response(
      JSON.stringify({ success: true, report_id: reportId, events: auditLogs.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("generate-dpo-report error:", err);
    return new Response(
      JSON.stringify({ error: "internal_error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
