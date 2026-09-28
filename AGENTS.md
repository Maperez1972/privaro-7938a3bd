
- Public marketing pages are prerendered at build (scripts/vite-prerender.ts) from src/prerender/snapshots.json; rerun `python3 scripts/snapshot-pages.py` (dev server on :8080) after changing public page content or adding routes — why: non-JS crawlers must see real content without migrating to SSR.
- CSP/referrer/frame-busting are injected as build-only meta in scripts/vite-prerender.ts — why: hosting does not allow custom HTTP headers; add new external domains there.
- Prerendered pages drop modulepreload and inject the entry script after first paint (scripts/vite-prerender.ts) — why: app JS competed with render-blocking CSS and delayed mobile LCP.
- Prerendered pages inline the generated app stylesheet — why: its separate request was the only render-blocking dependency before the mobile LCP heading.
- snapshot-pages.py keeps img attributes exactly as authored in components (no forcing loading="lazy") — why: the forced lazy overrode the eager above-the-fold LCP image (ProblemSection diagram, fetchPriority="high").
- llms.txt is generated on every build (scripts/llms-txt.ts via vite-prerender closeBundle) from snapshots, src/content/pricing-data.ts and the live OpenAPI spec; never add a static public/llms.txt — why: the hand-written one drifted from real prices/endpoints/posts.
- Prices live only in src/content/pricing-data.ts (Pricing page, Product/Offer JSON-LD, llms.txt) — why: one source avoids contradictory prices across surfaces.
- Blog posts get internal links automatically (src/content/blog-related.ts, by tags or `relatedPages`) and Article + optional FAQPage JSON-LD from a post's `faq` field — why: no post should ship isolated or without structured data.
