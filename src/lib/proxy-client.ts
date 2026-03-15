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

const DEFAULT_PIPELINE_ID = "c93aed87-b440-4de0-bb21-54a938e475f2";

export const proxyDetect = async (text: string, pipelineId?: string) => {
  if (!PROXY_URL) {
    const { mockProxyDetect } = await import("@/lib/mock-data");
    return mockProxyDetect(text);
  }
  const res = await fetch(`${PROXY_URL}/proxy/detect`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Privaro-Key": import.meta.env.VITE_PROXY_API_KEY || "",
    },
    body: JSON.stringify({
      pipeline_id: pipelineId || DEFAULT_PIPELINE_ID,
      prompt: text,
      options: { mode: "tokenise", include_detections: true },
    }),
  });
  if (!res.ok) throw new Error("Proxy detect failed");
  const data = await res.json();
  return data.detections;
};

export const proxyProtect = async (text: string, pipelineId?: string) => {
  if (!PROXY_URL) {
    const { mockProxyProtect } = await import("@/lib/mock-data");
    return mockProxyProtect(text);
  }
  const res = await fetch(`${PROXY_URL}/proxy/protect`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Privaro-Key": import.meta.env.VITE_PROXY_API_KEY || "",
    },
    body: JSON.stringify({
      prompt: text,
      pipeline_id: pipelineId || DEFAULT_PIPELINE_ID,
      options: { mode: "tokenise", include_detections: true, reversible: true },
    }),
  });
  if (!res.ok) throw new Error("Proxy protect failed");
  const data = await res.json();
  return {
    protectedText: data.protected_prompt,
    detections: data.detections,
    tokenMap: {} as Record<string, string>,
    auditLogId: data.audit_log_id || null,
    requestId: data.request_id || null,
  };
};
