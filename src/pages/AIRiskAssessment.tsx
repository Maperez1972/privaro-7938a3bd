import { useState } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Seo from "@/components/Seo";
import Footer from "@/components/Footer";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/context/LanguageContext";
import {
  Eye, AlertTriangle, FileText, Shield,
  Plug, Search, BarChart,
  Users, EyeOff, Scale,
} from "lucide-react";

const AIRiskAssessmentPage = () => {
  const { t } = useLanguage();
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [role, setRole] = useState("");
  const [companySize, setCompanySize] = useState("");

  const whatYouGet = [
    { icon: Eye, title: t("assessment.what.1.title"), desc: t("assessment.what.1.desc") },
    { icon: AlertTriangle, title: t("assessment.what.2.title"), desc: t("assessment.what.2.desc") },
    { icon: FileText, title: t("assessment.what.3.title"), desc: t("assessment.what.3.desc") },
    { icon: Shield, title: t("assessment.what.4.title"), desc: t("assessment.what.4.desc") },
  ];

  const steps = [
    { icon: Plug, title: t("assessment.step1.title"), desc: t("assessment.step1.desc") },
    { icon: Search, title: t("assessment.step2.title"), desc: t("assessment.step2.desc") },
    { icon: BarChart, title: t("assessment.step3.title"), desc: t("assessment.step3.desc") },
  ];

  const whyMatters = [
    { icon: Users, title: t("assessment.why.1.title"), desc: t("assessment.why.1.desc") },
    { icon: EyeOff, title: t("assessment.why.2.title"), desc: t("assessment.why.2.desc") },
    { icon: Scale, title: t("assessment.why.3.title"), desc: t("assessment.why.3.desc") },
  ];

  const roleOptions = ["CISO", "CTO", "DPO", "Legal", "Compliance", t("assessment.form.role.other")];
  const sizeOptions = ["1-50", "51-200", "201-1000", "1000+"];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSending(true);
    setError("");
    const formData = new FormData(e.currentTarget);
    try {
      const concern = `AI tools used: ${formData.get("aiTools") || "Not specified"}\nCompany size: ${companySize || "Not specified"}\nSource: AI Risk Assessment landing`;
      const { data, error: fnError } = await supabase.functions.invoke("send-demo-request", {
        body: {
          name: formData.get("name"),
          company: formData.get("company"),
          industry: "AI Risk Assessment",
          role,
          email: formData.get("email"),
          concern,
        },
      });
      if (fnError) throw fnError;
      if (data && !data.success) throw new Error(data.error);
      setSubmitted(true);
    } catch (err) {
      console.error("Error sending assessment request:", err);
      setError(t("assessment.form.error"));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Seo title="Free AI Risk Assessment — Privaro" description="Get a free AI privacy risk assessment for your organization. Identify exposure across LLM workflows in minutes." path="/ai-risk-assessment" />
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-primary bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-6">
              {t("assessment.badge")}
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              {t("assessment.hero.title1")} <span className="text-primary">{t("assessment.hero.title2")}</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto whitespace-pre-line">
              {t("assessment.hero.subtitle")}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
              <a href="#assessment-form" className="px-8 py-3.5 rounded-md bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity">
                {t("assessment.hero.cta1")}
              </a>
              <a href="#sample-report" className="px-8 py-3.5 rounded-md border border-border bg-card text-foreground font-semibold hover:bg-secondary/50 transition-colors">
                {t("assessment.hero.cta2")}
              </a>
            </div>
            <p className="text-sm text-muted-foreground/80 mt-4">{t("assessment.hero.disclaimer")}</p>
          </motion.div>
        </div>
      </section>

      {/* What You Get */}
      <section className="pb-20 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-2xl md:text-3xl font-bold text-center mb-12">
            {t("assessment.what.title")}
          </motion.h2>
          <div className="grid md:grid-cols-2 gap-6">
            {whatYouGet.map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="p-6 rounded-xl border border-border bg-card hover:border-primary/40 transition-colors">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-5">
                  <item.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="pb-20 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-2xl md:text-3xl font-bold text-center mb-3">
            {t("assessment.how.title")}
          </motion.h2>
          <div className="flex justify-center mb-12">
            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-primary bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5">
              {t("assessment.how.timeframe")}
            </span>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {steps.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="p-6 rounded-xl border border-border bg-card text-center">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-5">
                  <s.icon className="h-6 w-6 text-primary" />
                </div>
                <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">{t("assessment.step.label")} {i + 1}</p>
                <h3 className="text-lg font-semibold mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Sample Output */}
      <section id="sample-report" className="pb-20 px-6 scroll-mt-24">
        <div className="max-w-3xl mx-auto">
          <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-2xl md:text-3xl font-bold text-center mb-12">
            {t("assessment.sample.title")}
          </motion.h2>
          <div className="rounded-xl border border-border bg-card p-8 font-mono text-sm">
            <p className="text-primary font-bold mb-4">{t("assessment.sample.header")}</p>
            <div className="space-y-3 text-muted-foreground">
              <p><span className="text-red-400 font-bold">● {t("assessment.sample.high")}</span>   {t("assessment.sample.line1")}</p>
              <p><span className="text-orange-400 font-bold">● {t("assessment.sample.medium")}  </span>   {t("assessment.sample.line2")}</p>
              <p><span className="text-yellow-400 font-bold">● {t("assessment.sample.medium")}  </span>   {t("assessment.sample.line3")}</p>
              <p><span className="text-blue-400 font-bold">● {t("assessment.sample.low")}     </span>   {t("assessment.sample.line4")}</p>
              <p className="pt-3 border-t border-border text-xs">{t("assessment.sample.workflows")}</p>
              <p className="text-xs">{t("assessment.sample.recommended")}</p>
            </div>
            <p className="text-xs text-muted-foreground/60 mt-4 italic">{t("assessment.sample.disclaimer")}</p>
          </div>
        </div>
      </section>

      {/* Why It Matters */}
      <section className="pb-20 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-2xl md:text-3xl font-bold text-center mb-12">
            {t("assessment.why.title")}
          </motion.h2>
          <div className="grid md:grid-cols-3 gap-6">
            {whyMatters.map((c, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="p-6 rounded-xl border border-border bg-card">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-5">
                  <c.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{c.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{c.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Form */}
      <section id="assessment-form" className="py-20 px-6 scroll-mt-24 relative">
        <div className="absolute inset-0 grid-pattern opacity-20" />
        <div className="relative max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-3xl md:text-4xl font-bold mb-4">
              {t("assessment.form.title1")} <span className="text-gradient">{t("assessment.form.title2")}</span>
            </motion.h2>
            <p className="text-muted-foreground">{t("assessment.form.subtitle")}</p>
          </div>
          {submitted ? (
            <div className="p-8 rounded-lg border border-primary/30 bg-card text-center glow-border">
              <h3 className="text-2xl font-bold mb-3 text-foreground">{t("assessment.form.thanks.title")}</h3>
              <p className="text-muted-foreground">{t("assessment.form.thanks.body")}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-8 rounded-lg border border-border bg-card space-y-5">
              <div>
                <label className="block text-sm text-muted-foreground mb-1.5">{t("assessment.form.name")}</label>
                <input name="name" type="text" required className="w-full px-4 py-2.5 rounded-md bg-surface border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
              <div>
                <label className="block text-sm text-muted-foreground mb-1.5">{t("assessment.form.company")}</label>
                <input name="company" type="text" required className="w-full px-4 py-2.5 rounded-md bg-surface border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
              <div>
                <label className="block text-sm text-muted-foreground mb-1.5">{t("assessment.form.role")}</label>
                <Select required value={role} onValueChange={setRole}>
                  <SelectTrigger className="w-full bg-surface border-border text-foreground"><SelectValue placeholder={t("assessment.form.role.placeholder")} /></SelectTrigger>
                  <SelectContent>{roleOptions.map((r) => (<SelectItem key={r} value={r}>{r}</SelectItem>))}</SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm text-muted-foreground mb-1.5">{t("assessment.form.email")}</label>
                <input name="email" type="email" required className="w-full px-4 py-2.5 rounded-md bg-surface border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
              <div>
                <label className="block text-sm text-muted-foreground mb-1.5">{t("assessment.form.size")} <span className="text-muted-foreground/60">({t("assessment.form.optional")})</span></label>
                <Select value={companySize} onValueChange={setCompanySize}>
                  <SelectTrigger className="w-full bg-surface border-border text-foreground"><SelectValue placeholder={t("assessment.form.size.placeholder")} /></SelectTrigger>
                  <SelectContent>{sizeOptions.map((s) => (<SelectItem key={s} value={s}>{s}</SelectItem>))}</SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm text-muted-foreground mb-1.5">{t("assessment.form.tools")} <span className="text-muted-foreground/60">({t("assessment.form.optional")})</span></label>
                <textarea name="aiTools" rows={3} className="w-full px-4 py-2.5 rounded-md bg-surface border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none" />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <button type="submit" disabled={sending} className="w-full py-3 rounded-md bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity disabled:opacity-50">
                {sending ? t("assessment.form.sending") : t("assessment.form.submit")}
              </button>
              <p className="text-xs text-muted-foreground text-center">{t("assessment.form.disclaimer")}</p>
            </form>
          )}
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-2xl md:text-3xl font-bold mb-4">
            {t("assessment.cta.title")}
          </motion.h2>
          <p className="text-muted-foreground mb-8">{t("assessment.cta.subtitle")}</p>
          <a href="#assessment-form" className="inline-block px-8 py-3.5 rounded-md bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity">
            {t("assessment.cta.button")}
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AIRiskAssessmentPage;
