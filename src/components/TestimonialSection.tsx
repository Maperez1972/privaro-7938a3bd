import { motion } from "framer-motion";
import { Quote, ShieldCheck, Lock, FileCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/context/LanguageContext";

const TestimonialSection = () => {
  const { t } = useLanguage();
  const badges = [
    { icon: Lock, key: "proof.badge1" },
    { icon: ShieldCheck, key: "proof.badge2" },
    { icon: FileCheck, key: "proof.badge3" },
  ];

  return (
    <section className="py-24 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.blockquote
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="relative p-8 md:p-10 rounded-2xl border border-border bg-card"
        >
          <Quote className="w-8 h-8 text-primary/40 mb-5" />
          <p className="text-lg md:text-xl text-foreground leading-relaxed">{t("proof.quote")}</p>
          <footer className="mt-6 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
            <span className="font-semibold text-foreground">Sergio González</span>
            <span className="hidden sm:inline text-border">·</span>
            <span className="text-sm text-muted-foreground">{t("proof.role")}</span>
            <span className="hidden sm:inline text-border">·</span>
            <a
              href="https://octupus.es"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline"
            >
              octupus.es
            </a>
          </footer>
        </motion.blockquote>

        <div className="mt-8 grid sm:grid-cols-3 gap-4">
          {badges.map((b, i) => (
            <motion.div
              key={b.key}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
            >
              <Link
                to="/security"
                onClick={() => window.scrollTo({ top: 0 })}
                className="flex items-center gap-3 p-4 rounded-lg border border-border bg-surface/40 hover:border-primary/40 transition-colors h-full"
              >
                <b.icon className="w-5 h-5 text-primary flex-shrink-0" />
                <span className="text-sm text-foreground">{t(b.key)}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialSection;
