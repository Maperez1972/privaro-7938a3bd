// Build-time: downloads the live OpenAPI spec and renders it as static HTML so
// non-JS crawlers see the real API reference on /docs/api (Redoc replaces it client-side).
import { load } from "js-yaml";

export const OPENAPI_URL =
  "https://raw.githubusercontent.com/Maperez1972/privaro-proxy/main/privaro-openapi.yaml";

const METHODS = ["get", "post", "put", "patch", "delete"] as const;

interface Param { name?: string; in?: string; required?: boolean; description?: string }
interface Operation {
  summary?: string;
  description?: string;
  tags?: string[];
  parameters?: Param[];
  responses?: Record<string, { description?: string }>;
}
interface Spec {
  info?: { title?: string; version?: string; description?: string };
  servers?: { url?: string; description?: string }[];
  paths?: Record<string, Partial<Record<(typeof METHODS)[number], Operation>>>;
}

const esc = (s: unknown): string =>
  String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export function renderSpec(spec: Spec): string {
  const info = spec.info ?? {};
  const ops: string[] = [];
  let count = 0;
  for (const [path, item] of Object.entries(spec.paths ?? {})) {
    for (const m of METHODS) {
      const op = item?.[m];
      if (!op) continue;
      count++;
      const params = (op.parameters ?? [])
        .map((p) => `<li><code>${esc(p.name)}</code> (${esc(p.in)}${p.required ? ", required" : ""}) ${esc(p.description)}</li>`)
        .join("");
      const responses = Object.entries(op.responses ?? {})
        .map(([code, r]) => `<li><code>${esc(code)}</code> ${esc(r?.description)}</li>`)
        .join("");
      ops.push(
        `<article class="py-5 border-t border-border">` +
          `<h3 class="font-semibold"><code>${m.toUpperCase()} ${esc(path)}</code></h3>` +
          (op.summary ? `<p class="mt-1">${esc(op.summary)}</p>` : "") +
          (op.description ? `<p class="mt-2 text-sm text-muted-foreground">${esc(op.description)}</p>` : "") +
          (op.tags?.length ? `<p class="mt-1 text-xs text-muted-foreground">Tags: ${esc(op.tags.join(", "))}</p>` : "") +
          (params ? `<h4 class="mt-3 text-sm font-semibold">Parameters</h4><ul class="text-sm">${params}</ul>` : "") +
          (responses ? `<h4 class="mt-3 text-sm font-semibold">Responses</h4><ul class="text-sm">${responses}</ul>` : "") +
          `</article>`,
      );
    }
  }
  const servers = (spec.servers ?? [])
    .map((s) => `<li><code>${esc(s.url)}</code> ${esc(s.description)}</li>`)
    .join("");
  return (
    `<section class="p-6" data-openapi-static="1">` +
    `<h2 class="text-2xl font-bold">${esc(info.title ?? "Privaro API")}${info.version ? ` <small>v${esc(info.version)}</small>` : ""}</h2>` +
    (info.description ? `<p class="mt-2 text-sm text-muted-foreground whitespace-pre-line">${esc(info.description)}</p>` : "") +
    (servers ? `<h3 class="mt-4 font-semibold">Servers</h3><ul class="text-sm">${servers}</ul>` : "") +
    `<p class="mt-4 text-sm">${count} endpoints</p>` +
    ops.join("") +
    `</section>`
  );
}

export async function fetchSpecHtml(): Promise<string | null> {
  try {
    const res = await fetch(OPENAPI_URL, { signal: AbortSignal.timeout(15000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return renderSpec(load(await res.text()) as Spec);
  } catch (e) {
    console.warn("[prerender] OpenAPI fetch failed, /docs/api keeps Redoc placeholder:", e);
    return null;
  }
}
