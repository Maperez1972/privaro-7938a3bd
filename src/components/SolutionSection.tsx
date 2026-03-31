import { motion } from "framer-motion";
import { Search, Lock, FileCheck, Activity } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import solutionImageEn from "@/assets/solution-protected-flow.webp";
import solutionImageEs from "@/assets/solution-protected-flow-es.webp";

const SolutionSection = () => {
  const { t, lang } = useLanguage();
  const features = [
    { icon: Search, key: "solution.f1" },
    { icon: Lock, key: "solution.f2" },
    { icon: FileCheck, key: "solution.f3" },
    { icon: Activity, key: "solution.f4" },
  ];

  return (
    <section id="solution" className="py-28 px-6 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.02] to-transparent" />
      <div className="relative max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.7 }} className="text-center mb-16">
          <p className="text-primary text-sm font-medium uppercase tracking-widest mb-4">{t("solution.label")}</p>
          <h2 className="text-3xl md:text-5xl font-bold mb-6">{t("solution.title").split("—")[0]}— <span className="text-gradient">{t("solution.title").split("—")[1]}</span></h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{t("solution.subtitle")}</p>
        </motion.div>
        <div className="grid sm:grid-cols-2 gap-5 max-w-3xl mx-auto">
          {features.map((f, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }} className="flex items-center gap-4 p-5 rounded-lg border border-border bg-card">
              <div className="flex-shrink-0 w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center"><f.icon className="w-5 h-5 text-primary" /></div>
              <p className="text-foreground font-medium">{t(f.key)}</p>
            </motion.div>
          ))}
        </div>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.7, delay: 0.3 }} className="mt-10">
          <img src={lang === "es" ? solutionImageEs : solutionImageEn} alt={lang === "en" ? "Diagram showing enterprise data flowing securely through Privaura privacy layer to AI model" : "Diagrama mostrando datos empresariales fluyendo de forma segura a través de la capa de privacidad Privaura hacia el modelo de IA"} className="w-full max-w-3xl mx-auto rounded-xl border border-border" loading="lazy" width={1344} height={768} />
        </motion.div>
        <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.5 }} className="text-center mt-12 text-xl text-muted-foreground">
          {t("solution.conclusion1")} <span className="text-foreground font-semibold">{t("solution.conclusion2")}</span>
        </motion.p>
      </div>
    </section>
  );
};

export default SolutionSection;
