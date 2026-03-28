import { motion } from "framer-motion";
import { Link2, ShieldCheck, FileCheck, Clock, Hash, Fingerprint } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const BlockchainSection = () => {
  const { t } = useLanguage();
  const features = [
    { icon: Hash, key: "blockchain.f1" },
    { icon: Clock, key: "blockchain.f2" },
    { icon: FileCheck, key: "blockchain.f3" },
    { icon: Fingerprint, key: "blockchain.f4" },
  ];

  return (
    <section id="blockchain" className="py-28 px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.03] to-transparent" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/[0.02] blur-3xl" />
      <div className="relative max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.7 }} className="text-center mb-16">
          <p className="text-primary text-sm font-medium uppercase tracking-widest mb-4">{t("blockchain.label")}</p>
          <h2 className="text-3xl md:text-5xl font-bold mb-6">{t("blockchain.title1")} <span className="text-gradient">{t("blockchain.title2")}</span></h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg leading-relaxed">{t("blockchain.subtitle")}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }} className="relative rounded-2xl border border-primary/20 bg-card/80 backdrop-blur-sm p-8 md:p-10 mb-12">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 via-transparent to-primary/5" />
          <div className="relative">
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6">
              {[
                { icon: ShieldCheck, labelKey: "blockchain.flow1", subKey: "blockchain.flow1sub" },
                { icon: Link2, labelKey: "blockchain.flow2", subKey: "blockchain.flow2sub" },
                { icon: FileCheck, labelKey: "blockchain.flow3", subKey: "blockchain.flow3sub" },
              ].map((step, i, arr) => (
                <div key={i} className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
                  <div className="flex flex-col items-center text-center max-w-[200px]">
                    <div className="w-14 h-14 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-3"><step.icon className="w-6 h-6 text-primary" /></div>
                    <p className="text-sm font-semibold text-foreground">{t(step.labelKey)}</p>
                    <p className="text-xs text-muted-foreground mt-1">{t(step.subKey)}</p>
                  </div>
                  {i < arr.length - 1 && (<><div className="hidden md:block w-12 h-px bg-gradient-to-r from-primary/40 to-primary/10" /><div className="md:hidden h-8 w-px bg-gradient-to-b from-primary/40 to-primary/10" /></>)}
                </div>
              ))}
            </div>
            <div className="mt-8 flex justify-center">
              <a href="https://icommunity.io" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-muted/50 text-xs text-muted-foreground hover:border-primary/30 transition-colors"><Link2 className="w-3.5 h-3.5 text-primary" />{t("blockchain.poweredBy")}</a>
            </div>
          </div>
        </motion.div>
        <div className="grid sm:grid-cols-2 gap-4">
          {features.map((f, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.08 }} className="flex items-start gap-4 p-5 rounded-xl border border-border bg-card/80 hover:border-primary/20 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0"><f.icon className="w-4.5 h-4.5 text-primary" /></div>
              <div><p className="text-sm font-semibold text-foreground mb-1">{t(`${f.key}.title`)}</p><p className="text-xs text-muted-foreground leading-relaxed">{t(`${f.key}.desc`)}</p></div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BlockchainSection;
