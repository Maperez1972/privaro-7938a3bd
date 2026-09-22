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
  "uneed.best": "Uneed",
};

export const REFERRAL_CAMPAIGN = "directory_listing";
export const REFERRAL_MEDIUM = "referral";

/**
 * Directories that use their own referral-link format instead of our canonical
 * `?via=<slug>`. To support a new directory, add one entry here (and mirror it
 * in the inline capture script in `index.html`).
 *
 * - `param`: query param that carries the source value (e.g. Uneed sends
 *   `?ref=uneed.best&ref_type=adv`).
 * - `contentParam`: optional extra param used as campaign content.
 */
export const ALT_ATTRIBUTION_PARAMS: ReadonlyArray<{ param: string; contentParam?: string }> = [
  { param: "ref", contentParam: "ref_type" },
];

export interface Attribution {
  /** Raw source value, lower-cased (e.g. "taaft", "uneed.best"). */
  slug: string;
  /** Campaign content (the slug itself for `via`, `ref_type` for alt params). */
  content: string;
}

/**
 * Resolves the attribution for the current URL: canonical `?via=` first, then
 * any registered alternative parameter. Returns null when no param is present.
 */
export function resolveAttribution(search: string): Attribution | null {
  const params = new URLSearchParams(search);
  const via = params.get("via");
  if (via) {
    const slug = via.toLowerCase().trim();
    if (slug) return { slug, content: slug };
  }
  for (const alt of ALT_ATTRIBUTION_PARAMS) {
    const value = params.get(alt.param);
    if (!value) continue;
    const slug = value.toLowerCase().trim();
    if (!slug) continue;
    const content = (alt.contentParam && params.get(alt.contentParam)?.trim()) || slug;
    return { slug, content };
  }
  return null;
}

/** Returns the readable platform name for a `via` slug, or null if unknown. */
export function getReferralSourceName(slug: string | null | undefined): string | null {
  if (!slug) return null;
  return REFERRAL_SOURCES[slug.toLowerCase().trim()] ?? null;
}

/** Builds the canonical backlink for a directory listing. */
export function buildReferralLink(slug: string): string {
  return `https://privaro.ai/?via=${slug}`;
}
