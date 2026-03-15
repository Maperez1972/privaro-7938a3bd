import { motion } from "framer-motion";
import { ShieldOff, FileWarning, Unplug } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const RiskGapSection = () => {
  const { t, lang } = useLanguage();
  const gaps = [
    { icon: ShieldOff, label: t("riskgap.gap1") },
    { icon: FileWarning, label: t("riskgap.gap2") },
    { icon: Unplug, label: t("riskgap.gap3") },
  ];
  const conclusionWord = lang === "en" ? "exposure." : "exposición.";
  const conclusionBase = t("riskgap.conclusion").replace(conclusionWord, "");

  return (
    <section className="py-28 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.7 }} className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("riskgap.title1")}<br /><span className="text-gradient">{t("riskgap.title2")}</span></h2>
        </motion.div>
        <div className="grid md:grid-cols-3 gap-6">
          {gaps.map((gap, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.15 }} className="p-6 rounded-lg border border-border bg-card text-center">
              <gap.icon className="w-8 h-8 text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">{gap.label}</p>
            </motion.div>
          ))}
        </div>
        <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.5 }} className="text-center mt-12 text-2xl font-semibold text-foreground">
          {conclusionBase}<span className="text-gradient">{conclusionWord}</span>
        </motion.p>
      </div>
    </section>
  );
};

export default RiskGapSection;
