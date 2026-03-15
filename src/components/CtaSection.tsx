import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";

const CtaSection = () => {
  const { t } = useLanguage();

  return (
    <section id="demo" className="py-28 px-6">
      <div className="max-w-3xl mx-auto text-center">
        <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.7 }}>
          <h2 className="text-3xl md:text-5xl font-bold mb-6">{t("cta.title1")} <span className="text-gradient">{t("cta.title2")}</span></h2>
          <p className="text-muted-foreground text-lg mb-10">{t("cta.subtitle")}</p>
          <a href="#early-access" className="inline-block px-10 py-4 rounded-md bg-primary text-primary-foreground font-semibold text-lg hover:opacity-90 transition-opacity glow-border">{t("cta.btn")}</a>
        </motion.div>
      </div>
    </section>
  );
};

export default CtaSection;
