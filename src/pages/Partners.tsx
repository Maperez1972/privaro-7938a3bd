import { useState } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, Layers, DollarSign, Check, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/context/LanguageContext";

const Partners = () => {
  const { t } = useLanguage();
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [role, setRole] = useState("");
  const [clients, setClients] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSending(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("send-demo-request", {
        body: {
          name: fd.get("name"),
          company: fd.get("company"),
          role,
          email: fd.get("email"),
          concern: `Agents/Workflows: ${fd.get("workflows") || "—"} | Clients: ${clients || "—"}`,
          source: "partner",
        },
      });
      if (fnError) throw fnError;
      if (data && !data.success) throw new Error(data.error);
      setSubmitted(true);
    } catch (err) {
      console.error("Partner form error:", err);
      setError(t("partners.form.error"));
    } finally {
      setSending(false);
    }
  };

  const whyCards = [
    { icon: TrendingUp, title: t("partners.why.1.title"), desc: t("partners.why.1.desc") },
    { icon: Layers, title: t("partners.why.2.title"), desc: t("partners.why.2.desc") },
    { icon: DollarSign, title: t("partners.why.3.title"), desc: t("partners.why.3.desc") },
  ];

  const models = [
    {
      emoji: "🟢", name: t("partners.model.1.name"), badge: t("partners.model.1.badge"),
      badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
      desc: t("partners.model.1.desc"),
      bullets: [t("partners.model.1.b1"), t("partners.model.1.b2"), t("partners.model.1.b3")],
      ideal: t("partners.model.1.ideal"),
      border: "border-emerald-500/30",
    },
    {
      emoji: "🟡", name: t("partners.model.2.name"), badge: t("partners.model.2.badge"),
      badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/30",
      desc: t("partners.model.2.desc"),
      bullets: [t("partners.model.2.b1"), t("partners.model.2.b2"), t("partners.model.2.b3")],
      ideal: t("partners.model.2.ideal"),
      border: "border-amber-500/40 ring-1 ring-amber-500/20",
    },
    {
      emoji: "🔴", name: t("partners.model.3.name"), badge: t("partners.model.3.badge"),
      badgeColor: "bg-primary/10 text-primary border-primary/30",
      desc: t("partners.model.3.desc"),
      bullets: [t("partners.model.3.b1"), t("partners.model.3.b2"), t("partners.model.3.b3")],
      ideal: t("partners.model.3.ideal"),
      border: "border-border",
    },
  ];

  const impacts = [
    t("partners.impact.1"), t("partners.impact.2"), t("partners.impact.3"),
    t("partners.impact.4"), t("partners.impact.5"), t("partners.impact.6"),
  ];

  const yesItems = [t("partners.who.yes.1"), t("partners.who.yes.2"), t("partners.who.yes.3"), t("partners.who.yes.4")];
  const noItems = [t("partners.who.no.1"), t("partners.who.no.2"), t("partners.who.no.3"), t("partners.who.no.4")];

  const frameworks = ["LangChain", "CrewAI", "n8n", "Claude", "GPT-4", "Custom Agents"];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-primary bg-primary/10 border border-primary/30 rounded-full px-4 py-1.5 mb-6">
              {t("partners.hero.badge")}
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              {t("partners.hero.title1")}<br />
              <span className="text-primary">{t("partners.hero.title2")}</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              {t("partners.hero.subtitle")}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4">
              <Button size="lg" asChild>
                <a href="mailto:partners@privaro.ai">{t("partners.hero.cta1")}</a>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a href="#how-it-works">{t("partners.hero.cta2")}</a>
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">{t("partners.hero.note")}</p>
          </motion.div>
        </div>
      </section>

      {/* Why Partners Choose Privaro */}
      <section className="pb-20 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-2xl md:text-3xl font-bold text-center mb-12">
            {t("partners.why.title")}
          </motion.h2>
          <div className="grid md:grid-cols-3 gap-6">
            {whyCards.map((c, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="p-6 rounded-xl border border-primary/20 bg-card hover:border-primary/40 transition-colors">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-5">
                  <c.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{c.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{c.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How the partnership works */}
      <section id="how-it-works" className="pb-20 px-6 scroll-mt-20">
        <div className="max-w-6xl mx-auto">
          <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-2xl md:text-3xl font-bold text-center mb-12">
            {t("partners.models.title")}
          </motion.h2>
          <div className="grid md:grid-cols-3 gap-6">
            {models.map((m, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className={`p-6 rounded-xl border ${m.border} bg-card flex flex-col`}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">{m.emoji}</span>
                  <h3 className="text-lg font-semibold">{m.name}</h3>
                </div>
                <span className={`self-start text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full border mb-4 ${m.badgeColor}`}>{m.badge}</span>
                <p className="text-sm text-muted-foreground mb-4">{m.desc}</p>
                <ul className="space-y-2 mb-5">
                  {m.bullets.map((b, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-foreground">
                      <Check className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                      {b}
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-muted-foreground mt-auto pt-3 border-t border-border">
                  {t("partners.model.idealPrefix")} {m.ideal}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Commercial Impact */}
      <section className="pb-20 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-2xl md:text-3xl font-bold text-center mb-12">
            {t("partners.impact.title")}
          </motion.h2>
          <div className="grid sm:grid-cols-2 gap-4 mb-12">
            {impacts.map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}
                className="flex items-start gap-3 p-4 rounded-lg border border-border bg-card">
                <Check className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-muted-foreground">{item}</p>
              </motion.div>
            ))}
          </div>
          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="text-center text-xl md:text-2xl font-semibold italic text-foreground">
            {t("partners.impact.tagline")}
          </motion.p>
        </div>
      </section>

      {/* Pricing */}
      <section className="pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-2xl md:text-3xl font-bold text-center mb-3">
            {t("partners.pricing.title")}
          </motion.h2>
          <p className="text-sm text-muted-foreground text-center mb-12">{t("partners.pricing.subtitle")}</p>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 rounded-xl border border-border bg-card">
              <h3 className="text-lg font-semibold mb-3">{t("partners.pricing.rev.title")}</h3>
              <p className="text-2xl font-bold mb-1">{t("partners.pricing.rev.price")}</p>
              <p className="text-sm text-muted-foreground mb-5">{t("partners.pricing.rev.desc1")}<br />{t("partners.pricing.rev.desc2")}</p>
              <ul className="space-y-2 mb-4">
                {[t("partners.pricing.rev.b1"), t("partners.pricing.rev.b2"), t("partners.pricing.rev.b3")].map((b) => (
                  <li key={b} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />{b}
                  </li>
                ))}
              </ul>
              <p className="text-xs text-muted-foreground/80 pt-3 border-t border-border">{t("partners.pricing.rev.best")}</p>
            </div>
            <div className="p-6 rounded-xl border border-primary/50 bg-primary/5 ring-1 ring-primary/20">
              <h3 className="text-lg font-semibold mb-3">{t("partners.pricing.use.title")}</h3>
              <p className="text-2xl font-bold mb-1">€0.0015 <span className="text-sm font-normal text-muted-foreground">{t("partners.pricing.use.unit")}</span></p>
              <p className="text-sm text-muted-foreground mb-5">{t("partners.pricing.use.desc")}</p>
              <ul className="space-y-2 mb-4">
                {[t("partners.pricing.use.b1"), t("partners.pricing.use.b2"), t("partners.pricing.use.b3")].map((b) => (
                  <li key={b} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />{b}
                  </li>
                ))}
              </ul>
              <p className="text-xs text-muted-foreground/80 pt-3 border-t border-primary/20">{t("partners.pricing.use.best")}</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground text-center mt-8 max-w-2xl mx-auto">
            {t("partners.pricing.note")}
          </p>
        </div>
      </section>

      {/* Who this is for */}
      <section className="pb-20 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-2xl md:text-3xl font-bold text-center mb-12">
            {t("partners.who.title")}
          </motion.h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 rounded-xl border border-emerald-500/30 bg-emerald-500/5">
              <h3 className="text-lg font-semibold mb-4 text-emerald-400">{t("partners.who.yes")}</h3>
              <ul className="space-y-3">
                {yesItems.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />{item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="p-6 rounded-xl border border-destructive/30 bg-destructive/5">
              <h3 className="text-lg font-semibold mb-4 text-destructive">{t("partners.who.no")}</h3>
              <ul className="space-y-3">
                {noItems.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                    <X className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />{item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Final form */}
      <section id="partner-form" className="pb-20 px-6 scroll-mt-20">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">{t("partners.form.title")}</h2>
            <p className="text-muted-foreground">{t("partners.form.subtitle")}</p>
          </div>
          {submitted ? (
            <div className="p-8 rounded-lg border border-primary/30 bg-card text-center glow-border">
              <h3 className="text-2xl font-bold mb-3">{t("partners.form.thanks.title")}</h3>
              <p className="text-muted-foreground">{t("partners.form.thanks.body")}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-8 rounded-lg border border-border bg-card space-y-5">
              <div>
                <label className="block text-sm text-muted-foreground mb-1.5">{t("partners.form.name")}</label>
                <input name="name" type="text" required maxLength={100} className="w-full px-4 py-2.5 rounded-md bg-surface border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
              <div>
                <label className="block text-sm text-muted-foreground mb-1.5">{t("partners.form.company")}</label>
                <input name="company" type="text" required maxLength={100} className="w-full px-4 py-2.5 rounded-md bg-surface border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
              <div>
                <label className="block text-sm text-muted-foreground mb-1.5">{t("partners.form.role")}</label>
                <Select required value={role} onValueChange={setRole}>
                  <SelectTrigger className="w-full bg-surface border-border"><SelectValue placeholder={t("partners.form.role.placeholder")} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CEO">CEO</SelectItem>
                    <SelectItem value="CTO">CTO</SelectItem>
                    <SelectItem value="Head of Product">Head of Product</SelectItem>
                    <SelectItem value="Other">{t("partners.form.role.other")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm text-muted-foreground mb-1.5">{t("partners.form.email")}</label>
                <input name="email" type="email" required maxLength={255} className="w-full px-4 py-2.5 rounded-md bg-surface border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
              <div>
                <label className="block text-sm text-muted-foreground mb-1.5">{t("partners.form.workflows")}</label>
                <textarea name="workflows" rows={3} maxLength={1000} className="w-full px-4 py-2.5 rounded-md bg-surface border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none" />
              </div>
              <div>
                <label className="block text-sm text-muted-foreground mb-1.5">{t("partners.form.clients")}</label>
                <Select required value={clients} onValueChange={setClients}>
                  <SelectTrigger className="w-full bg-surface border-border"><SelectValue placeholder={t("partners.form.clients.placeholder")} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-10">1-10</SelectItem>
                    <SelectItem value="11-50">11-50</SelectItem>
                    <SelectItem value="50+">50+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <button type="submit" disabled={sending} className="w-full py-3 rounded-md bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity disabled:opacity-50">
                {sending ? t("partners.form.sending") : t("partners.form.submit")}
              </button>
              <p className="text-xs text-muted-foreground text-center">{t("partners.form.disclaimer")}</p>
            </form>
          )}

          <div className="mt-12 text-center">
            <p className="text-xs text-muted-foreground/70 uppercase tracking-wider mb-4">{t("partners.frameworks")}</p>
            <div className="flex flex-wrap justify-center gap-2">
              {frameworks.map((fw) => (
                <span key={fw} className="text-sm font-medium px-3 py-1.5 rounded-full border border-border bg-secondary/50 text-muted-foreground">{fw}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Partners;
