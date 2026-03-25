import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Download, Mail } from "lucide-react";
import { motion } from "framer-motion";
import { ReactNode } from "react";
import { useLanguage } from "@/context/LanguageContext";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.08 } },
};

const FadeSection = ({ children, className }: { children: ReactNode; className?: string }) => (
  <motion.section
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, amount: 0.15 }}
    variants={fadeUp}
    className={className}
  >
    {children}
  </motion.section>
);

const SectionHeader = ({ label, title, desc }: { label: string; title: string; desc: string }) => (
  <>
    <p className="text-xs font-bold tracking-widest text-primary uppercase mb-3">{label}</p>
    <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">{title}</h2>
    <p className="text-muted-foreground max-w-xl">{desc}</p>
  </>
);

const controlIds = [
  "A.8.24 / CC6.1", "A.8.3 / CC6.3", "A.8.5 / CC6.1", "A.8.15 / CC7.2",
  "A.8.20 / CC6.6", "A.8.34 / CC4.1", "A.5.2 / CC6.2", "A.8.25 / CC8.1",
];
const controlStatuses: ("implemented" | "progress")[] = [
  "implemented", "implemented", "implemented", "implemented",
  "implemented", "implemented", "implemented", "progress",
];

const regNames = ["GDPR Art.5", "GDPR Art.9", "GDPR Art.30", "EU AI Act", "PSD2", "HIPAA", "ISO 27001:2022", "SOC2 Type I"];
const regStatuses: ("covered" | "inprogress")[] = [
  "covered", "covered", "covered", "covered", "covered", "covered", "inprogress", "inprogress",
];

const pillarIcons = ["🔐", "⛓️", "🛡️", "⚙️", "🤖", "🌍"];
const docIcons = ["📋", "🔒", "✅", "🚨", "♻️", "📄"];
const docIds = [
  "POL-001 · v1.0 · March 2026",
  "POL-002 · v1.0 · March 2026",
  "POL-003 · v1.0 · March 2026 · 83% implemented",
  "POL-004 · v1.0 · March 2026 · GDPR Art.33 compliant",
  "POL-005 · v1.0 · March 2026 · RTO < 4h · RPO < 1h",
  "Available upon request · GDPR Art.28 compliant",
];

