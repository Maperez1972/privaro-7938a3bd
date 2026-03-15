import { motion } from "framer-motion";
import { FileInput, Brain, KeyRound, Server, ArrowRight, ArrowDown, Shield } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const HowItWorksSection = () => {
  const { t } = useLanguage();
  const steps = [
    { icon: FileInput, number: "01", titleKey: "how.step1.title", descKey: "how.step1.desc" },
    { icon: Brain, number: "02", titleKey: "how.step2.title", descKey: "how.step2.desc" },
    { icon: KeyRound, number: "03", titleKey: "how.step3.title", descKey: "how.step3.desc" },
    { icon: Server, number: "04", titleKey: "how.step4.title", descKey: "how.step4.desc" },
  ];

  return (
    <section id="how-it-works" className="py-28 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.7 }} className="text-center mb-16">
          <p className="text-primary text-sm font-medium uppercase tracking-widest mb-4">{t("how.label")}</p>
          <h2 className="text-3xl md:text-5xl font-bold">{t("how.title1")} <span className="text-gradient">{t("how.title2")}</span></h2>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }} className="relative mb-16">
          <div className="absolute inset-0 grid-pattern opacity-30 rounded-xl" />
          <div className="relative flex flex-col md:flex-row items-center justify-center gap-4 md:gap-0 py-12 px-6">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.3 }} className="flex-shrink-0 w-56 p-6 rounded-xl border border-border bg-card/80 backdrop-blur-sm text-center relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-muted/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative">
                <div className="w-10 h-10 rounded-lg bg-muted/50 border border-border flex items-center justify-center mx-auto mb-3"><FileInput className="w-5 h-5 text-muted-foreground" /></div>
                <p className="text-sm font-semibold text-foreground">{t("how.arch.enterprise")}</p>
                <p className="text-xs text-muted-foreground mt-1.5">{t("how.arch.enterpriseSub")}</p>
              </div>
            </motion.div>
            <div className="hidden md:flex items-center px-2"><motion.div initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: 0.5 }} className="origin-left"><div className="flex items-center"><div className="w-16 h-px bg-gradient-to-r from-border to-primary/50" /><ArrowRight className="w-4 h-4 text-primary/60 -ml-1" /></div></motion.div></div>
            <div className="md:hidden flex justify-center"><motion.div initial={{ scaleY: 0 }} whileInView={{ scaleY: 1 }} viewport={{ once: true }} transition={{ duration: 0.3, delay: 0.5 }} className="origin-top"><div className="flex flex-col items-center"><div className="w-px h-8 bg-gradient-to-b from-border to-primary/50" /><ArrowDown className="w-4 h-4 text-primary/60 -mt-1" /></div></motion.div></div>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.45 }} className="flex-shrink-0 w-64 p-6 rounded-xl border border-primary/30 bg-card/80 backdrop-blur-sm text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5" />
              <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-primary/5 blur-3xl" />
              <div className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full bg-primary/5 blur-3xl" />
              <div className="relative">
                <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-3"><Shield className="w-5 h-5 text-primary" /></div>
                <p className="text-sm font-semibold text-primary">{t("how.arch.privaura")}</p>
                <div className="flex items-center justify-center gap-2 mt-2 flex-wrap">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary/80">{t("how.badge.detection")}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary/80">{t("how.badge.anonymization")}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary/80">{t("how.badge.logging")}</span>
                </div>
              </div>
            </motion.div>
            <div className="hidden md:flex items-center px-2"><motion.div initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: 0.6 }} className="origin-left"><div className="flex items-center"><div className="w-16 h-px bg-gradient-to-r from-primary/50 to-border" /><ArrowRight className="w-4 h-4 text-muted-foreground -ml-1" /></div></motion.div></div>
            <div className="md:hidden flex justify-center"><motion.div initial={{ scaleY: 0 }} whileInView={{ scaleY: 1 }} viewport={{ once: true }} transition={{ duration: 0.3, delay: 0.6 }} className="origin-top"><div className="flex flex-col items-center"><div className="w-px h-8 bg-gradient-to-b from-primary/50 to-border" /><ArrowDown className="w-4 h-4 text-muted-foreground -mt-1" /></div></motion.div></div>
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.55 }} className="flex-shrink-0 w-56 p-6 rounded-xl border border-border bg-card/80 backdrop-blur-sm text-center relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-muted/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative">
                <div className="w-10 h-10 rounded-lg bg-muted/50 border border-border flex items-center justify-center mx-auto mb-3"><Server className="w-5 h-5 text-muted-foreground" /></div>
                <p className="text-sm font-semibold text-foreground">{t("how.arch.aiModel")}</p>
                <p className="text-xs text-muted-foreground mt-1.5">OpenAI • Azure • Copilot</p>
              </div>
            </motion.div>
          </div>
        </motion.div>
        <div className="grid md:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.12 }} className="relative p-6 rounded-lg border border-border bg-card group hover:border-primary/30 transition-colors">
              <span className="text-5xl font-extrabold text-primary/10 absolute top-4 right-4 group-hover:text-primary/20 transition-colors">{step.number}</span>
              <step.icon className="w-8 h-8 text-primary mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">{t(step.titleKey)}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{t(step.descKey)}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
