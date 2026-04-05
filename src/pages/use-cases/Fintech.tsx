import { useLanguage } from "@/context/LanguageContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CreditCard, BarChart3, ShieldCheck, Fingerprint, CheckCircle2, XCircle, ArrowRight, Search, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const FintechPage = () => {
  const { t } = useLanguage();

  const features = [
    { icon: CreditCard, titleKey: "fintech.feat1.title", descKey: "fintech.feat1.desc" },
    { icon: ShieldCheck, titleKey: "fintech.feat2.title", descKey: "fintech.feat2.desc" },
    { icon: BarChart3, titleKey: "fintech.feat3.title", descKey: "fintech.feat3.desc" },
    { icon: Fingerprint, titleKey: "fintech.feat4.title", descKey: "fintech.feat4.desc" },
  ];

  const workflows = [
    "fintech.workflow1", "fintech.workflow2", "fintech.workflow3", "fintech.workflow4", "fintech.workflow5",
  ];

  const without = ["fintech.without1", "fintech.without2", "fintech.without3", "fintech.without4"];
  const withP = ["fintech.with1", "fintech.with2", "fintech.with3", "fintech.with4"];

  const steps = [
    { icon: Search, numKey: "01", titleKey: "fintech.step1.title", descKey: "fintech.step1.desc" },
    { icon: ShieldCheck, numKey: "02", titleKey: "fintech.step2.title", descKey: "fintech.step2.desc" },
    { icon: Eye, numKey: "03", titleKey: "fintech.step3.title", descKey: "fintech.step3.desc" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* HERO */}
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl md:text-5xl font-bold mb-6">
            {t("fintech.hero.title")}
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            {t("fintech.hero.subtitle")}
          </motion.p>
          <motion.ul initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="flex flex-col items-center gap-2 mb-10 text-sm text-muted-foreground">
            <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />{t("fintech.hero.bullet1")}</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />{t("fintech.hero.bullet2")}</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />{t("fintech.hero.bullet3")}</li>
          </motion.ul>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" onClick={() => window.location.href = "/#beta"}>{t("fintech.hero.cta1")}</Button>
            <Button size="lg" variant="outline" onClick={() => document.getElementById("fintech-how")?.scrollIntoView({ behavior: "smooth" })}>
              {t("fintech.hero.cta2")} <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* TRIGGER */}
      <section className="py-12 px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-3xl mx-auto text-center">
          <p className="text-base md:text-lg text-muted-foreground italic border-l-2 border-primary pl-6 text-left">
            {t("fintech.trigger")}
          </p>
        </motion.div>
      </section>

      {/* WHY FINTECH TEAMS USE PRIVARO */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-3xl md:text-4xl font-bold text-center mb-12">
            {t("fintech.why.title")}
          </motion.h2>
          <div className="grid md:grid-cols-2 gap-8">
            {features.map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="p-6 rounded-xl border border-border bg-card">
                <f.icon className="h-10 w-10 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">{t(f.titleKey)}</h3>
                <p className="text-muted-foreground">{t(f.descKey)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TYPICAL FINTECH WORKFLOWS */}
      <section className="py-20 px-6 bg-muted/20">
        <div className="max-w-3xl mx-auto">
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-3xl md:text-4xl font-bold text-center mb-10">
            {t("fintech.workflows.title")}
          </motion.h2>
          <div className="space-y-4">
            {workflows.map((wk, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="flex items-start gap-3 p-4 rounded-lg border border-border bg-card">
                <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-foreground">{t(wk)}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* WITHOUT VS WITH */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("fintech.vs.title")}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">{t("fintech.vs.subtitle")}</p>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-8">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="p-6 rounded-xl border border-destructive/30 bg-card">
              <h3 className="text-lg font-semibold text-destructive mb-4">{t("fintech.vs.without")}</h3>
              <ul className="space-y-3">
                {without.map((w, i) => (
                  <li key={i} className="flex items-start gap-2 text-muted-foreground">
                    <XCircle className="w-4 h-4 text-destructive mt-1 flex-shrink-0" />
                    <span>{t(w)}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="p-6 rounded-xl border border-primary/30 bg-card">
              <h3 className="text-lg font-semibold text-primary mb-4">{t("fintech.vs.with")}</h3>
              <ul className="space-y-3">
                {withP.map((w, i) => (
                  <li key={i} className="flex items-start gap-2 text-muted-foreground">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                    <span>{t(w)}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="fintech-how" className="py-20 px-6 bg-muted/20">
        <div className="max-w-5xl mx-auto">
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-3xl md:text-4xl font-bold text-center mb-12">
            {t("fintech.how.title")}
          </motion.h2>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.12 }}
                className="relative p-6 rounded-xl border border-border bg-card">
                <span className="text-5xl font-extrabold absolute top-4 right-4 text-primary/10">{s.numKey}</span>
                <s.icon className="w-8 h-8 text-primary mb-4" />
                <h3 className="text-lg font-semibold mb-2">{t(s.titleKey)}</h3>
                <p className="text-sm text-muted-foreground">{t(s.descKey)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CREDIBILITY */}
      <section className="py-20 px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">{t("fintech.cred.title")}</h2>
          <p className="text-muted-foreground">{t("fintech.cred.desc")}</p>
        </motion.div>
      </section>

      {/* FINAL CTA */}
      <section className="py-20 px-6 bg-muted/20">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("fintech.cta.title")}</h2>
          <p className="text-muted-foreground mb-8">{t("fintech.cta.desc")}</p>
          <Button size="lg" onClick={() => window.location.href = "/#beta"}>{t("fintech.cta.button")}</Button>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
};

export default FintechPage;
