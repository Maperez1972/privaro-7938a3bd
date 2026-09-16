import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/context/LanguageContext";

const alternatives = [
  { slug: "skyflow", label: "Privaro vs Skyflow" },
  { slug: "nightfall", label: "Privaro vs Nightfall" },
  { slug: "private-ai", label: "Privaro vs Private AI" },
];

const ComparisonTeaser = () => {
  const { t } = useLanguage();

  return (
    <section className="py-20 px-6">
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto rounded-2xl border border-border bg-card p-8 md:p-10 text-center"
      >
        <p className="text-primary text-sm font-medium uppercase tracking-widest mb-3">{t("compteaser.label")}</p>
        <h2 className="text-2xl md:text-3xl font-bold mb-3">{t("compteaser.title")}</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">{t("compteaser.subtitle")}</p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          {alternatives.map((a) => (
            <Link
              key={a.slug}
              to={`/vs/${a.slug}`}
              onClick={() => window.scrollTo({ top: 0 })}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md border border-border text-sm font-medium text-foreground hover:border-primary/50 hover:bg-secondary transition-colors"
            >
              {a.label}
              <ArrowRight className="w-3.5 h-3.5 text-primary" />
            </Link>
          ))}
        </div>
      </motion.div>
    </section>
  );
};

export default ComparisonTeaser;
