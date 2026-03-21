import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
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
  pipelines?: { name: string; sector: string; llm_provider: string } | null;
}

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

  const eventsHtml = logs
    .map(
      (log, i) => `
    <div style="margin-bottom:24px;padding:16px;border:1px solid #e5e7eb;border-radius:8px;background:#fafafa;">
      <div style="font-weight:700;color:#1e293b;margin-bottom:8px;">[EVENT #${i + 1}]</div>
      <table style="width:100%;font-size:13px;border-collapse:collapse;">
        <tr><td style="padding:3px 8px;color:#64748b;width:180px;">Timestamp</td><td>${new Date(log.created_at).toISOString()}</td></tr>
        <tr><td style="padding:3px 8px;color:#64748b;">Event Type</td><td>${log.event_type}</td></tr>
        <tr><td style="padding:3px 8px;color:#64748b;">Entity Protected</td><td>${log.entity_type} (${log.entity_category})</td></tr>
        <tr><td style="padding:3px 8px;color:#64748b;">Action Taken</td><td>${log.action_taken}</td></tr>
        <tr><td style="padding:3px 8px;color:#64748b;">Severity</td><td>${log.severity}</td></tr>
        <tr><td style="padding:3px 8px;color:#64748b;">Pipeline</td><td>${log.pipelines?.name || "—"} (${log.pipelines?.sector || "—"})</td></tr>
        <tr><td style="padding:3px 8px;color:#64748b;">LLM Provider</td><td>${log.pipelines?.llm_provider || "—"}</td></tr>
        <tr><td style="padding:3px 8px;color:#64748b;">Processing Time</td><td>${log.processing_ms ?? "—"}ms</td></tr>
        <tr><td style="padding:3px 8px;color:#64748b;">Risk Score</td><td style="color:${log.risk_score != null ? (log.risk_score >= 0.7 ? "#ef4444" : log.risk_score >= 0.4 ? "#f59e0b" : "#22c55e") : "#94a3b8"};font-weight:600;">${log.risk_score != null ? `${(log.risk_score * 100).toFixed(0)}% — ${log.risk_score >= 0.7 ? "HIGH RISK" : log.risk_score >= 0.4 ? "MEDIUM" : "LOW"}` : "—"}</td></tr>
      </table>
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

  <div class="section-title">LEGAL BASIS & COMPLIANCE FRAMEWORK</div>
  <ul class="legal">
    <li><strong>GDPR Art. 5(2) — Accountability:</strong> All PII processing events are immutably recorded on Fantom Opera Mainnet blockchain via iCommunity Blockchain Solutions (iBS).</li>
    <li><strong>GDPR Art. 25 — Privacy by Design:</strong> PII tokenised before reaching LLM providers. Original values never transmitted.</li>
    <li><strong>GDPR Art. 32 — Security:</strong> AES-256-GCM encryption for all stored tokens. Keys segmented per organization.</li>
  </ul>

  <div class="section-title">BLOCKCHAIN EVIDENCE LOG (${logs.length} events)</div>
  ${eventsHtml}

  <div class="section-title">DECLARATION</div>
  <p style="font-size:14px;color:#475569;">
    This report certifies that all AI interactions processed through Privaro during the stated period have been handled in compliance with GDPR Art. 5(2) accountability requirements. Each PII detection event is individually certified on blockchain, providing immutable evidence of data protection measures applied.
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
    // Authenticate user
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

    // Verify JWT
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

    // Check admin role
    const supabase = createClient(supabaseUrl, serviceKey);
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .maybeSingle();

    if (roleData?.role !== "admin") {
      return new Response(
        JSON.stringify({ error: "Forbidden: admin role required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { org_id, period_start, period_end, force_regenerate } = await req.json();

    if (!org_id || !period_start || !period_end) {
      return new Response(
        JSON.stringify({ error: "org_id, period_start, period_end required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check for existing report for this period
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

    // If force_regenerate, delete old reports for this period
    if (force_regenerate) {
      await supabase
        .from("dpo_reports")
        .delete()
        .eq("org_id", org_id)
        .eq("period_start", period_start)
        .eq("period_end", period_end);
    }

    // Get org info
    const { data: org } = await supabase
      .from("organizations")
      .select("name, gdpr_dpo_email")
      .eq("id", org_id)
      .single();

    const orgName = org?.name || "Unknown Organization";
    const dpoEmail = org?.gdpr_dpo_email || "";

    // Format period label
    const periodDate = new Date(period_start + "T00:00:00Z");
    const periodLabel = periodDate.toLocaleString("en-US", {
      month: "long",
      year: "numeric",
    });

    // Create initial dpo_reports row as "generating"
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

    // Fetch audit logs for the period
    const { data: logs, error: logsError } = await supabase
      .from("audit_logs")
      .select(
        "id, event_type, entity_type, entity_category, action_taken, severity, risk_score, pipeline_stage, processing_ms, ibs_status, ibs_evidence_id, ibs_certification_hash, ibs_network, ibs_certified_at, created_at, pipelines(name, sector, llm_provider)"
      )
      .eq("org_id", org_id)
      .gte("created_at", period_start + "T00:00:00Z")
      .lte("created_at", period_end + "T23:59:59Z")
      .order("created_at", { ascending: false })
      .limit(5000);

    if (logsError) throw logsError;

    const auditLogs: AuditLogRow[] = logs || [];

    // Generate HTML
    const html = generateReportHtml(
      auditLogs,
      orgName,
      dpoEmail,
      period_start,
      period_end
    );
    const htmlBytes = new TextEncoder().encode(html);

    // Compute stats
    const certifiedCount = auditLogs.filter(
      (l) => l.ibs_status === "certified" && l.ibs_certification_hash
    ).length;
    const highRiskCount = auditLogs.filter(
      (l) => l.risk_score != null && l.risk_score >= 0.7
    ).length;

    // Upload to storage
    const storagePath = `${org_id}/${period_start}_${period_end}.html`;
    const { error: uploadError } = await supabase.storage
      .from("dpo-reports")
      .upload(storagePath, htmlBytes, {
        contentType: "text/html",
        upsert: true,
      });

    if (uploadError) throw uploadError;

    // Update report row to "ready"
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

    return new Response(
      JSON.stringify({ success: true, report_id: reportId, events: auditLogs.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("generate-dpo-report error:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
