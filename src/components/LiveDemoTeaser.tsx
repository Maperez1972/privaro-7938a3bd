import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { PlayCircle, ShieldCheck, Sparkles } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { trackEvent } from "@/lib/analytics";

const LiveDemoTeaser = () => {
  const { t } = useLanguage();

  return (
    <section id="live-demo" className="py-20 px-6 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-primary/[0.05] rounded-full blur-[120px]" />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto relative z-10 rounded-2xl border border-primary/30 bg-card/60 backdrop-blur-sm p-8 md:p-12 text-center"
      >
        <p className="text-primary text-sm font-medium uppercase tracking-widest mb-4">
          {t("liveDemo.label")}
        </p>
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          {t("liveDemo.title1")} <span className="text-gradient">{t("liveDemo.title2")}</span>
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto mb-8 text-sm md:text-base leading-relaxed">
          {t("liveDemo.subtitle")}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/demo"
            onClick={() => trackEvent("demo_teaser_click", { event_category: "engagement", event_label: "home_live_demo" })}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-md bg-primary text-primary-foreground font-semibold text-base hover:opacity-90 transition-opacity glow-border"
          >
            <PlayCircle className="w-5 h-5" />
            {t("liveDemo.cta")}
          </Link>
          <Link
            to="/auth"
            className="px-8 py-3.5 rounded-md border border-border text-foreground font-medium text-base hover:bg-secondary transition-colors"
          >
            {t("liveDemo.cta2")}
          </Link>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-6 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-primary" />
            {t("liveDemo.note1")}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            {t("liveDemo.note2")}
          </span>
        </div>
      </motion.div>
    </section>
  );
};

export default LiveDemoTeaser;
