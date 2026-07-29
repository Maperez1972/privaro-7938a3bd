const PROXY_URL = import.meta.env.VITE_PROXY_URL;

export const PII_PATTERNS: { label: string; regex: RegExp }[] = [
  { label: "Email", regex: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g },
  { label: "Phone", regex: /(\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}/g },
  { label: "IBAN", regex: /[A-Z]{2}\d{2}[A-Z0-9]{4,30}/g },
  { label: "SSN", regex: /\b\d{3}-\d{2}-\d{4}\b/g },
  { label: "Credit Card", regex: /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g },
];

export const tokenizePii = (text: string): { sanitized: string; detected: string[] } => {
  let sanitized = text;
  const detected: string[] = [];
  for (const { label, regex } of PII_PATTERNS) {
    const matches = sanitized.match(regex);
    if (matches) {
      detected.push(...matches.map(m => `${label}: ${m}`));
      sanitized = sanitized.replace(regex, `[${label.toUpperCase()}_REDACTED]`);
    }
  }
  return { sanitized, detected };
};

// Fixed 2026-07-24 — CRITICAL: both functions below used to call the
// proxy directly from the browser with VITE_PROXY_API_KEY, a real
// production key for iCommunity Labs' own pipeline embedded in the
// shipped bundle and extractable by anyone via devtools. Routed through
// proxy-bridge, which resolves the caller's real org_id and pipeline
// server-side and authenticates to the proxy with an internal shared
// secret — no hardcoded pipeline fallback needed here anymore.
async function callProxyBridge(mode: "detect" | "protect", text: string, pipelineId?: string, options?: Record<string, unknown>) {
  const { supabase } = await import("@/integrations/supabase/client");
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData?.session?.access_token;
  if (!token) throw new Error("No auth session");

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const res = await fetch(`${supabaseUrl}/functions/v1/proxy-bridge`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    },
    body: JSON.stringify({ mode, prompt: text, pipeline_id: pipelineId, options }),
  });
  if (!res.ok) throw new Error(`Proxy ${mode} failed`);
  return res.json();
}

export const proxyDetect = async (text: string, pipelineId?: string) => {
  if (!PROXY_URL) {
    const { mockProxyDetect } = await import("@/lib/mock-data");
    return mockProxyDetect(text);
  }
  const data = await callProxyBridge("detect", text, pipelineId);
  return data.detections;
};

export interface CompressionStats { tokens_saved: number; compression_ratio: number; }

export const proxyProtect = async (text: string, pipelineId?: string, opts?: { optimizeContext?: boolean }) => {
  if (!PROXY_URL) {
    const { mockProxyProtect } = await import("@/lib/mock-data");
    const base = mockProxyProtect(text) as any;
    if (opts?.optimizeContext) {
      const { simulateCompression } = await import("@/lib/pii-engine");
      const stats = simulateCompression(base.protectedText);
      return { ...base, compressionStats: { tokens_saved: stats.tokensSaved, compression_ratio: stats.compressionRatio } };
    }
    return base;
  }
  const options = opts?.optimizeContext ? { optimize_context: true } : undefined;
  const data = await callProxyBridge("protect", text, pipelineId, options);
  return {
    protectedText: data.protected_prompt,
    detections: data.detections,
    tokenMap: {} as Record<string, string>,
    auditLogId: data.audit_log_id || null,
    requestId: data.request_id || null,
    compressionStats: data.compression_stats
      ? { tokens_saved: data.compression_stats.tokens_saved, compression_ratio: data.compression_stats.compression_ratio }
      : undefined,
  };
};
