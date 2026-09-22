/**
 * Canonical mapping between the `?via=<slug>` attribution parameter used in our
 * AI-directory listings and the human readable platform name reported in GA4 /
 * Windsor. Keep in sync with the inline capture script in `index.html`.
 */
export const REFERRAL_SOURCES: Record<string, string> = {
  topaitools: "TopAI.tools",
  taaft: "There's An AI For That",
  alternativeto: "AlternativeTo",
  toolify: "Toolify",
  futuretools: "FutureTools",
  producthunt: "Product Hunt",
  g2: "G2",
  bestai: "Best-AI.org",
  launchnest: "LaunchNest",
};

export const REFERRAL_CAMPAIGN = "directory_listing";
export const REFERRAL_MEDIUM = "referral";

/** Returns the readable platform name for a `via` slug, or null if unknown. */
export function getReferralSourceName(slug: string | null | undefined): string | null {
  if (!slug) return null;
  return REFERRAL_SOURCES[slug.toLowerCase().trim()] ?? null;
}

/** Builds the canonical backlink for a directory listing. */
export function buildReferralLink(slug: string): string {
  return `https://privaro.ai/?via=${slug}`;
}
