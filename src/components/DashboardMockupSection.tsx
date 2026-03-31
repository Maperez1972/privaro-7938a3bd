import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import featureDashboardEn from "@/assets/feature-dashboard.webp";
import featureChatEn from "@/assets/feature-chat.webp";
import featureEnginesEn from "@/assets/feature-engines.webp";
import featureDashboardEs from "@/assets/feature-dashboard-es.webp";
import featureChatEs from "@/assets/feature-chat-es.webp";
import featureEnginesEs from "@/assets/feature-engines-es.webp";

const DashboardMockupSection = () => {
  const { t, lang } = useLanguage();
  const subsections = [
    { titleKey: "dash.sub1.title", descKey: "dash.sub1.desc", image: lang === "es" ? featureDashboardEs : featureDashboardEn, alt: "Privaura Dashboard", imageFirst: false },
    { titleKey: "dash.sub2.title", descKey: "dash.sub2.desc", image: lang === "es" ? featureChatEs : featureChatEn, alt: "Privaura AI Chat", imageFirst: true },
    { titleKey: "dash.sub3.title", descKey: "dash.sub3.desc", image: lang === "es" ? featureEnginesEs : featureEnginesEn, alt: "Privaura Engine Configuration", imageFirst: false },
  ];

  return (
    <section className="py-28 px-6 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none"><div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-primary/[0.03] rounded-full blur-[120px]" /></div>
      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.7 }} className="text-center mb-20">
          <p className="text-primary text-sm font-medium uppercase tracking-widest mb-4">{t("dash.label")}</p>
          <h2 className="text-3xl md:text-5xl font-bold">{t("dash.title1")} <span className="text-gradient">{t("dash.title2")}</span></h2>
          <p className="text-muted-foreground mt-4 max-w-xl mx-auto text-sm md:text-base">{t("dash.subtitle")}</p>
        </motion.div>
        <div className="space-y-24">
          {subsections.map((sub, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.7, delay: 0.1 }} className={`flex flex-col ${sub.imageFirst ? "md:flex-row" : "md:flex-row-reverse"} items-center gap-10 md:gap-16`}>
              <motion.div className="w-full md:w-[55%] shrink-0" initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.7, delay: 0.2 }}>
                <div className="rounded-xl border border-border bg-card overflow-hidden shadow-2xl shadow-primary/[0.05] relative">
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
                  <img src={sub.image} alt={sub.alt} className="w-full h-auto" loading="lazy" width={1920} height={1080} />
                  <div className="h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
                </div>
              </motion.div>
              <div className="w-full md:w-[45%]">
                <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">{t(sub.titleKey)}</h3>
                <p className="text-muted-foreground text-sm md:text-base leading-relaxed">{t(sub.descKey)}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DashboardMockupSection;
