import { useCallback, useEffect, useRef, useState } from "react";
import Navbar from "@/components/Navbar";
import Seo from "@/components/Seo";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, RefreshCw, Loader2 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const HEALTH_URL = "https://api.privaro.ai/health";
const REFRESH_MS = 60_000;
const TIMEOUT_MS = 10_000;

type HealthPayload = {
  status?: string;
  version?: string;
  environment?: string;
  detector?: string;
  supabase?: string;
};

type Result =
  | { ok: true; data: HealthPayload; latencyMs: number; checkedAt: Date }
  | { ok: false; error: string; latencyMs: number | null; checkedAt: Date };

const COPY = {
  es: {
    title: "Estado del servicio",
    subtitle: "Estado en vivo de la API de Privaro.",
    apiOk: "API de Privaro: Operativo",
    apiFail: "API de Privaro: Incidencia detectada",
    dbLabel: "Base de datos",
    dbConnected: "Conectada",
    dbDisconnected: "No conectada",
    latency: "Tiempo de respuesta",
    lastCheck: "Última comprobación",
    refresh: "Actualizar ahora",
    checking: "Comprobando…",
    autoRefresh: "Refresco automático cada 60 segundos.",
    version: "Versión",
    environment: "Entorno",
    detector: "Detector",
    fetchError: "No se pudo contactar con la API",
  },
  en: {
    title: "Service status",
    subtitle: "Live status of the Privaro API.",
    apiOk: "Privaro API: Operational",
    apiFail: "Privaro API: Incident detected",
    dbLabel: "Database",
    dbConnected: "Connected",
    dbDisconnected: "Not connected",
    latency: "Response time",
    lastCheck: "Last check",
    refresh: "Refresh now",
    checking: "Checking…",
    autoRefresh: "Auto-refreshes every 60 seconds.",
    version: "Version",
    environment: "Environment",
    detector: "Detector",
    fetchError: "Could not reach the API",
  },
};

async function fetchHealth(): Promise<Result> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  const start = performance.now();
  try {
    const res = await fetch(HEALTH_URL, { signal: controller.signal, cache: "no-store" });
    const latencyMs = Math.round(performance.now() - start);
    if (!res.ok) {
      return { ok: false, error: `HTTP ${res.status}`, latencyMs, checkedAt: new Date() };
    }
    const data = (await res.json()) as HealthPayload;
    if (data?.status !== "ok") {
      return { ok: false, error: `status=${data?.status ?? "unknown"}`, latencyMs, checkedAt: new Date() };
    }
    return { ok: true, data, latencyMs, checkedAt: new Date() };
  } catch (e) {
    const latencyMs = Math.round(performance.now() - start);
    return { ok: false, error: (e as Error)?.message ?? "network_error", latencyMs, checkedAt: new Date() };
  } finally {
    clearTimeout(timer);
  }
}

const Status = () => {
  const { lang } = useLanguage();
  const c = COPY[lang === "en" ? "en" : "es"];
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(true);
  const mounted = useRef(true);

  const run = useCallback(async () => {
    setLoading(true);
    const r = await fetchHealth();
    if (mounted.current) {
      setResult(r);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    run();
    const id = setInterval(run, REFRESH_MS);
    return () => {
      mounted.current = false;
      clearInterval(id);
    };
  }, [run]);

  const ok = result?.ok === true;
  const dbConnected = result?.ok && result.data.supabase === "connected";

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Seo
        title="Service Status — Privaro"
        description="Live status of the Privaro API and database connectivity."
        path="/status"
      />
      <Navbar />
      <main className="flex-1 max-w-3xl w-full mx-auto px-6 py-24">
        <header className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">{c.title}</h1>
          <p className="text-muted-foreground">{c.subtitle}</p>
        </header>

        <section
          className={`rounded-xl border p-8 mb-6 transition-colors ${
            !result
              ? "border-border bg-card"
              : ok
              ? "border-success/40 bg-success/5"
              : "border-destructive/40 bg-destructive/5"
          }`}
          aria-live="polite"
        >
          <div className="flex items-center gap-4">
            {!result ? (
              <Loader2 className="w-12 h-12 text-muted-foreground animate-spin" />
            ) : ok ? (
              <CheckCircle2 className="w-12 h-12 text-success" />
            ) : (
              <XCircle className="w-12 h-12 text-destructive" />
            )}
            <div>
              <p className="text-xl md:text-2xl font-semibold">
                {!result ? c.checking : ok ? c.apiOk : c.apiFail}
              </p>
              {result && !ok && (
                <p className="text-sm text-muted-foreground mt-1">{c.fetchError}</p>
              )}
            </div>
          </div>
        </section>

        <section className="grid sm:grid-cols-2 gap-4 mb-6">
          <div className="rounded-lg border border-border bg-card p-5">
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">{c.dbLabel}</p>
            <div className="flex items-center gap-2">
              {dbConnected ? (
                <CheckCircle2 className="w-5 h-5 text-success" />
              ) : (
                <XCircle className="w-5 h-5 text-destructive" />
              )}
              <p className="font-medium">
                {dbConnected ? c.dbConnected : c.dbDisconnected}
              </p>
            </div>
          </div>
          <div className="rounded-lg border border-border bg-card p-5">
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">{c.latency}</p>
            <p className="font-medium">
              {result?.latencyMs != null ? `${result.latencyMs} ms` : "—"}
            </p>
          </div>
        </section>

        {result?.ok && (
          <section className="rounded-lg border border-border bg-card p-5 mb-6 grid sm:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">{c.version}</p>
              <p className="font-medium">{result.data.version ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">{c.environment}</p>
              <p className="font-medium">{result.data.environment ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">{c.detector}</p>
              <p className="font-medium">{result.data.detector ?? "—"}</p>
            </div>
          </section>
        )}

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-border">
          <div className="text-sm text-muted-foreground">
            <p>
              {c.lastCheck}:{" "}
              {result ? result.checkedAt.toLocaleString(lang === "en" ? "en-GB" : "es-ES") : "—"}
            </p>
            <p className="mt-1">{c.autoRefresh}</p>
          </div>
          <Button onClick={run} disabled={loading} variant="outline">
            {loading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            {loading ? c.checking : c.refresh}
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Status;
