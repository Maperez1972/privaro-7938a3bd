export type ConsentValue = "granted" | "denied";

export interface ConsentState {
  analytics_storage: ConsentValue;
  ad_storage: ConsentValue;
  ad_user_data: ConsentValue;
  ad_personalization: ConsentValue;
  timestamp: string;
}

export const CONSENT_STORAGE_KEY = "privaro-consent-v1";

export function readConsent(): ConsentState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CONSENT_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ConsentState) : null;
  } catch {
    return null;
  }
}

export function applyConsent(analytics: boolean, marketing: boolean): ConsentState {
  const state: ConsentState = {
    analytics_storage: analytics ? "granted" : "denied",
    ad_storage: marketing ? "granted" : "denied",
    ad_user_data: marketing ? "granted" : "denied",
    ad_personalization: marketing ? "granted" : "denied",
    timestamp: new Date().toISOString(),
  };

  try {
    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage unavailable: consent still applies to the current page view.
  }

  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("consent", "update", {
      analytics_storage: state.analytics_storage,
      ad_storage: state.ad_storage,
      ad_user_data: state.ad_user_data,
      ad_personalization: state.ad_personalization,
    });
    window.gtag("event", "consent_decision", {
      analytics_consent: state.analytics_storage,
      marketing_consent: state.ad_storage,
    });
  }

  return state;
}

export function openConsentSettings() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("privaro:open-consent"));
  }
}
