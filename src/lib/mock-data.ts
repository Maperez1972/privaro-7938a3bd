export const mockDashboardStats = {
  totalRequests: 12847,
  piiDetected: 34219,
  piiProtected: 33891,
  piiLeaked: 328,
  coveragePercent: 99.04,
  avgLatencyMs: 47,
  blockchainCertified: 98.2,
  activePipelines: 4,
};

export const mockRecentLogs = [
  { id: "log-001", event_type: "pii_masked", entity_type: "full_name", entity_category: "personal", action_taken: "tokenised", severity: "medium", pipeline_stage: "detect", ibs_status: "certified", processing_ms: 12, created_at: new Date(Date.now() - 60000).toISOString() },
  { id: "log-002", event_type: "pii_masked", entity_type: "iban", entity_category: "financial", action_taken: "tokenised", severity: "critical", pipeline_stage: "mask", ibs_status: "pending", processing_ms: 8, created_at: new Date(Date.now() - 120000).toISOString() },
  { id: "log-003", event_type: "pii_leaked", entity_type: "email", entity_category: "personal", action_taken: "leaked", severity: "high", pipeline_stage: "proxy", ibs_status: "certified", processing_ms: 15, created_at: new Date(Date.now() - 300000).toISOString() },
  { id: "log-004", event_type: "request_blocked", entity_type: "health_record", entity_category: "special", action_taken: "blocked", severity: "critical", pipeline_stage: "detect", ibs_status: "certified", processing_ms: 3, created_at: new Date(Date.now() - 600000).toISOString() },
  { id: "log-005", event_type: "pii_masked", entity_type: "ssn", entity_category: "personal", action_taken: "anonymised", severity: "critical", pipeline_stage: "mask", ibs_status: "failed", processing_ms: 22, created_at: new Date(Date.now() - 900000).toISOString() },
];

export const mockPipelines = [
  { id: "pipe-001", name: "Legal Document Review", sector: "legal", llm_provider: "openai", llm_model: "gpt-4o", status: "active", total_requests: 4521, total_pii_detected: 12340, total_pii_masked: 12280, total_leaked: 60, avg_latency_ms: 42 },
  { id: "pipe-002", name: "Clinical Notes Assistant", sector: "healthcare", llm_provider: "anthropic", llm_model: "claude-3-5-sonnet", status: "active", total_requests: 3102, total_pii_detected: 9870, total_pii_masked: 9820, total_leaked: 50, avg_latency_ms: 55 },
  { id: "pipe-003", name: "Financial Compliance Bot", sector: "fintech", llm_provider: "google", llm_model: "gemini-1.5-pro", status: "paused", total_requests: 2890, total_pii_detected: 8400, total_pii_masked: 8350, total_leaked: 50, avg_latency_ms: 38 },
  { id: "pipe-004", name: "HR Talent Screening", sector: "hr", llm_provider: "openai", llm_model: "gpt-4o-mini", status: "active", total_requests: 2334, total_pii_detected: 3609, total_pii_masked: 3441, total_leaked: 168, avg_latency_ms: 31 },
];

export const mockPolicyRules = [
  { id: "rule-001", entity_type: "full_name", category: "personal", action: "tokenise", is_enabled: true, regulation_ref: "GDPR Art.5", priority: 10 },
  { id: "rule-002", entity_type: "iban", category: "financial", action: "tokenise", is_enabled: true, regulation_ref: "PSD2", priority: 5 },
  { id: "rule-003", entity_type: "email", category: "personal", action: "pseudonymise", is_enabled: true, regulation_ref: "GDPR Art.5", priority: 20 },
  { id: "rule-004", entity_type: "health_record", category: "special", action: "block", is_enabled: true, regulation_ref: "GDPR Art.9", priority: 1 },
  { id: "rule-005", entity_type: "ssn", category: "personal", action: "anonymise", is_enabled: true, regulation_ref: "GDPR Art.5", priority: 3 },
  { id: "rule-006", entity_type: "phone_number", category: "personal", action: "tokenise", is_enabled: false, regulation_ref: "GDPR Art.5", priority: 30 },
];

export const mockProxyDetect = (text: string) => {
  const detections: Array<{ type: string; value: string; start: number; end: number; severity: string; category: string }> = [];
  const patterns: Array<{ regex: RegExp; type: string; severity: string; category: string }> = [
    { regex: /\b[A-Z][a-záéíóúñ]+ [A-Z][a-záéíóúñ]+\b/g, type: "full_name", severity: "medium", category: "personal" },
    { regex: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, type: "email", severity: "medium", category: "personal" },
    { regex: /\b[A-Z]{2}\d{2}\s?\d{4}\s?\d{4}\s?\d{4}\s?\d{4}\s?\d{4}\b/g, type: "iban", severity: "critical", category: "financial" },
    { regex: /\b\d{8}[A-Z]\b/g, type: "dni", severity: "critical", category: "personal" },
    { regex: /\b\d{3}[-.\s]?\d{2}[-.\s]?\d{4}\b/g, type: "ssn", severity: "critical", category: "personal" },
  ];

  for (const p of patterns) {
    let match;
    while ((match = p.regex.exec(text)) !== null) {
      detections.push({ type: p.type, value: match[0], start: match.index, end: match.index + match[0].length, severity: p.severity, category: p.category });
    }
  }
  return detections;
};

export const mockProxyProtect = (text: string) => {
  const detections = mockProxyDetect(text);
  let protectedText = text;
  const tokenMap: Record<string, string> = {};
  const counters: Record<string, number> = {};

  const sorted = [...detections].sort((a, b) => b.start - a.start);
  for (const d of sorted) {
    const prefix = d.type === "full_name" ? "NM" : d.type === "email" ? "EM" : d.type === "iban" ? "BK" : d.type === "dni" ? "ID" : d.type === "ssn" ? "SS" : "PII";
    counters[prefix] = (counters[prefix] || 0) + 1;
    const token = `[${prefix}-${String(counters[prefix]).padStart(4, "0")}]`;
    tokenMap[token] = d.value;
    protectedText = protectedText.slice(0, d.start) + token + protectedText.slice(d.end);
  }

  return { protectedText, detections, tokenMap, auditLogId: null, requestId: null };
};
