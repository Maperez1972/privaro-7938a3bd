/**
 * Generates an HTML DPO GDPR Accountability Report from audit log data.
 */

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

interface ReportParams {
  logs: AuditLogRow[];
  orgName: string;
  dpoEmail: string;
}

export function generateDpoReportHtml({ logs, orgName, dpoEmail }: ReportParams): string {
  const now = new Date().toISOString();
  const certified = logs.filter((l) => l.ibs_status === "certified" && l.ibs_certification_hash);
  const entityTypes = [...new Set(logs.map((l) => l.entity_type))];
  const pipelineNames = [...new Set(logs.map((l) => l.pipelines?.name).filter(Boolean))];
  const firstDate = logs.length ? logs[logs.length - 1].created_at : now;
  const lastDate = logs.length ? logs[0].created_at : now;

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
        <tr><td style="padding:3px 8px;color:#64748b;">Risk Score</td><td style="color:${log.risk_score != null ? (log.risk_score >= 0.7 ? '#ef4444' : log.risk_score >= 0.4 ? '#f59e0b' : '#22c55e') : '#94a3b8'};font-weight:600;">${log.risk_score != null ? `${(log.risk_score * 100).toFixed(0)}% — ${log.risk_score >= 0.7 ? 'HIGH RISK' : log.risk_score >= 0.4 ? 'MEDIUM' : 'LOW'}` : '—'}</td></tr>
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
                <tr><td style="padding:3px 8px;color:#64748b;">Verify</td><td><a href="https://checker.icommunitylabs.com/check/${log.ibs_network || "fantom_opera_mainnet"}/${log.ibs_certification_hash}" style="color:#3B82F6;">https://checker.icommunitylabs.com/check/${log.ibs_network || "fantom_opera_mainnet"}/${log.ibs_certification_hash}</a></td></tr>
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
    <p>Report Period: ${new Date(firstDate).toLocaleDateString()} — ${new Date(lastDate).toLocaleDateString()}</p>
  </div>

  <div class="section-title">EXECUTIVE SUMMARY</div>
  <div class="summary-grid">
    <div class="summary-card"><div class="value">${logs.length}</div><div class="label">Total PII Events</div></div>
    <div class="summary-card"><div class="value" style="color:#16a34a;">${certified.length}</div><div class="label">Blockchain Certified</div></div>
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
    <p>Report generated: ${new Date(now).toISOString()}</p>
  </div>
</body>
</html>`;
}

export function downloadHtml(html: string, filename: string) {
  const blob = new Blob([html], { type: "text/html;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
