import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Cookie, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useLanguage } from "@/context/LanguageContext";
import { applyConsent, readConsent } from "@/lib/consent";

const COPY = {
  en: {
    title: "We value your privacy",
    body: "We use strictly necessary cookies to run Privaro, plus optional analytics cookies to understand how the site is used. You choose what we measure.",
    accept: "Accept all",
    reject: "Reject optional",
    customize: "Customise",
    save: "Save preferences",
    necessary: "Strictly necessary",
    necessaryDesc: "Required for security, session and language. Always active.",
    analytics: "Analytics",
    analyticsDesc: "Anonymous usage statistics (Google Analytics 4).",
    marketing: "Marketing",
    marketingDesc: "Attribution and advertising measurement.",
    privacy: "Privacy policy",
    close: "Close",
  },
  es: {
    title: "Tu privacidad es importante",
    body: "Usamos cookies estrictamente necesarias para que Privaro funcione y cookies opcionales de analítica para entender cómo se usa la web. Tú decides qué medimos.",
    accept: "Aceptar todo",
    reject: "Rechazar opcionales",
    customize: "Personalizar",
    save: "Guardar preferencias",
    necessary: "Estrictamente necesarias",
    necessaryDesc: "Necesarias para seguridad, sesión e idioma. Siempre activas.",
    analytics: "Analítica",
    analyticsDesc: "Estadísticas de uso anónimas (Google Analytics 4).",
    marketing: "Marketing",
    marketingDesc: "Atribución y medición publicitaria.",
    privacy: "Política de privacidad",
    close: "Cerrar",
  },
} as const;

export const CookieConsent = () => {
  const { lang } = useLanguage();
  const t = COPY[lang === "es" ? "es" : "en"];

  const [visible, setVisible] = useState(false);
  const [details, setDetails] = useState(false);
  const [analytics, setAnalytics] = useState(true);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    if (!readConsent()) setVisible(true);
  }, []);

  useEffect(() => {
    const open = () => {
      const current = readConsent();
      setAnalytics(current ? current.analytics_storage === "granted" : true);
      setMarketing(current ? current.ad_storage === "granted" : false);
      setDetails(true);
      setVisible(true);
    };
    window.addEventListener("privaro:open-consent", open);
    return () => window.removeEventListener("privaro:open-consent", open);
  }, []);

  const decide = useCallback((allowAnalytics: boolean, allowMarketing: boolean) => {
    applyConsent(allowAnalytics, allowMarketing);
    setVisible(false);
    setDetails(false);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[100] p-3 sm:p-4" role="dialog" aria-label={t.title}>
      <div className="mx-auto max-w-3xl rounded-xl border border-border bg-card/95 p-4 shadow-2xl backdrop-blur sm:p-5">
        <div className="flex items-start gap-3">
          <Cookie className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
          <div className="flex-1">
            <h2 className="text-sm font-semibold text-foreground">{t.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {t.body}{" "}
              <Link to="/privacy" className="text-primary underline underline-offset-2">
                {t.privacy}
              </Link>
            </p>

            {details && (
              <div className="mt-4 space-y-3 border-t border-border pt-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-foreground">{t.necessary}</p>
                    <p className="text-xs text-muted-foreground">{t.necessaryDesc}</p>
                  </div>
                  <Switch checked disabled aria-label={t.necessary} />
                </div>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-foreground">{t.analytics}</p>
                    <p className="text-xs text-muted-foreground">{t.analyticsDesc}</p>
                  </div>
                  <Switch checked={analytics} onCheckedChange={setAnalytics} aria-label={t.analytics} />
                </div>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-foreground">{t.marketing}</p>
                    <p className="text-xs text-muted-foreground">{t.marketingDesc}</p>
                  </div>
                  <Switch checked={marketing} onCheckedChange={setMarketing} aria-label={t.marketing} />
                </div>
              </div>
            )}

            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
              {details ? (
                <Button size="sm" onClick={() => decide(analytics, marketing)}>
                  {t.save}
                </Button>
              ) : (
                <>
                  <Button size="sm" variant="ghost" onClick={() => setDetails(true)}>
                    {t.customize}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => decide(false, false)}>
                    {t.reject}
                  </Button>
                  <Button size="sm" onClick={() => decide(true, true)}>
                    {t.accept}
                  </Button>
                </>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={() => decide(false, false)}
            aria-label={t.close}
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
