import { useState } from "react";
import { motion } from "framer-motion";
import { FileText, Download } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import TechBriefDialog from "./TechBriefDialog";

const TechBriefSection = () => {
  const { t } = useLanguage();
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <section className="py-28 px-6">
      <div className="max-w-3xl mx-auto text-center">
        <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.7 }}>
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 mb-6 mx-auto"><FileText className="w-5 h-5 text-primary" /></div>
          <h2 className="text-3xl md:text-5xl font-bold mb-4">{t("techbrief.title1")} <span className="text-gradient">{t("techbrief.title2")}</span></h2>
          <p className="text-muted-foreground text-lg mb-10 max-w-xl mx-auto">{t("techbrief.text")}</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="https://evtfdgjliyhpubbrxzuq.supabase.co/storage/v1/object/public/public-docs/Privaro_Architecture_Paper_Final.pdf" download="Privaro_Architecture_Paper_Final.pdf" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-8 py-4 rounded-md bg-white text-gray-900 font-semibold text-base hover:bg-gray-100 transition-colors">
              <Download className="w-5 h-5" />{t("techbrief.btn.download")}
            </a>
            <button onClick={() => setDialogOpen(true)} className="inline-flex items-center gap-2 px-8 py-4 rounded-md border border-white/30 text-white font-semibold text-base hover:bg-white/10 transition-colors">{t("techbrief.btn.demo")}</button>
          </div>
          <p className="text-muted-foreground text-sm mt-4">{t("techbrief.btn.note")}</p>
        </motion.div>
      </div>
      <TechBriefDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </section>
  );
};

export default TechBriefSection;
