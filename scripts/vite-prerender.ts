// Vite plugin: after build, writes a static HTML file per public route with its own
// head tags and the real page content inside #root, so non-JS crawlers see content.
// Snapshots come from src/prerender/snapshots.json (refresh: python3 scripts/snapshot-pages.py).
import type { Plugin } from "vite";
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, resolve } from "path";

interface Snapshot {
  title: string;
  description: string | null;
  canonical: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  jsonLd: string[];
  html: string;
}

const BASE_URL = "https://privaro.ai";

const esc = (s: string): string =>
  s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const setMeta = (html: string, re: RegExp, tag: string): string =>
  re.test(html) ? html.replace(re, tag) : html.replace("</head>", `    ${tag}\n</head>`);

const ROOT_RE = /<div id="root">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/;

function renderRoute(template: string, route: string, snap: Snapshot): string {
  const title = snap.title;
  const desc = snap.description ?? "";
  const ogTitle = snap.ogTitle ?? title;
  const ogDesc = snap.ogDescription ?? desc;
  const canonical = snap.canonical ?? `${BASE_URL}${route === "/" ? "/" : route}`;

  let html = template.replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(title)}</title>`);
  html = setMeta(html, /<meta name="description"[^>]*>/, `<meta name="description" content="${esc(desc)}">`);
  html = setMeta(html, /<meta property="og:url"[^>]*>/, `<meta property="og:url" content="${esc(canonical)}">`);
  html = setMeta(html, /<meta property="og:title"[^>]*>/, `<meta property="og:title" content="${esc(ogTitle)}">`);
  html = setMeta(html, /<meta property="og:description"[^>]*>/, `<meta property="og:description" content="${esc(ogDesc)}">`);
  html = setMeta(html, /<meta name="twitter:title"[^>]*>/, `<meta name="twitter:title" content="${esc(ogTitle)}">`);
  html = setMeta(html, /<meta name="twitter:description"[^>]*>/, `<meta name="twitter:description" content="${esc(ogDesc)}">`);
  html = html.replace("</head>", `    <link rel="canonical" href="${esc(canonical)}" data-prerender="1">\n</head>`);
  const ld = snap.jsonLd
    .map((j) => `<script type="application/ld+json" data-prerender="1">${j.replace(/</g, "\\u003c")}</script>`)
    .join("");
  if (ld) html = html.replace("</head>", `    ${ld}\n</head>`);

  // If this HTML is served for a different path (SPA fallback), drop the snapshot
  // before paint so app routes never flash marketing content.
  const guard =
    `<script>(function(){var p=location.pathname.replace(/\\/+$/,'')||'/';` +
    `if(p!==${JSON.stringify(route)}){var r=document.getElementById('root');if(r)r.innerHTML='';` +
    `document.querySelectorAll('[data-prerender]').forEach(function(n){n.remove()});}})();</script>`;

  return html.replace(ROOT_RE, `<div id="root">${snap.html}</div>${guard}`);
}

// Build-only security meta (hosting does not allow custom HTTP headers).
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://cdn.redoc.ly https://*.lovable.app https://*.lovable.dev",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  "img-src 'self' data: blob: https:",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.privaro.ai https://privaro-proxy-production.up.railway.app https://raw.githubusercontent.com https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com https://checker.icommunitylabs.com https://*.lovable.app https://*.lovable.dev",
  "worker-src 'self' blob:",
  "frame-src 'self' https://checker.icommunitylabs.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "upgrade-insecure-requests",
].join("; ");

const SECURITY_HEAD =
  `<meta http-equiv="Content-Security-Policy" content="${CSP}">\n` +
  `    <meta name="referrer" content="strict-origin-when-cross-origin">\n` +
  `    <script>if(window.top!==window.self){try{window.top.location=window.self.location}catch(e){document.documentElement.style.display='none'}}</script>\n`;

export function prerenderPlugin(): Plugin {
  let outDir = "dist";
  return {
    name: "privaro-prerender",
    apply: "build",
    transformIndexHtml(html) {
      return html.replace("<head>", `<head>\n    ${SECURITY_HEAD}`);
    },
    configResolved(cfg) {
      outDir = resolve(cfg.root, cfg.build.outDir);
    },
    closeBundle() {
      const snapPath = resolve("src/prerender/snapshots.json");
      const indexPath = resolve(outDir, "index.html");
      if (!existsSync(snapPath) || !existsSync(indexPath)) return;
      const template = readFileSync(indexPath, "utf8");
      if (!ROOT_RE.test(template)) {
        console.warn("[prerender] #root marker not found; skipping");
        return;
      }
      const snaps = JSON.parse(readFileSync(snapPath, "utf8")) as Record<string, Snapshot>;
      // Map dev asset URLs (/src/assets/name.ext) captured in snapshots to hashed build files.
      const built = existsSync(resolve(outDir, "assets")) ? readdirSync(resolve(outDir, "assets")) : [];
      const fixAssets = (html: string): string =>
        html.replace(/\/src\/assets\/([\w.-]+?)\.(\w+)(\?[^"'\s,]*)?/g, (m, name: string, ext: string) => {
          const hit = built.find((f) => f.startsWith(`${name}-`) && f.endsWith(`.${ext}`));
          return hit ? `/assets/${hit}` : m;
        });
      let count = 0;
      for (const [route, snap] of Object.entries(snaps)) {
        const out = renderRoute(template, route, { ...snap, html: fixAssets(snap.html) });
        const targets =
          route === "/" ? [indexPath] : [resolve(outDir, `.${route}`, "index.html"), resolve(outDir, `.${route}.html`)];
        for (const t of targets) {
          mkdirSync(dirname(t), { recursive: true });
          writeFileSync(t, out);
        }
        count++;
      }
      console.log(`[prerender] wrote ${count} routes`);
    },
  };
}
