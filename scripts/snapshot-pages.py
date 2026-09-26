"""Captures the rendered HTML of every public marketing route (from public/sitemap.xml)
into src/prerender/snapshots.json. The Vite prerender plugin injects these snapshots
into per-route static HTML at build time so non-JS crawlers see real content.

Usage (dev server running on :8080):  python3 scripts/snapshot-pages.py
"""
import asyncio
import json
import re
from pathlib import Path

from playwright.async_api import async_playwright

BASE = "http://localhost:8080"
ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "src" / "prerender" / "snapshots.json"

sitemap = (ROOT / "public" / "sitemap.xml").read_text()
routes = [
    re.sub(r"^https://privaro\.ai", "", u) or "/"
    for u in re.findall(r"<loc>([^<]+)</loc>", sitemap)
]
routes = [r for r in routes if not r.endswith(".pdf")]

EXTRACT = """() => {
  const root = document.getElementById('root').cloneNode(true);
  root.querySelectorAll('script,noscript,iframe,svg,canvas,video,[aria-hidden="true"]').forEach(n => n.remove());
  root.querySelectorAll('[style]').forEach(n => {
    const s = n.getAttribute('style') || '';
    if (/opacity|transform|filter/.test(s)) n.removeAttribute('style');
  });
  root.querySelectorAll('img').forEach(n => { n.setAttribute('loading','lazy'); n.removeAttribute('fetchpriority'); });
  const q = (sel, attr) => { const el = document.head.querySelector(sel); return el ? el.getAttribute(attr) : null; };
  const ld = [...document.head.querySelectorAll('script[type="application/ld+json"][data-rh]')].map(s => s.textContent);
  return {
    title: document.title,
    description: q('meta[name="description"]', 'content'),
    canonical: q('link[rel="canonical"]', 'href'),
    ogTitle: q('meta[property="og:title"]', 'content'),
    ogDescription: q('meta[property="og:description"]', 'content'),
    jsonLd: ld,
    html: root.innerHTML.replace(/\\s(data-[\\w-]+|class)=""/g, ''),
  };
}"""


async def main() -> None:
    snapshots: dict = {}
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        ctx = await browser.new_context(viewport={"width": 1280, "height": 1800}, locale="en-US")
        await ctx.add_cookies([])
        page = await ctx.new_page()
        await page.goto(BASE)
        await page.evaluate("localStorage.setItem('privaro-consent-v1', JSON.stringify({analytics_storage:'denied'}))")
        for r in routes:
            await page.goto(BASE + r, wait_until="networkidle")
            # scroll to trigger lazy sections / in-view animations
            for _ in range(12):
                await page.mouse.wheel(0, 1500)
                await page.wait_for_timeout(150)
            await page.wait_for_timeout(800)
            data = await page.evaluate(EXTRACT)
            snapshots[r] = data
            print(r, len(data["html"]), data["title"])
        await browser.close()
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(snapshots, ensure_ascii=False))
    print("written", OUT, len(snapshots))


asyncio.run(main())
