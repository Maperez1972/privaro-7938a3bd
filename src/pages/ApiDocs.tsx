import { useEffect, useState } from "react";
import { Check, Copy, Download, FileJson, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Seo from "@/components/Seo";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const OPENAPI_URL =
  "https://raw.githubusercontent.com/Maperez1972/privaro-proxy/main/privaro-openapi.yaml";
const POSTMAN_URL =
  "https://raw.githubusercontent.com/Maperez1972/privaro-proxy/main/Privaro.postman_collection.json";
const REDOC_CDN = "https://cdn.redoc.ly/redoc/latest/bundles/redoc.standalone.js";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      redoc: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        "spec-url"?: string;
      };
    }
  }
}

const ApiDocs = () => {
  const [redocReady, setRedocReady] = useState(false);
  const [redocError, setRedocError] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyPostmanUrl = async () => {
    try {
      await navigator.clipboard.writeText(POSTMAN_URL);
      setCopied(true);
      toast.success("Postman collection URL copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy. URL: " + POSTMAN_URL);
    }
  };

  useEffect(() => {
    if (document.querySelector(`script[src="${REDOC_CDN}"]`)) {
      setRedocReady(true);
      return;
    }
    const script = document.createElement("script");
    script.src = REDOC_CDN;
    script.async = true;
    script.onload = () => setRedocReady(true);
    script.onerror = () => setRedocError(true);
    document.body.appendChild(script);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Seo
        title="API Reference — Privaro"
        description="Referencia completa de la API de Privaro: endpoints, esquemas y ejemplos. Especificación OpenAPI siempre actualizada desde el repositorio fuente."
        path="/docs/api"
      />
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-6">
          <header className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              API <span className="text-gradient">Reference</span>
            </h1>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Button onClick={copyPostmanUrl}>
                {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                {copied ? "URL copied" : "Import into Postman"}
              </Button>
              <Button asChild variant="outline">
                <a href={OPENAPI_URL} target="_blank" rel="noopener noreferrer" download>
                  <Download className="w-4 h-4 mr-2" />
                  OpenAPI YAML
                </a>
              </Button>
              <Button asChild variant="outline">
                <a href={POSTMAN_URL} target="_blank" rel="noopener noreferrer" download>
                  <FileJson className="w-4 h-4 mr-2" />
                  Postman Collection
                </a>
              </Button>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Open Postman → File → Import → Link → paste this URL
            </p>
          </header>

          <div className="rounded-xl border border-border bg-card overflow-hidden">
            {redocError ? (
              <div className="p-10 text-center text-sm text-muted-foreground">
                No se pudo cargar el visor de la API. Puedes descargar la especificación
                directamente con los botones de arriba.
              </div>
            ) : !redocReady ? (
              <div className="p-10 flex items-center justify-center gap-3 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                Cargando especificación…
              </div>
            ) : (
              <redoc spec-url={OPENAPI_URL} />
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ApiDocs;
