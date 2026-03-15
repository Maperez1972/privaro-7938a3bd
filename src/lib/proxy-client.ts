const PROXY_URL = import.meta.env.VITE_PROXY_URL;

export const proxyDetect = async (text: string) => {
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
    body: JSON.stringify({ text }),
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
      pipeline_id: pipelineId,
      options: { mode: "tokenise", include_detections: true, reversible: true },
    }),
  });
  if (!res.ok) throw new Error("Proxy protect failed");
  const data = await res.json();
  return {
    protectedText: data.protected_prompt,
    detections: data.detections,
    tokenMap: {} as Record<string, string>,
  };
};
