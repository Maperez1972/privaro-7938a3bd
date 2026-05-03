import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/context/LanguageContext";
import { ArrowRight } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" as const } },
};

const stagger = { visible: { transition: { staggerChildren: 0.07 } } };

type Tag = "feature" | "fix" | "security" | "infra" | "sdk";

interface Entry {
  date: string;
  versionKey: string;
  titleKey: string;
  descKey: string;
  tags: Tag[];
  itemKeys: string[];
}

const ENTRIES: Entry[] = [
  {
    date: "2025-05-01",
    versionKey: "changelog.v08.version",
    titleKey: "changelog.v08.title",
    descKey: "changelog.v08.desc",
    tags: ["sdk", "feature"],
    itemKeys: [
      "changelog.v08.i1",
      "changelog.v08.i2",
      "changelog.v08.i3",
      "changelog.v08.i4",
    ],
  },
  {
    date: "2025-04-15",
    versionKey: "changelog.v07.version",
    titleKey: "changelog.v07.title",
    descKey: "changelog.v07.desc",
    tags: ["feature", "security"],
    itemKeys: [
      "changelog.v07.i1",
      "changelog.v07.i2",
      "changelog.v07.i3",
      "changelog.v07.i4",
    ],
  },
  {
    date: "2025-03-28",
    versionKey: "changelog.v06.version",
    titleKey: "changelog.v06.title",
    descKey: "changelog.v06.desc",
    tags: ["feature", "infra"],
    itemKeys: [
      "changelog.v06.i1",
      "changelog.v06.i2",
      "changelog.v06.i3",
    ],
  },
  {
    date: "2025-03-10",
    versionKey: "changelog.v05.version",
    titleKey: "changelog.v05.title",
    descKey: "changelog.v05.desc",
    tags: ["feature", "security"],
    itemKeys: [
      "changelog.v05.i1",
      "changelog.v05.i2",
      "changelog.v05.i3",
      "changelog.v05.i4",
    ],
  },
  {
    date: "2025-02-20",
    versionKey: "changelog.v04.version",
    titleKey: "changelog.v04.title",
    descKey: "changelog.v04.desc",
    tags: ["feature"],
    itemKeys: [
      "changelog.v04.i1",
      "changelog.v04.i2",
      "changelog.v04.i3",
    ],
  },
  {
    date: "2025-02-01",
    versionKey: "changelog.v03.version",
    titleKey: "changelog.v03.title",
    descKey: "changelog.v03.desc",
    tags: ["infra", "security"],
    itemKeys: [
      "changelog.v03.i1",
      "changelog.v03.i2",
      "changelog.v03.i3",
    ],
  },
];

const TAG_STYLES: Record<Tag, string> = {
  feature:  "bg-primary/10 text-primary border-primary/30",
  fix:      "bg-warning/10 text-warning border-warning/30",
  security: "bg-destructive/10 text-destructive border-destructive/30",
  infra:    "bg-info/10 text-info border-info/30",
  sdk:      "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
};

function TagBadge({ tag }: { tag: Tag }) {
  const { t } = useLanguage();
  return (
    <span className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full border ${TAG_STYLES[tag]}`}>
      {t(`changelog.tag.${tag}`)}
    </span>
  );
}

function EntryCard({ entry, index }: { entry: Entry; index: number }) {
  const { t, lang } = useLanguage();

  const dateStr = new Intl.DateTimeFormat(lang === "es" ? "es-ES" : "en-GB", {
    year: "numeric", month: "long", day: "numeric",
  }).format(new Date(entry.date));

  return (
    <motion.div variants={fadeUp} className="relative grid grid-cols-1 md:grid-cols-[180px_1fr] gap-6 group">
      {/* Left: date + version */}
      <div className="md:text-right md:pt-1">
        <p className="text-sm text-muted-foreground">{dateStr}</p>
        <p className="text-xs font-mono text-primary mt-1">{t(entry.versionKey)}</p>
      </div>

      {/* Timeline dot */}
      <div className="hidden md:block absolute left-[180px] top-2 w-px h-full bg-border group-last:hidden" />
      <div className="hidden md:flex absolute left-[174px] top-1.5 w-3 h-3 rounded-full border-2 border-primary bg-background items-center justify-center" />

      {/* Right: content */}
      <div className="bg-card border border-border rounded-xl p-6 md:ml-6">
        <h3 className="text-base font-semibold text-foreground mb-1">{t(entry.titleKey)}</h3>
        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{t(entry.descKey)}</p>

        <div className="flex flex-wrap gap-1.5 mb-5">
          {entry.tags.map(tag => <TagBadge key={tag} tag={tag} />)}
        </div>

        <ul className="space-y-2">
          {entry.itemKeys.map(key => (
            <li key={key} className="flex items-start gap-2.5 text-sm text-foreground/80">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
              {t(key)}
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}

export default function Changelog() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <section className="pt-32 pb-12 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            <motion.span variants={fadeUp}
              className="inline-block text-xs font-semibold uppercase tracking-widest text-primary bg-primary/10 border border-primary/30 rounded-full px-4 py-1.5 mb-6">
              {t("changelog.badge")}
            </motion.span>
            <motion.h1 variants={fadeUp} className="text-4xl md:text-5xl font-bold mb-5 leading-tight">
              {t("changelog.title")}
            </motion.h1>
            <motion.p variants={fadeUp} className="text-lg text-muted-foreground max-w-xl mx-auto">
              {t("changelog.subtitle")}
            </motion.p>
          </motion.div>
        </div>
      </section>

      <section className="pb-24 px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.05 }}
            variants={stagger}
            className="space-y-10"
          >
            {ENTRIES.map((entry, i) => (
              <EntryCard key={entry.versionKey} entry={entry} index={i} />
            ))}
          </motion.div>

          {/* CTA */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="mt-16 p-8 rounded-2xl border border-primary/30 bg-primary/5 text-center"
          >
            <p className="text-sm text-muted-foreground mb-4">{t("changelog.cta.desc")}</p>
            <Link
              to="/auth"
              className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
            >
              {t("changelog.cta.link")} <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
