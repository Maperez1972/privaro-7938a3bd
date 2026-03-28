import { motion } from "framer-motion";
import { Scale, HeartPulse, BarChart3, Bot, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/context/LanguageContext";

const cases = [
  { icon: Scale, titleKey: "usecases.legal.title", descKey: "usecases.legal.desc", href: "/use-cases/legal", accent: "from-primary/20 to-primary/5", border: "border-primary/20 hover:border-primary/50", iconBg: "bg-primary/10", iconColor: "text-primary", tag: "Legal" },
  { icon: HeartPulse, titleKey: "usecases.health.title", descKey: "usecases.health.desc", href: "/use-cases/health", accent: "from-emerald-500/20 to-emerald-500/5", border: "border-emerald-500/20 hover:border-emerald-500/50", iconBg: "bg-emerald-500/10", iconColor: "text-emerald-400", tag: "Healthcare" },
  { icon: BarChart3, titleKey: "usecases.finance.title", descKey: "usecases.finance.desc", href: "/use-cases/fintech", accent: "from-sky-500/20 to-sky-500/5", border: "border-sky-500/20 hover:border-sky-500/50", iconBg: "bg-sky-500/10", iconColor: "text-sky-400", tag: "Fintech & Finance" },
  { icon: Bot, titleKey: "usecases.agents.title", descKey: "usecases.agents.desc", href: "/use-cases/agents", accent: "from-amber-500/20 to-amber-500/5", border: "border-amber-500/20 hover:border-amber-500/50", iconBg: "bg-amber-500/10", iconColor: "text-amber-400", tag: "AI Agents" },
];

const UseCasesSection = () => {
  const { t } = useLanguage();

  return (
    <section id="use-cases" className="py-28 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.7 }} className="text-center mb-16">
          <p className="text-primary text-sm font-medium uppercase tracking-widest mb-4">{t("usecases.label")}</p>
          <h2 className="text-3xl md:text-5xl font-bold mb-4">{t("usecases.title1")} <span className="text-gradient">{t("usecases.title2")}</span></h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">{t("usecases.subtitle")}</p>
        </motion.div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cases.map((c, i) => {
            const Icon = c.icon;
            return (
              <motion.div key={c.href} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.6, delay: i * 0.12 }}>
                <Link to={c.href} className={`group flex flex-col h-full rounded-xl border ${c.border} bg-surface/40 backdrop-blur-sm overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5`}>
                  <div className={`h-1 w-full bg-gradient-to-r ${c.accent}`} />
                  <div className="p-7 flex flex-col flex-1">
                    <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-5">{c.tag}</span>
                    <div className={`w-12 h-12 rounded-lg ${c.iconBg} flex items-center justify-center mb-5`}><Icon className={`w-6 h-6 ${c.iconColor}`} /></div>
                    <h3 className="text-xl font-bold text-foreground mb-3 leading-snug">{t(c.titleKey)}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed flex-1">{t(c.descKey)}</p>
                    <div className={`mt-6 flex items-center gap-2 text-sm font-medium ${c.iconColor} group-hover:gap-3 transition-all duration-200`}>{t("usecases.explore")}<ArrowRight className="w-4 h-4" /></div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default UseCasesSection;
