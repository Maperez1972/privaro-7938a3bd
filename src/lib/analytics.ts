export const GA_MEASUREMENT_ID =
  (import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_ANALYTICS_API_KEY as string | undefined) ||
  "G-5ELLFF522G";

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

export function initAnalytics() {
  const id = GA_MEASUREMENT_ID;
  if (window.gtag) {
    return;
  }

  window.dataLayer = window.dataLayer || [];
  function gtag(...args: unknown[]) {
    window.dataLayer.push(args);
  }
  window.gtag = gtag;

  gtag("js", new Date());
  gtag("config", id);

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
  document.head.appendChild(script);
}

export function pageview(path: string) {
  if (typeof window === "undefined" || !window.gtag || !GA_MEASUREMENT_ID) return;
  window.gtag("event", "page_view", { page_path: path });
}

export function trackEvent(name: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined" || !window.gtag || !GA_MEASUREMENT_ID) return;
  window.gtag("event", name, params);
}
