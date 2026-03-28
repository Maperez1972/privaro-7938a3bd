import { motion } from "framer-motion";
import { Shield, Bot } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/context/LanguageContext";

const HeroSection = () => {
  const { t } = useLanguage();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 grid-pattern opacity-40" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-primary/5 blur-[120px] animate-pulse-glow" />
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center pt-24">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}>
          <div className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full border border-border bg-surface/50 text-sm text-muted-foreground">
            <Shield className="w-4 h-4 text-primary" />
            {t("hero.badge")}
            <span className="text-border mx-1">·</span>
            <Bot className="w-3.5 h-3.5 text-amber-400" />
            <Link
              to="/use-cases/agents"
              className="text-amber-400 hover:text-amber-300 transition-colors font-medium"
            >
              New: Agent Privacy Layer
            </Link>
          </div>
        </motion.div>
        <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.4 }} className="text-5xl md:text-7xl font-extrabold leading-[1.05] mb-6">
          {t("hero.title1")}<br /><span className="text-gradient">{t("hero.title2")}</span>
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.6 }} className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
          {t("hero.subtitle")}
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.8 }} className="flex flex-col items-center justify-center gap-2">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="#early-access" className="px-8 py-3.5 rounded-md bg-primary text-primary-foreground font-semibold text-base hover:opacity-90 transition-opacity glow-border">{t("hero.cta1")}</a>
            <a href="#how-it-works" className="px-8 py-3.5 rounded-md border border-border text-foreground font-medium text-base hover:bg-secondary transition-colors">{t("hero.cta2")}</a>
          </div>
          <p className="text-sm text-muted-foreground mt-2">{t("hero.disclaimer")}</p>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
