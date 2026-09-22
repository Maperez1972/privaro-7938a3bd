import { getReferralSourceName } from "@/lib/referral-sources";

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

const VIA_STORAGE_KEY = "privaro_via";

/**
 * Reads the `?via=<slug>` attribution for the current session. The slug is
 * captured on the landing hit (inline script in index.html) and persisted in
 * sessionStorage so every later SPA navigation keeps reporting it.
 */
export function getViaParams(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const fromUrl = new URLSearchParams(window.location.search).get("via");
    const slug = (fromUrl ?? sessionStorage.getItem(VIA_STORAGE_KEY) ?? "").toLowerCase().trim();
    if (!slug) return {};
    if (fromUrl) sessionStorage.setItem(VIA_STORAGE_KEY, slug);
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
