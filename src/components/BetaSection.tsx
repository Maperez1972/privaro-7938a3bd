import { motion } from "framer-motion";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Gauge, MessageSquare, ArrowRight } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { trackEvent } from "@/lib/analytics";

const BetaSection = () => {
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSending(true);
    setError("");
    const formData = new FormData(e.currentTarget);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("send-demo-request", {
        body: {
          name: formData.get("name"),
          company: formData.get("company"),
          industry: "",
          role: "",
          email: formData.get("email"),
          concern: "",
        },
      });
      if (fnError) throw fnError;
      if (data && !data.success) throw new Error(data.error);
      trackEvent("demo_request", { path: "sales_short_form" });
      setSubmitted(true);
    } catch (err) {
      console.error("Error sending demo request:", err);
      setError(t("beta.form.error"));
    } finally {
      setSending(false);
    }
  };

  const inputClass =
    "w-full px-4 py-2.5 rounded-md bg-surface border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow";

  return (
    <section id="early-access" className="py-28 px-6 relative">
      <div className="absolute inset-0 grid-pattern opacity-20" />
      <div className="relative max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <p className="text-primary text-sm font-medium uppercase tracking-widest mb-4">{t("beta.label")}</p>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t("beta.title1")}<br />
            <span className="text-gradient">{t("beta.title2")}</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">{t("beta.subtitle")}</p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6 items-stretch">
          {/* Path A — self-service risk assessment */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-col p-8 rounded-lg border border-border bg-card"
          >
            <div className="w-12 h-12 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center mb-5">
              <Gauge className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">{t("beta.path.risk.title")}</h3>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6 flex-1">{t("beta.path.risk.desc")}</p>
            <Link
              to="/ai-risk-assessment"
              onClick={() => {
                window.scrollTo({ top: 0 });
                trackEvent("start_risk_assessment", { location: "home_cta" });
              }}
              className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-md border border-primary/40 text-foreground font-semibold hover:bg-secondary transition-colors"
            >
              {t("beta.path.risk.cta")} <ArrowRight className="w-4 h-4 text-primary" />
            </Link>
            <p className="text-xs text-muted-foreground text-center mt-3">{t("beta.path.risk.note")}</p>
          </motion.div>

          {/* Path B — talk to sales */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            {submitted ? (
              <div className="h-full p-8 rounded-lg border border-primary/30 bg-card text-center glow-border flex flex-col items-center justify-center">
                <h3 className="text-2xl font-bold mb-3 text-foreground">{t("beta.thanks.title")}</h3>
                <p className="text-muted-foreground">{t("beta.thanks.body")}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="h-full p-8 rounded-lg border border-border bg-card space-y-4 flex flex-col">
                <div className="w-12 h-12 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center mb-1">
                  <MessageSquare className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">{t("beta.path.sales.title")}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{t("beta.path.sales.desc")}</p>
                <div>
                  <label htmlFor="beta-name" className="block text-sm text-muted-foreground mb-1.5">{t("beta.form.name")}</label>
                  <input id="beta-name" name="name" type="text" required className={inputClass} />
                </div>
                <div>
                  <label htmlFor="beta-email" className="block text-sm text-muted-foreground mb-1.5">{t("beta.form.email")}</label>
                  <input id="beta-email" name="email" type="email" required className={inputClass} />
                </div>
                <div>
                  <label htmlFor="beta-company" className="block text-sm text-muted-foreground mb-1.5">{t("beta.form.company")}</label>
                  <input id="beta-company" name="company" type="text" required className={inputClass} />
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <button
                  type="submit"
                  disabled={sending}
                  className="w-full py-3 rounded-md bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {sending ? t("beta.form.sending") : t("beta.path.sales.cta")}
                </button>
                <p className="text-xs text-muted-foreground text-center">{t("beta.form.disclaimer")}</p>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default BetaSection;
