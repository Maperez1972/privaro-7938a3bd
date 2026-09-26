
- Public marketing pages are prerendered at build (scripts/vite-prerender.ts) from src/prerender/snapshots.json; rerun `python3 scripts/snapshot-pages.py` (dev server on :8080) after changing public page content or adding routes — why: non-JS crawlers must see real content without migrating to SSR.
- CSP/referrer/frame-busting are injected as build-only meta in scripts/vite-prerender.ts — why: hosting does not allow custom HTTP headers; add new external domains there.
- Prerendered pages drop modulepreload and inject the entry script after first paint (scripts/vite-prerender.ts) — why: app JS competed with render-blocking CSS and delayed mobile LCP.
- Prerendered pages inline the generated app stylesheet — why: its separate request was the only render-blocking dependency before the mobile LCP heading.
- snapshot-pages.py keeps img attributes exactly as authored in components (no forcing loading="lazy") — why: the forced lazy overrode the eager above-the-fold LCP image (ProblemSection diagram, fetchPriority="high").
