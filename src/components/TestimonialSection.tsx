import { motion } from "framer-motion";
import { ShieldCheck, Lock, FileCheck, Quote } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/context/LanguageContext";

const TestimonialSection = () => {
  const { t } = useLanguage();
  const badges = [
    { icon: Lock, key: "proof.badge1" },
    { icon: ShieldCheck, key: "proof.badge2" },
    { icon: FileCheck, key: "proof.badge3" },
  ];
  const initials = "SG";

  return (
    <section className="py-24 px-6 relative overflow-hidden">
      {/* Ambient glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="relative bg-card border border-border rounded-[2.5rem] overflow-hidden shadow-2xl"
        >
          {/* Top glow stripe */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

          {/* Massive translucent quote marks as structural backdrop */}
          <Quote
            className="absolute -top-4 -left-4 w-48 h-48 text-primary/10 rotate-180 pointer-events-none"
            strokeWidth={1}
          />
          <Quote
            className="absolute -bottom-4 -right-4 w-48 h-48 text-primary/10 pointer-events-none"
            strokeWidth={1}
          />

          <div className="relative p-10 md:p-16 flex flex-col items-center text-center">
            {/* Small accent quote icon */}
            <div className="mb-8">
              <Quote className="w-10 h-10 text-primary/60 fill-current" strokeWidth={1.5} />
            </div>

            <blockquote>
              <p className="text-xl md:text-2xl font-medium text-foreground leading-relaxed tracking-tight mb-10">
                {t("proof.quote")}
              </p>
            </blockquote>

            {/* Author meta */}
            <div className="flex flex-col items-center mb-12">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/40 p-[2px] mb-4 shadow-lg shadow-primary/20">
                <div className="w-full h-full rounded-full bg-card flex items-center justify-center">
                  <span className="text-xl font-bold text-foreground">{initials}</span>
                </div>
              </div>
              <cite className="not-italic">
                <span className="block text-lg font-bold text-foreground tracking-wide">
                  Sergio González
                </span>
                <span className="block text-sm text-primary/80 font-medium uppercase tracking-widest mt-1">
                  {t("proof.role")} ·{" "}
                  <a
                    href="https://octupus.es"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-primary transition-colors underline decoration-primary/30 underline-offset-4"
                  >
                    octupus.es
                  </a>
                </span>
              </cite>
            </div>

            {/* Trust badges */}
            <div className="w-full pt-10 border-t border-border/50">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {badges.map((b, i) => (
                  <motion.div
                    key={b.key}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.08 }}
                    className="flex flex-col items-center group"
                  >
                    <div className="mb-3 p-3 rounded-2xl bg-secondary/60 border border-border group-hover:border-primary/50 transition-colors duration-500">
                      <b.icon className="w-6 h-6 text-primary" strokeWidth={1.5} />
                    </div>
                    <span className="text-[11px] uppercase tracking-wider text-muted-foreground leading-snug max-w-[180px]">
                      {t(b.key)}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Accent corner decor */}
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-primary/10 to-transparent pointer-events-none" />
        </motion.div>
      </div>
    </section>
  );
};

export default TestimonialSection;
