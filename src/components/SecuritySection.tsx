import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Lock, Link2, Scale, Globe, FileSearch, ShieldAlert, ArrowRight } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const SecuritySection = () => {
  const { t } = useLanguage();
  const badges = [
    { icon: ShieldCheck, key: "sec.b2" },
    { icon: ShieldAlert, key: "sec.b6" },
    { icon: Lock, key: "sec.b1" },
    { icon: Link2, key: "sec.b3" },
    { icon: Scale, key: "sec.b4" },
    { icon: Globe, key: "sec.b5" },
  ];

  return (
    <section id="security" className="py-28 px-6 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.02] to-transparent" />
      <div className="relative max-w-4xl mx-auto text-center">
        <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.7 }}>
          <p className="text-primary text-sm font-medium uppercase tracking-widest mb-4">{t("sec.label")}</p>
          <h2 className="text-3xl md:text-5xl font-bold mb-12">{t("sec.title1")} <span className="text-gradient">{t("sec.title2")}</span></h2>
        </motion.div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {badges.map((b, i) => (
            <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.08 }} className="flex items-center gap-3 p-4 rounded-lg border border-border bg-card text-left">
              <b.icon className="w-5 h-5 text-primary flex-shrink-0" />
              <span className="text-sm text-foreground">{t(b.key)}</span>
            </motion.div>
          ))}
        </div>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.3 }} className="mt-14 max-w-5xl mx-auto">
          <div className="flex flex-col gap-4 md:hidden">
            {[
              { icon: Globe, titleKey: "sec.layer1.title", subKey: "sec.layer1.sub" },
              { icon: Lock, titleKey: "sec.layer2.title", subKey: "sec.layer2.sub", highlight: true },
              { icon: FileSearch, titleKey: "sec.layer3.title", subKey: "sec.layer3.sub" },
            ].map((layer, i) => (
              <div key={i} className={`p-5 rounded-xl border ${layer.highlight ? "border-primary/20" : "border-border"} bg-card/80 backdrop-blur-sm flex items-center gap-4`}>
                <div className={`w-9 h-9 rounded-lg ${layer.highlight ? "bg-primary/10 border border-primary/20" : "bg-muted/50 border border-border"} flex items-center justify-center flex-shrink-0`}>
                  <layer.icon className={`w-4 h-4 ${layer.highlight ? "text-primary" : "text-primary/70"}`} />
                </div>
                <div><p className="text-xs font-semibold text-foreground">{t(layer.titleKey)}</p><p className="text-[10px] text-muted-foreground mt-0.5">{t(layer.subKey)}</p></div>
              </div>
            ))}
          </div>
          <div className="hidden md:grid grid-cols-[1fr_auto_1fr_auto_1fr] gap-4 items-center">
            {[
              { icon: Globe, titleKey: "sec.layer1.title", subKey: "sec.layer1.sub", delay: 0.4 },
              { icon: Lock, titleKey: "sec.layer2.title", subKey: "sec.layer2.sub", delay: 0.5, highlight: true },
              { icon: FileSearch, titleKey: "sec.layer3.title", subKey: "sec.layer3.sub", delay: 0.6 },
            ].map((layer, i, arr) => (
              <React.Fragment key={i}>
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: layer.delay }} className={`relative rounded-xl border ${layer.highlight ? "border-primary/25" : "border-border"} bg-card/80 backdrop-blur-sm p-6 text-center group overflow-hidden hover:border-primary/30 transition-colors duration-300`}>
                  {layer.highlight && (<><div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-primary/5" /><div className="absolute -top-12 left-1/2 -translate-x-1/2 w-32 h-32 rounded-full bg-primary/5 blur-2xl" /></>)}
                  <div className="relative flex flex-col items-center">
                    <div className={`w-12 h-12 rounded-xl ${layer.highlight ? "bg-primary/10 border border-primary/20" : "bg-muted/50 border border-border"} flex items-center justify-center mb-4`}>
                      <layer.icon className={`w-5 h-5 ${layer.highlight ? "text-primary" : "text-primary/70"}`} />
                    </div>
                    <p className="text-sm font-semibold text-foreground mb-1">{t(layer.titleKey)}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{t(layer.subKey)}</p>
                  </div>
                </motion.div>
                {i < arr.length - 1 && <div className="flex items-center justify-center"><ArrowRight className="w-5 h-5 text-primary/40" /></div>}
              </React.Fragment>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default SecuritySection;
