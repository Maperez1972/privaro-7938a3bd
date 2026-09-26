
- Public marketing pages are prerendered at build (scripts/vite-prerender.ts) from src/prerender/snapshots.json; rerun `python3 scripts/snapshot-pages.py` (dev server on :8080) after changing public page content or adding routes — why: non-JS crawlers must see real content without migrating to SSR.
- CSP/referrer/frame-busting are injected as build-only meta in scripts/vite-prerender.ts — why: hosting does not allow custom HTTP headers; add new external domains there.
- Prerendered pages drop modulepreload and inject the entry script after first paint (scripts/vite-prerender.ts) — why: app JS competed with render-blocking CSS and delayed mobile LCP.
