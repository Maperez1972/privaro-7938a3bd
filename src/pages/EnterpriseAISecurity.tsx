import { Link } from "react-router-dom";
import { useLanguage } from "@/context/LanguageContext";
import { Lock, AlertTriangle, ShieldCheck, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Seo from "@/components/Seo";

const EnterpriseAISecurity = () => {
  const { t } = useLanguage();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Enterprise AI Security: A Practical Guide for Regulated Organizations",
    description:
      "How to secure enterprise AI usage across OpenAI, Anthropic and Gemini — threat model, controls and a step-by-step rollout for security and compliance teams.",
    author: { "@type": "Organization", name: "Privaro" },
    publisher: { "@type": "Organization", name: "Privaro" },
    mainEntityOfPage: "https://privaro.ai/enterprise-ai-security",
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Seo
        title="Enterprise AI Security — Practical Guide | Privaro"
        description="A practical enterprise AI security guide: threat model for LLM usage, essential controls (PII detection, tokenization, audit) and a step-by-step rollout for regulated teams."
        path="/enterprise-ai-security"
        ogType="article"
        jsonLd={jsonLd}
      />
      <Navbar />

      <article className="pt-32 pb-20">
        <div className="max-w-3xl mx-auto px-6">
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full border border-border bg-surface/50 text-sm text-muted-foreground">
            <Lock className="w-4 h-4 text-primary" />
            {t("entSec.badge")}
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold leading-[1.1] mb-6">
            {t("entSec.title")}
          </h1>
          <p className="text-lg text-muted-foreground mb-10 leading-relaxed">
            {t("entSec.intro")}
          </p>

          <div className="space-y-10 text-muted-foreground leading-relaxed">
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-3 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-primary" /> {t("entSec.threat.title")}
              </h2>
              <p>
                {t("entSec.threat.p1")}
              </p>
              <ul className="list-disc list-inside mt-4 space-y-2">
                <li><strong className="text-foreground">{t("entSec.threat.li1.title")}</strong> — {t("entSec.threat.li1.desc")}</li>
                <li><strong className="text-foreground">{t("entSec.threat.li2.title")}</strong> — {t("entSec.threat.li2.desc")}</li>
                <li><strong className="text-foreground">{t("entSec.threat.li3.title")}</strong> — {t("entSec.threat.li3.desc")}</li>
                <li><strong className="text-foreground">{t("entSec.threat.li4.title")}</strong> — {t("entSec.threat.li4.desc")}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-3 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-primary" /> {t("entSec.controls.title")}
              </h2>
              <ol className="list-decimal list-inside space-y-2 mt-4">
                <li><strong className="text-foreground">{t("entSec.controls.li1.title")}</strong> — {t("entSec.controls.li1.desc")}</li>
                <li><strong className="text-foreground">{t("entSec.controls.li2.title")}</strong> — {t("entSec.controls.li2.desc")}</li>
                <li><strong className="text-foreground">{t("entSec.controls.li3.title")}</strong> — {t("entSec.controls.li3.desc")}</li>
                <li><strong className="text-foreground">{t("entSec.controls.li4.title")}</strong> — {t("entSec.controls.li4.desc")}</li>
                <li><strong className="text-foreground">{t("entSec.controls.li5.title")}</strong> — {t("entSec.controls.li5.desc")}</li>
              </ol>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-3">{t("entSec.rollout.title")}</h2>
              <ol className="list-decimal list-inside space-y-2">
                <li><strong className="text-foreground">{t("entSec.rollout.week1.label")}</strong> — {t("entSec.rollout.week1.desc")}</li>
                <li><strong className="text-foreground">{t("entSec.rollout.week2.label")}</strong> — {t("entSec.rollout.week2.desc")}</li>
                <li><strong className="text-foreground">{t("entSec.rollout.week3.label")}</strong> — {t("entSec.rollout.week3.desc")}</li>
                <li><strong className="text-foreground">{t("entSec.rollout.week4.label")}</strong> — {t("entSec.rollout.week4.desc")}</li>
              </ol>
            </section>

            <section className="p-6 rounded-lg border border-border bg-surface/40">
              <h2 className="text-xl font-bold text-foreground mb-3">{t("entSec.fits.title")}</h2>
              <p>
                {t("entSec.fits.desc")}
              </p>
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <Link to="/ai-risk-assessment" className="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity">
                  {t("entSec.fits.cta.risk")} <ArrowRight className="w-4 h-4" />
                </Link>
                <Link to="/ai-governance-platform" className="inline-flex items-center gap-2 px-6 py-3 rounded-md border border-border font-medium hover:bg-secondary transition-colors">
                  {t("entSec.fits.cta.platform")}
                </Link>
              </div>
            </section>
          </div>
        </div>
      </article>

      <Footer />
    </div>
  );
};

export default EnterpriseAISecurity;
