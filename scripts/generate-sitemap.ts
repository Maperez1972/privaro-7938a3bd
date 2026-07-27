// Generates public/sitemap.xml from static routes + dynamic content sources.
// Runs on predev/prebuild. Slugs are regex-extracted to avoid importing TSX modules.
import { writeFileSync, readFileSync } from "fs";
import { resolve } from "path";

const BASE_URL = "https://privaro.ai";

const extractSlugs = (file: string): string[] => {
  const src = readFileSync(resolve(file), "utf8");
  return Array.from(src.matchAll(/slug:\s*["']([^"']+)["']/g)).map((m) => m[1]);
};

const BLOG_SLUGS = extractSlugs("src/content/blog-posts.tsx");
const COMPARISON_SLUGS = extractSlugs("src/content/comparisons.ts");



interface Entry {
  path: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

const staticEntries: Entry[] = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/pricing", changefreq: "monthly", priority: "0.9" },
  { path: "/ai-governance-platform", changefreq: "monthly", priority: "0.9" },
  { path: "/ai-compliance-software", changefreq: "monthly", priority: "0.9" },
  { path: "/enterprise-ai-security", changefreq: "monthly", priority: "0.7" },
  { path: "/pii-detection-api", changefreq: "monthly", priority: "0.8" },
  { path: "/security", changefreq: "monthly", priority: "0.8" },
  { path: "/demo", changefreq: "monthly", priority: "0.8" },
  { path: "/docs", changefreq: "weekly", priority: "0.8" },
  { path: "/changelog", changefreq: "weekly", priority: "0.6" },
  { path: "/partners", changefreq: "monthly", priority: "0.6" },
  { path: "/ai-risk-assessment", changefreq: "monthly", priority: "0.7" },
  { path: "/use-cases/legal", changefreq: "monthly", priority: "0.7" },
  { path: "/use-cases/fintech", changefreq: "monthly", priority: "0.7" },
  { path: "/use-cases/health", changefreq: "monthly", priority: "0.7" },
  { path: "/use-cases/agents", changefreq: "monthly", priority: "0.7" },
  { path: "/status", changefreq: "daily", priority: "0.4" },
  { path: "/blog", changefreq: "weekly", priority: "0.8" },
  { path: "/privacy", changefreq: "yearly", priority: "0.3" },
  { path: "/terms", changefreq: "yearly", priority: "0.3" },
];

const blogEntries: Entry[] = BLOG_POSTS.map((p) => ({
  path: `/blog/${p.slug}`,
  changefreq: "monthly",
  priority: "0.7",
}));

const comparisonEntries: Entry[] = COMPARISONS.map((c) => ({
  path: `/vs/${c.slug}`,
  changefreq: "monthly",
  priority: "0.8",
}));

const entries = [...staticEntries, ...blogEntries, ...comparisonEntries];

const xml = [
  `<?xml version="1.0" encoding="UTF-8"?>`,
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
  ...entries.map((e) =>
    `  <url><loc>${BASE_URL}${e.path}</loc>` +
    (e.changefreq ? `<changefreq>${e.changefreq}</changefreq>` : "") +
    (e.priority ? `<priority>${e.priority}</priority>` : "") +
    `</url>`
  ),
  `</urlset>`,
].join("\n");

writeFileSync(resolve("public/sitemap.xml"), xml);
console.log(`sitemap.xml written (${entries.length} entries)`);
