import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Bot, Shield, Zap, Code2, X, Check, ArrowRight, Rocket, Handshake, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";

const featureIcons = [Bot, Shield, Zap, Code2];

const AgentsPage = () => {
  const { t } = useLanguage();

  const features = [
    { icon: featureIcons[0], title: t("agents.f1.title"), desc: t("agents.f1.desc") },
    { icon: featureIcons[1], title: t("agents.f2.title"), desc: t("agents.f2.desc") },
    { icon: featureIcons[2], title: t("agents.f3.title"), desc: t("agents.f3.desc") },
    { icon: featureIcons[3], title: t("agents.f4.title"), desc: t("agents.f4.desc") },
  ];

  const withoutItems = [
    t("agents.without.1"), t("agents.without.2"), t("agents.without.3"), t("agents.without.4"),
  ];

  const withItems = [
    t("agents.with.1"), t("agents.with.2"), t("agents.with.3"), t("agents.with.4"),
  ];

  const steps = [
    { num: "01", title: t("agents.step1.title"), desc: t("agents.step1.desc") },
    { num: "02", title: t("agents.step2.title"), desc: t("agents.step2.desc") },
    { num: "03", title: t("agents.step3.title"), desc: t("agents.step3.desc") },
    { num: "04", title: t("agents.step4.title"), desc: t("agents.step4.desc") },
    { num: "05", title: t("agents.step5.title"), desc: t("agents.step5.desc") },
  ];

  const frameworks = ["LangChain", "CrewAI", "n8n", "Custom Agents", "OpenAI Agents", "Claude", "ruflo"];

  const pricing = [
    {
      name: t("agents.plan1.name"), price: "€99", period: "/mo",
      steps: t("agents.plan1.steps"), desc: t("agents.plan1.desc"),
      overage: "€0.0020 / step", highlighted: false, bullets: [] as string[],
    },
    {
      name: t("agents.plan2.name"), price: "€499", period: "/mo",
      steps: t("agents.plan2.steps"), desc: t("agents.plan2.desc"),
      overage: "€0.0015 / step", highlighted: true, bullets: [] as string[],
    },
    {
      name: t("agents.plan3.name"), price: t("agents.plan3.price"), period: "",
      steps: t("agents.plan3.steps"), desc: t("agents.plan3.desc"),
      overage: "€0.0010 / step", highlighted: false,
      bullets: [t("agents.plan3.b1"), t("agents.plan3.b2"), t("agents.plan3.b3"), t("agents.plan3.b4"), t("agents.plan3.b5")],
    },
  ];

  const whyEmbed = [t("agents.why.1"), t("agents.why.2"), t("agents.why.3"), t("agents.why.4")];
  const partnerBenefits = [t("agents.partner.1"), t("agents.partner.2"), t("agents.partner.3"), t("agents.partner.4"), t("agents.partner.5")];
  const useCases = [t("agents.usecase.1"), t("agents.usecase.2"), t("agents.usecase.3")];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-full px-4 py-1.5 mb-6">{t("agents.hero.badge")}</span>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              {t("agents.hero.title1")} <span className="text-primary">{t("agents.hero.title2")}</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t("agents.hero.subtitle")}
            </p>
            <p className="text-base text-muted-foreground/80 max-w-2xl mx-auto mt-4">
              {t("agents.hero.trigger")}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Core tagline */}
      <section className="pb-12 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="text-lg md:text-xl font-semibold italic text-muted-foreground">
            {t("agents.tagline")}
          </motion.p>
        </div>
      </section>

      {/* Features grid */}
      <section className="pb-20 px-6">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8">
          {features.map((f, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="p-6 rounded-xl border border-amber-500/20 bg-card hover:border-amber-500/40 transition-colors">
              <div className="w-12 h-12 rounded-lg bg-amber-500/10 flex items-center justify-center mb-5">
                <f.icon className="h-6 w-6 text-amber-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{f.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="pb-20 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-2xl md:text-3xl font-bold text-center mb-12">{t("agents.howItWorks")}</motion.h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {steps.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="relative p-5 rounded-xl border border-border bg-card text-center">
                <span className="text-2xl font-bold text-amber-400/60 mb-2 block">{s.num}</span>
                <h4 className="text-sm font-semibold mb-1">{s.title}</h4>
                <p className="text-xs text-muted-foreground">{s.desc}</p>
                {i < steps.length - 1 && (
                  <ArrowRight className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40 z-10" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Compatible Frameworks */}
      <section className="pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-2xl md:text-3xl font-bold mb-8">{t("agents.frameworks")}</motion.h2>
          <div className="flex flex-wrap justify-center gap-3">
            {frameworks.map((fw) => (
              <span key={fw} className="text-sm font-medium px-4 py-2 rounded-full border border-border bg-secondary/50 text-muted-foreground">{fw}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Without vs With Privaro */}
      <section className="pb-20 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-2xl md:text-3xl font-bold text-center mb-3">{t("agents.comparison.title")}</motion.h2>
          <p className="text-sm text-muted-foreground text-center mb-12">{t("agents.comparison.subtitle")}</p>
          <div className="grid md:grid-cols-2 gap-6">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="p-6 rounded-xl border border-destructive/30 bg-destructive/5">
              <h3 className="text-lg font-semibold mb-4 text-destructive">{t("agents.comparison.without")}</h3>
              <ul className="space-y-3">
                {withoutItems.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                    <X className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="p-6 rounded-xl border border-emerald-500/30 bg-emerald-500/5">
              <h3 className="text-lg font-semibold mb-4 text-emerald-400">{t("agents.comparison.with")}</h3>
              <ul className="space-y-3">
                {withItems.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="pb-12 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-2xl md:text-3xl font-bold text-center mb-3">{t("agents.pricing")}</motion.h2>
          <p className="text-sm text-muted-foreground text-center mb-12">{t("agents.pricing.context")}</p>
          <div className="grid md:grid-cols-3 gap-6">
            {pricing.map((p, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className={`p-6 rounded-xl border ${p.highlighted ? "border-amber-500/50 bg-amber-500/5 ring-1 ring-amber-500/20" : "border-border bg-card"} text-center`}>
                <h3 className="text-lg font-semibold mb-2">{p.name}</h3>
                <div className="mb-2">
                  <span className="text-3xl font-bold">{p.price}</span>
                  <span className="text-muted-foreground text-sm">{p.period}</span>
                </div>
                <p className="text-sm text-muted-foreground mb-1">{p.steps}</p>
                <p className="text-xs text-muted-foreground mb-2">{p.desc}</p>
                <p className="text-xs text-muted-foreground/70">Overage: {p.overage}</p>
                {p.bullets.length > 0 && (
                  <ul className="mt-4 space-y-1.5 text-left">
                    {p.bullets.map((b, j) => (
                      <li key={j} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Check className="w-3 h-3 text-primary flex-shrink-0" />
                        {b}
                      </li>
                    ))}
                  </ul>
                )}
                {p.highlighted && <span className="inline-block mt-3 text-xs font-semibold text-amber-400 uppercase tracking-wider">{t("agents.mostPopular")}</span>}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Teams Embed Privaro */}
      <section className="pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-2xl md:text-3xl font-bold text-center mb-10">{t("agents.whyEmbed.title")}</motion.h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {whyEmbed.map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="flex items-start gap-3 p-4 rounded-lg border border-border bg-card">
                <Rocket className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-sm text-muted-foreground">{item}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* For AI Builders & Partners */}
      <section className="pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Handshake className="h-7 w-7 text-primary" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-3">{t("agents.builders.title")}</h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-10">
              {t("agents.builders.subtitle")}
            </p>
          </motion.div>
          <div className="grid sm:grid-cols-2 gap-4 text-left max-w-2xl mx-auto mb-10">
            {partnerBenefits.map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}
                className="flex items-start gap-3 p-3">
                <Check className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-muted-foreground">{item}</p>
              </motion.div>
            ))}
          </div>
          <Button size="lg" onClick={() => window.location.href = "/#early-access"}>{t("agents.builders.cta")}</Button>
        </div>
      </section>

      {/* Typical Use Cases */}
      <section className="pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-2xl md:text-3xl font-bold mb-8">{t("agents.usecases.title")}</motion.h2>
          <div className="flex flex-wrap justify-center gap-4">
            {useCases.map((uc, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="flex items-center gap-2 px-5 py-3 rounded-lg border border-border bg-card">
                <Target className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span className="text-sm text-muted-foreground">{uc}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="pb-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <Button size="lg" onClick={() => window.location.href = "/#early-access"}>{t("agents.cta")}</Button>
          <p className="text-sm text-muted-foreground mt-4">{t("agents.cta.sub")}</p>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AgentsPage;
