import { Link } from "react-router-dom";
import { useLanguage } from "@/context/LanguageContext";
import logoPrivaroAsset from "@/assets/privaro-ai-logo.png.asset.json";
import { COMPARISONS } from "@/content/comparisons";

const Footer = () => {
  const { t } = useLanguage();
  const linkClass = "text-sm text-muted-foreground underline underline-offset-2 hover:text-foreground transition-colors";

  return (
    <footer className="py-10 px-6 border-t border-border">
      <div className="max-w-6xl mx-auto flex flex-col gap-6">
        <div className="flex justify-center">
          <Link to="/" className="inline-block">
            <img src={logoPrivaroAsset.url} alt="Privaro AI" className="h-7 w-auto" loading="lazy" decoding="async" width={1983} height={231} />
          </Link>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Solutions
          </span>
          <a href="/ai-governance-platform" className={linkClass}>AI Governance Platform</a>
          <a href="/ai-compliance-software" className={linkClass}>AI Compliance Software</a>
          <a href="/enterprise-ai-security" className={linkClass}>Enterprise AI Security</a>
          <a href="/pii-detection-api" className={linkClass}>PII Detection API</a>
          <a href="/rag-pii-protection" className={linkClass}>RAG Protection</a>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Use Cases
          </span>
          <a href="/use-cases/legal" className={linkClass}>Legal</a>
          <a href="/use-cases/health" className={linkClass}>Healthcare</a>
          <a href="/use-cases/fintech" className={linkClass}>Fintech</a>
          <a href="/use-cases/agents" className="text-sm text-amber-400 underline underline-offset-2 hover:text-amber-300 transition-colors">
            AI Agents
          </a>
        </div>
        <div className="flex flex-col sm:flex-row sm:flex-wrap items-center justify-center gap-4 sm:gap-8">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Compare
          </span>
          {COMPARISONS.map((comparison) => (
            <Link key={comparison.slug} to={`/vs/${comparison.slug}`} className={linkClass}>
              {comparison.tagline}
            </Link>
          ))}
        </div>


        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Resources
          </span>
          <a href="/blog" className={linkClass}>Blog</a>
          <a href="/docs" className={linkClass}>Docs</a>
          <a href="/eu-ai-act-compliance" className={linkClass}>EU AI Act Guide</a>
          <a href="/changelog" className={linkClass}>Changelog</a>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
          <a href="/privacy" className={linkClass}>{t("footer.privacy")}</a>
          <a href="/terms" className={linkClass}>{t("footer.terms")}</a>
          <a href="/security" className={linkClass}>Security</a>
          <a href="/status" className={linkClass}>{t("footer.status")}</a>
          <a href="mailto:contact@privaro.ai" className={linkClass}>{t("footer.contact")}</a>
          <button type="button" onClick={openConsentSettings} className={linkClass}>
            Cookies
          </button>
        </div>
        <div className="flex items-center justify-center gap-4">
          <a
            href="https://es.linkedin.com/company/icommunity-baas"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="iCommunity Labs on LinkedIn"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.55C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.72C24 .77 23.2 0 22.22 0z" />
            </svg>
          </a>
        </div>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} Privaro. {t("footer.rights")}</p>
          <p className="text-sm text-muted-foreground">
            {t("footer.tagline")} {t("footer.by")}{" "}
            <a href="https://icommunity.io" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-foreground transition-colors">iCommunity Labs</a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