const Security = () => {
  const { t } = useLanguage();

  const heroBadges = [
    { label: t("secpage.badge.aes"), active: true },
    { label: t("secpage.badge.blockchain"), active: true },
    { label: t("secpage.badge.gdpr"), active: true },
    { label: t("secpage.badge.tls"), active: true },
    { label: t("secpage.badge.soc2"), active: false },
    { label: t("secpage.badge.iso"), active: false },
  ];

  const pillars = pillarIcons.map((icon, i) => ({
    icon,
    title: t(`secpage.pillar${i + 1}.title`),
    desc: t(`secpage.pillar${i + 1}.desc`),
  }));

  const controls = controlIds.map((id, i) => ({
    id,
    desc: t(`secpage.ctrl${i + 1}.desc`),
    status: controlStatuses[i],
  }));

  const regulations = regNames.map((reg, i) => ({
    reg,
    scope: t(`secpage.reg${i + 1}.scope`),
    coverage: t(`secpage.reg${i + 1}.coverage`),
    status: regStatuses[i],
  }));

  const stats = [
    { value: "Fantom", label: t("secpage.stat1.label") },
    { value: "~60s", label: t("secpage.stat2.label") },
    { value: "100x", label: t("secpage.stat3.label") },
    { value: "SHA-512", label: t("secpage.stat4.label") },
  ];

  const policyDocs = docIcons.map((icon, i) => ({
    icon,
    title: t(`secpage.doc${i + 1}.title`),
    id: docIds[i],
  }));

  const tableHeaders = [
    t("secpage.table.regulation"),
    t("secpage.table.scope"),
    t("secpage.table.coverage"),
    t("secpage.table.status"),
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* HERO */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="bg-gradient-to-br from-background to-secondary text-foreground py-20 px-8 text-center"
      >
        <motion.span
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="inline-flex items-center gap-2 bg-secondary border border-border rounded-full px-4 py-1.5 text-xs text-primary mb-6"
        >
          🔒 {t("secpage.hero.badge")}
        </motion.span>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-3xl md:text-5xl font-extrabold mb-4 leading-tight"
        >
          {t("secpage.hero.title1")}<br />{t("secpage.hero.title2")}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="text-lg text-muted-foreground max-w-xl mx-auto mb-10"
        >
          {t("secpage.hero.desc")}
        </motion.p>
        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="flex flex-wrap justify-center gap-3"
        >
          {heroBadges.map((b) => (
            <motion.span key={b.label} variants={fadeUp} className="inline-flex items-center gap-2 bg-secondary/60 border border-border rounded-lg px-4 py-2 text-xs text-muted-foreground">
              <span className={`w-2 h-2 rounded-full ${b.active ? "bg-green-400 shadow-[0_0_6px_theme(colors.green.400)]" : "bg-yellow-300"}`} />
              {b.label}
            </motion.span>
          ))}
        </motion.div>
      </motion.section>

      {/* ARCHITECTURE */}
      <FadeSection className="py-16 border-b border-border">
        <div className="max-w-[1100px] mx-auto px-8">
          <SectionHeader label={t("secpage.arch.label")} title={t("secpage.arch.title")} desc={t("secpage.arch.desc")} />
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-10"
          >
            {pillars.map((p) => (
              <motion.div key={p.title} variants={fadeUp} className="bg-card border border-border rounded-xl p-7">
                <div className="text-3xl mb-4">{p.icon}</div>
                <h3 className="text-sm font-bold text-foreground mb-2">{p.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </FadeSection>

      {/* CONTROLS */}
      <FadeSection className="py-16 border-b border-border">
        <div className="max-w-[1100px] mx-auto px-8">
          <SectionHeader label={t("secpage.controls.label")} title={t("secpage.controls.title")} desc={t("secpage.controls.desc")} />
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="grid gap-3 mt-8"
          >
            {controls.map((c) => (
              <motion.div key={c.id} variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-[200px_1fr_auto] gap-4 items-center p-4 bg-card border border-border rounded-lg">
                <span className="font-mono text-xs font-bold text-primary">{c.id}</span>
                <span className="text-sm text-foreground">{c.desc}</span>
                <span className={`inline-flex items-center gap-1.5 text-xs font-semibold rounded-full px-3 py-1 whitespace-nowrap ${c.status === "implemented" ? "bg-green-500/15 text-green-400" : "bg-yellow-500/15 text-yellow-400"}`}>
                  {c.status === "implemented" ? t("secpage.status.implemented") : t("secpage.status.progress")}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </FadeSection>

      {/* COMPLIANCE */}
      <FadeSection className="py-16 border-b border-border">
        <div className="max-w-[1100px] mx-auto px-8">
          <SectionHeader label={t("secpage.compliance.label")} title={t("secpage.compliance.title")} desc={t("secpage.compliance.desc")} />
          <div className="overflow-x-auto mt-8">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  {tableHeaders.map((h, i) => (
                    <th key={h} className={`text-left px-4 py-3 bg-secondary text-foreground text-xs font-semibold ${i === 0 ? "rounded-tl-lg" : ""} ${i === 3 ? "rounded-tr-lg" : ""}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {regulations.map((r, i) => (
                  <tr key={r.reg}>
                    <td className={`px-4 py-3.5 border-b border-border text-sm font-semibold ${i % 2 === 1 ? "bg-card" : ""}`}>{r.reg}</td>
                    <td className={`px-4 py-3.5 border-b border-border text-sm text-muted-foreground ${i % 2 === 1 ? "bg-card" : ""}`}>{r.scope}</td>
                    <td className={`px-4 py-3.5 border-b border-border text-sm text-muted-foreground ${i % 2 === 1 ? "bg-card" : ""}`}>{r.coverage}</td>
                    <td className={`px-4 py-3.5 border-b border-border text-sm ${i % 2 === 1 ? "bg-card" : ""}`}>
                      <span className={`inline-flex items-center gap-1.5 text-xs font-semibold rounded-full px-3 py-1 ${r.status === "covered" ? "bg-green-500/15 text-green-400" : "bg-yellow-500/15 text-yellow-400"}`}>
                        {r.status === "covered" ? t("secpage.status.covered") : t("secpage.status.inprogress")}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </FadeSection>

      {/* BLOCKCHAIN */}
      <FadeSection className="py-16 border-b border-border">
        <div className="max-w-[1100px] mx-auto px-8">
          <SectionHeader label={t("secpage.blockchain.label")} title={t("secpage.blockchain.title")} desc={t("secpage.blockchain.desc")} />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="grid grid-cols-1 sm:grid-cols-2 bg-gradient-to-br from-background to-secondary rounded-2xl p-10 gap-8 mt-8 border border-border"
          >
            <div>
              <h3 className="text-lg font-bold text-foreground mb-3">{t("secpage.blockchain.howTitle")}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{t("secpage.blockchain.howP1")}</p>
              <p className="text-sm text-muted-foreground leading-relaxed mt-3">{t("secpage.blockchain.howP2")}</p>
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground mb-3">{t("secpage.blockchain.verifyTitle")}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{t("secpage.blockchain.verifyDesc")}</p>
              <div className="font-mono text-[11px] text-primary break-all mt-3 p-3 bg-muted rounded-md">
                Example TX:<br />
                https://checker.icommunitylabs.com/check/<br />
                fantom_opera_mainnet/<br />
                0xfbe1b5163bdb4e7265e130e09b1b2b0c6b606799...
              </div>
            </div>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="grid grid-cols-2 sm:grid-cols-4 gap-5 mt-8"
          >
            {stats.map((s) => (
              <motion.div key={s.label} variants={fadeUp} className="text-center p-6 border border-border rounded-xl bg-card">
                <div className="text-3xl font-extrabold text-foreground leading-none mb-1.5">{s.value}</div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </FadeSection>

      {/* POLICY DOCUMENTS */}
      <FadeSection className="py-16 border-b border-border">
        <div className="max-w-[1100px] mx-auto px-8">
          <SectionHeader label={t("secpage.docs.label")} title={t("secpage.docs.title")} desc={t("secpage.docs.desc")} />
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-8"
          >
            {policyDocs.map((d) => (
              <motion.div key={d.title} variants={fadeUp} className="border border-border rounded-xl px-5 py-4 flex items-start gap-4 bg-card">
                <span className="text-2xl flex-shrink-0">{d.icon}</span>
                <div>
                  <div className="text-sm font-bold text-foreground mb-1">{d.title}</div>
                  <div className="text-xs text-muted-foreground font-mono">{d.id}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </FadeSection>

      {/* CTA */}
      <FadeSection className="py-16">
        <div className="max-w-[1100px] mx-auto px-8">
          <div className="bg-card border border-border rounded-2xl p-12 text-center">
            <h2 className="text-2xl font-bold text-foreground mb-3">{t("secpage.cta.title")}</h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">{t("secpage.cta.desc")}</p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button asChild>
                <a href="mailto:hello@icommunity.io">
                  <Mail className="w-4 h-4" />
                  {t("secpage.cta.contact")}
                </a>
              </Button>
              <Button variant="outline" asChild>
                <a href="/docs/Privaro_Compliance_Pack_v1.0.zip" download>
                  <Download className="w-4 h-4" />
                  {t("secpage.cta.download")}
                </a>
              </Button>
            </div>
          </div>
        </div>
      </FadeSection>

      <Footer />
    </div>
  );
};

export default Security;
