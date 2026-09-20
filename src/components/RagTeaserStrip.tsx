import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FileStack, ArrowRight } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const RagTeaserStrip = () => {
  const { t } = useLanguage();

  return (
    <section className="py-6 px-6 border-y border-border bg-surface/20">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-3 text-center sm:text-left"
      >
        <FileStack className="w-5 h-5 text-primary flex-shrink-0" />
        <p className="text-sm text-muted-foreground">
          <span className="text-foreground font-medium">{t("ragTeaser.text")}</span>
        </p>
        <Link
          to="/rag-pii-protection"
          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline underline-offset-2 whitespace-nowrap"
        >
          {t("ragTeaser.link")} <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </motion.div>
    </section>
  );
};

export default RagTeaserStrip;
