import { motion } from "framer-motion";
import { X, Check } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const ComparisonSection = () => {
  const { t } = useLanguage();
  const rows = [
    { featureKey: "comp.row1.feature", dlpKey: "comp.row1.dlp", privKey: "comp.row1.privaura" },
    { featureKey: "comp.row2.feature", dlpKey: "comp.row2.dlp", privKey: "comp.row2.privaura" },
    { featureKey: "comp.row3.feature", dlpKey: "comp.row3.dlp", privKey: "comp.row3.privaura" },
    { featureKey: "comp.row4.feature", dlpKey: "comp.row4.dlp", privKey: "comp.row4.privaura" },
  ];

  return (
    <section className="py-28 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.7 }} className="text-center mb-16">
          <p className="text-primary text-sm font-medium uppercase tracking-widest mb-4">{t("comp.label")}</p>
          <h2 className="text-3xl md:text-4xl font-bold">{t("comp.title1")} <span className="text-gradient">{t("comp.title2")}</span></h2>
        </motion.div>
        <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="text-center text-muted-foreground text-lg leading-relaxed max-w-2xl mx-auto mb-12 whitespace-pre-line">
          {t("comp.subtitle").split("\n").map((line, i, arr) => {
            const highlight = t("comp.highlight");
            return (
              <span key={i}>
                {line.includes(highlight) ? (<>{line.split(highlight)[0]}<span className="text-foreground font-semibold">{highlight}</span>{line.split(highlight)[1]}</>) : line}
                {i < arr.length - 1 && <br />}
              </span>
            );
          })}
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="rounded-lg border border-border overflow-hidden">
          <div className="grid grid-cols-3 bg-surface text-sm font-semibold">
            <div className="p-4 text-muted-foreground">{t("comp.col.feature")}</div>
            <div className="p-4 text-muted-foreground text-center">{t("comp.col.dlp")}</div>
            <div className="p-4 text-primary text-center">{t("comp.col.privaura")}</div>
          </div>
          {rows.map((row, i) => (
            <div key={i} className="grid grid-cols-3 border-t border-border text-sm">
              <div className="p-4 text-foreground font-medium">{t(row.featureKey)}</div>
              <div className="p-4 text-muted-foreground text-center flex items-center justify-center gap-2"><X className="w-4 h-4 text-destructive flex-shrink-0" />{t(row.dlpKey)}</div>
              <div className="p-4 text-foreground text-center flex items-center justify-center gap-2"><Check className="w-4 h-4 text-primary flex-shrink-0" />{t(row.privKey)}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default ComparisonSection;
