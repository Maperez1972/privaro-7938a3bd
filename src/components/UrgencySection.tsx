import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";

const UrgencySection = () => {
  const { t } = useLanguage();

  return (
    <section className="py-16 px-6">
      <div className="max-w-3xl mx-auto text-center">
        <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-2xl md:text-3xl font-bold mb-4">{t("urgency.title")}</motion.h2>
        <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.15 }} className="text-muted-foreground text-base md:text-lg leading-relaxed mb-3">{t("urgency.body1")}</motion.p>
        <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.3 }} className="text-foreground font-semibold text-base md:text-lg">{t("urgency.body2")}</motion.p>
      </div>
    </section>
  );
};

export default UrgencySection;
