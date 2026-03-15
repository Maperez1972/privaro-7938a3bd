import { motion } from "framer-motion";
import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const BetaSection = () => {
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [role, setRole] = useState("");
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSending(true);
    setError("");
    const form = e.currentTarget;
    const formData = new FormData(form);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("send-demo-request", {
        body: { name: formData.get("name"), company: formData.get("company"), industry: formData.get("industry"), role, email: formData.get("email"), concern: formData.get("concern") },
      });
      if (fnError) throw fnError;
      if (data && !data.success) throw new Error(data.error);
      setSubmitted(true);
    } catch (err) {
      console.error("Error sending demo request:", err);
      setError(t("beta.form.error"));
    } finally {
      setSending(false);
    }
  };

  const audiences = [t("beta.a1"), t("beta.a2"), t("beta.a3"), t("beta.a4")];
  const textFields = [
    { name: "name", labelKey: "beta.form.name", type: "text" },
    { name: "company", labelKey: "beta.form.company", type: "text" },
    { name: "industry", labelKey: "beta.form.industry", type: "text" },
  ];
  const roleOptions = ["beta.form.role.ciso", "beta.form.role.cto", "beta.form.role.dpo", "beta.form.role.legal", "beta.form.role.other"];

  return (
    <section id="early-access" className="py-28 px-6 relative">
      <div className="absolute inset-0 grid-pattern opacity-20" />
      <div className="relative max-w-5xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
            <p className="text-primary text-sm font-medium uppercase tracking-widest mb-4">{t("beta.label")}</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("beta.title1")}<br /><span className="text-gradient">{t("beta.title2")}</span></h2>
            <p className="text-muted-foreground mb-8 leading-relaxed">{t("beta.subtitle")}</p>
            <p className="text-sm text-muted-foreground mb-4 font-medium uppercase tracking-wider">{t("beta.whoFor")}</p>
            <div className="flex flex-wrap gap-2">
              {audiences.map((a) => (<span key={a} className="px-3 py-1.5 text-sm rounded-md border border-border bg-surface text-surface-foreground">{a}</span>))}
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.15 }}>
            {submitted ? (
              <div className="p-8 rounded-lg border border-primary/30 bg-card text-center glow-border"><h3 className="text-2xl font-bold mb-3 text-foreground">{t("beta.thanks.title")}</h3><p className="text-muted-foreground">{t("beta.thanks.body")}</p></div>
            ) : (
              <form onSubmit={handleSubmit} className="p-8 rounded-lg border border-border bg-card space-y-5">
                <h3 className="text-xl font-semibold text-foreground mb-2">{t("beta.form.title")}</h3>
                {textFields.map((field) => (<div key={field.name}><label className="block text-sm text-muted-foreground mb-1.5">{t(field.labelKey)}</label><input name={field.name} type={field.type} required className="w-full px-4 py-2.5 rounded-md bg-surface border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow" /></div>))}
                <div><label className="block text-sm text-muted-foreground mb-1.5">{t("beta.form.role")}</label><Select required value={role} onValueChange={setRole}><SelectTrigger className="w-full bg-surface border-border text-foreground"><SelectValue placeholder={t("beta.form.role")} /></SelectTrigger><SelectContent>{roleOptions.map((key) => (<SelectItem key={key} value={t(key)}>{t(key)}</SelectItem>))}</SelectContent></Select></div>
                <div><label className="block text-sm text-muted-foreground mb-1.5">{t("beta.form.email")}</label><input name="email" type="email" required className="w-full px-4 py-2.5 rounded-md bg-surface border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow" /></div>
                <div><label className="block text-sm text-muted-foreground mb-1.5">{t("beta.form.aiQuestion")}</label><textarea name="concern" rows={3} className="w-full px-4 py-2.5 rounded-md bg-surface border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow resize-none" /></div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <button type="submit" disabled={sending} className="w-full py-3 rounded-md bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity disabled:opacity-50">{sending ? t("beta.form.sending") : t("beta.form.submit")}</button>
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
