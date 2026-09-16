import { motion } from "framer-motion";
import { PlayCircle } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

/**
 * Demo video slot.
 * The video is not recorded yet: this renders a visible, fixed-ratio placeholder.
 * To ship the real video, replace the placeholder block below with either
 *   <video src="..." controls className="absolute inset-0 w-full h-full" />
 * or a Loom <iframe ... className="absolute inset-0 w-full h-full" />.
 * The 16:9 slot, border and layout stay untouched.
 */
const DemoVideoSection = () => {
  const { t } = useLanguage();

  return (
    <section id="demo-video" className="py-24 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <p className="text-primary text-sm font-medium uppercase tracking-widest mb-4">{t("video.label")}</p>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("video.title")}</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">{t("video.subtitle")}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="relative w-full aspect-video rounded-xl border border-border bg-card overflow-hidden shadow-2xl shadow-primary/[0.05]"
        >
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
          {/* VIDEO SLOT — replace this block with <video> or the Loom iframe */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 grid-pattern">
            <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
              <PlayCircle className="w-8 h-8 text-primary" />
            </div>
            <p className="text-sm font-semibold text-foreground">{t("video.placeholder.title")}</p>
            <p className="text-xs text-muted-foreground max-w-xs text-center px-6">{t("video.placeholder.desc")}</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default DemoVideoSection;
