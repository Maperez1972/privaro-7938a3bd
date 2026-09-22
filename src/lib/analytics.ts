import { getReferralSourceName, resolveAttribution } from "@/lib/referral-sources";

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

const VIA_STORAGE_KEY = "privaro_via";
const VIA_CONTENT_STORAGE_KEY = "privaro_via_content";

/**
 * Reads the directory attribution for the current session (`?via=<slug>` or any
 * registered alternative parameter such as Uneed's `?ref=...&ref_type=...`).
 * Captured on the landing hit (inline script in index.html) and persisted in
 * sessionStorage so every later SPA navigation keeps reporting it.
 */
export function getViaParams(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const resolved = resolveAttribution(window.location.search);
    if (resolved) {
      sessionStorage.setItem(VIA_STORAGE_KEY, resolved.slug);
      sessionStorage.setItem(VIA_CONTENT_STORAGE_KEY, resolved.content);
    }
    const slug = resolved?.slug ?? sessionStorage.getItem(VIA_STORAGE_KEY) ?? "";
    if (!slug) return {};
    return {
      via_source: slug,
      directory_platform: getReferralSourceName(slug) ?? slug,
    };
  } catch {
    return {};
  }
}

export function pageview(path: string) {
  if (typeof window === "undefined" || !window.gtag) return;
  window.gtag("event", "page_view", { page_path: path, ...getViaParams() });
}

export function trackEvent(name: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined" || !window.gtag) return;
  window.gtag("event", name, { ...getViaParams(), ...params });
}
