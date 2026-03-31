import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import problemImageEn from "@/assets/problem-data-exposure.jpg";
import problemImageEs from "@/assets/problem-data-exposure-es.jpg";

const ProblemSection = () => {
  const { t, lang } = useLanguage();
  const p2Bold = lang === "en" ? "responsibility remains fully with your organization." : "la responsabilidad recae completamente en tu organización.";

  return (
    <section id="problem" className="py-28 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.7 }}>
          <div className="inline-flex items-center gap-2 mb-6 text-primary text-sm font-medium uppercase tracking-widest mx-auto justify-center w-full">
            <AlertTriangle className="w-4 h-4" />
            {t("problem.label")}
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-8 leading-tight text-center">
            {t("problem.title1")}<br /><span className="text-gradient">{t("problem.title2")}</span>
          </h2>
          <div className="space-y-5 text-lg text-muted-foreground leading-relaxed max-w-3xl text-center mx-auto">
            <p>{t("problem.p1")}</p>
            <div className="mt-4 px-5 py-3 rounded-lg border border-primary/15 bg-primary/5 text-sm text-foreground/80 italic">{t("problem.example")}</div>
          </div>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.7, delay: 0.2 }} className="mt-8">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4 text-center">{t("riskgap.diagramLabel")}</p>
            <img src={lang === "es" ? problemImageEs : problemImageEn} alt={lang === "en" ? "Diagram showing sensitive data flowing uncontrolled into AI systems" : "Diagrama mostrando datos sensibles fluyendo sin control hacia sistemas de IA"} className="w-full max-w-3xl mx-auto rounded-xl border border-border" loading="lazy" width={1920} height={1080} />
          </motion.div>
          <div className="space-y-5 mt-8 text-lg text-muted-foreground leading-relaxed max-w-3xl text-center mx-auto">
            <p>{t("problem.p2").split(p2Bold)[0]}<span className="text-foreground font-semibold">{p2Bold}</span></p>
            <p>{t("problem.p3")}</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ProblemSection;
