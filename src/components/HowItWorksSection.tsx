import { useState } from "react";
import { motion } from "framer-motion";
import { FileInput, Brain, KeyRound, Server, ArrowRight, ArrowDown, Shield, Bot, Zap, Link2 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const HowItWorksSection = () => {
  const { t } = useLanguage();
  const [mode, setMode] = useState<"enterprise" | "agents">("enterprise");

  const enterpriseSteps = [
    { icon: FileInput, number: "01", titleKey: "how.step1.title", descKey: "how.step1.desc" },
    { icon: Brain, number: "02", titleKey: "how.step2.title", descKey: "how.step2.desc" },
    { icon: KeyRound, number: "03", titleKey: "how.step3.title", descKey: "how.step3.desc" },
    { icon: Server, number: "04", titleKey: "how.step4.title", descKey: "how.step4.desc" },
  ];

  const agentSteps = [
    { icon: Bot, number: "01", title: "Agent Calls Proxy", desc: "Agent calls POST /v1/agent/protect with context" },
    { icon: Brain, number: "02", title: "PII Detected", desc: "Regex + NLP Tier 1+2 in <10ms" },
    { icon: KeyRound, number: "03", title: "Clean Payload", desc: "Tokenised data sent to Claude, GPT-4 or Mistral" },
    { icon: Link2, number: "04", title: "iBS Certificate", desc: "Every step certified on blockchain (Fantom Opera)" },
  ];

  const steps = mode === "enterprise" ? enterpriseSteps : agentSteps;

  return (
    <section id="how-it-works" className="py-28 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.7 }} className="text-center mb-16">
          <p className="text-primary text-sm font-medium uppercase tracking-widest mb-4">{t("how.label")}</p>
          <h2 className="text-3xl md:text-5xl font-bold">{t("how.title1")} <span className="text-gradient">{t("how.title2")}</span></h2>
        </motion.div>

        {/* Tabs */}
        <div className="flex items-center justify-center gap-2 mb-10">
          <button
            onClick={() => setMode("enterprise")}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              mode === "enterprise"
                ? "bg-primary/10 text-primary border border-primary/30"
                : "bg-muted/30 text-muted-foreground border border-border hover:border-primary/20"
            }`}
          >
            <Shield className="w-4 h-4" />
            Enterprise
          </button>
          <button
            onClick={() => setMode("agents")}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              mode === "agents"
                ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                : "bg-muted/30 text-muted-foreground border border-border hover:border-amber-500/20"
            }`}
          >
            <Bot className="w-4 h-4" />
            AI Agents
          </button>
        </div>

        {/* Architecture diagram */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }} className="relative mb-16" key={mode}>
          <div className="absolute inset-0 grid-pattern opacity-30 rounded-xl" />
          {mode === "enterprise" ? (
            <div className="relative flex flex-col md:flex-row items-center justify-center gap-4 md:gap-0 py-12 px-6">
              <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.3 }} className="flex-shrink-0 w-56 p-6 rounded-xl border border-border bg-card/80 backdrop-blur-sm text-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-muted/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative">
                  <div className="w-10 h-10 rounded-lg bg-muted/50 border border-border flex items-center justify-center mx-auto mb-3"><FileInput className="w-5 h-5 text-muted-foreground" /></div>
                  <p className="text-sm font-semibold text-foreground">{t("how.arch.enterprise")}</p>
                  <p className="text-xs text-muted-foreground mt-1.5">{t("how.arch.enterpriseSub")}</p>
                </div>
              </motion.div>
              <div className="hidden md:flex items-center px-2"><motion.div initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: 0.5 }} className="origin-left"><div className="flex items-center"><div className="w-16 h-px bg-gradient-to-r from-border to-primary/50" /><ArrowRight className="w-4 h-4 text-primary/60 -ml-1" /></div></motion.div></div>
              <div className="md:hidden flex justify-center"><motion.div initial={{ scaleY: 0 }} whileInView={{ scaleY: 1 }} viewport={{ once: true }} transition={{ duration: 0.3, delay: 0.5 }} className="origin-top"><div className="flex flex-col items-center"><div className="w-px h-8 bg-gradient-to-b from-border to-primary/50" /><ArrowDown className="w-4 h-4 text-primary/60 -mt-1" /></div></motion.div></div>
              <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.45 }} className="flex-shrink-0 w-64 p-6 rounded-xl border border-primary/30 bg-card/80 backdrop-blur-sm text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5" />
                <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-primary/5 blur-3xl" />
                <div className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full bg-primary/5 blur-3xl" />
                <div className="relative">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-3"><Shield className="w-5 h-5 text-primary" /></div>
                  <p className="text-sm font-semibold text-primary">{t("how.arch.privaura")}</p>
                  <div className="flex items-center justify-center gap-2 mt-2 flex-wrap">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary/80">{t("how.badge.detection")}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary/80">{t("how.badge.anonymization")}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary/80">{t("how.badge.logging")}</span>
                  </div>
                </div>
              </motion.div>
              <div className="hidden md:flex items-center px-2"><motion.div initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: 0.6 }} className="origin-left"><div className="flex items-center"><div className="w-16 h-px bg-gradient-to-r from-primary/50 to-border" /><ArrowRight className="w-4 h-4 text-muted-foreground -ml-1" /></div></motion.div></div>
              <div className="md:hidden flex justify-center"><motion.div initial={{ scaleY: 0 }} whileInView={{ scaleY: 1 }} viewport={{ once: true }} transition={{ duration: 0.3, delay: 0.6 }} className="origin-top"><div className="flex flex-col items-center"><div className="w-px h-8 bg-gradient-to-b from-primary/50 to-border" /><ArrowDown className="w-4 h-4 text-muted-foreground -mt-1" /></div></motion.div></div>
              <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.55 }} className="flex-shrink-0 w-56 p-6 rounded-xl border border-border bg-card/80 backdrop-blur-sm text-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-muted/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative">
                  <div className="w-10 h-10 rounded-lg bg-muted/50 border border-border flex items-center justify-center mx-auto mb-3"><Server className="w-5 h-5 text-muted-foreground" /></div>
                  <p className="text-sm font-semibold text-foreground">{t("how.arch.aiModel")}</p>
                  <p className="text-xs text-muted-foreground mt-1.5">OpenAI • Azure • Copilot</p>
                </div>
              </motion.div>
            </div>
          ) : (
            <div className="relative flex flex-col md:flex-row items-center justify-center gap-4 md:gap-0 py-12 px-6">
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="flex-shrink-0 w-56 p-6 rounded-xl border border-border bg-card/80 backdrop-blur-sm text-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-muted/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative">
                  <div className="w-10 h-10 rounded-lg bg-muted/50 border border-border flex items-center justify-center mx-auto mb-3"><Bot className="w-5 h-5 text-amber-400" /></div>
                  <p className="text-sm font-semibold text-foreground">AI Agent</p>
                  <p className="text-xs text-muted-foreground mt-1.5">LangChain · CrewAI · n8n</p>
                </div>
              </motion.div>
              <div className="hidden md:flex items-center px-2"><div className="flex items-center"><div className="w-16 h-px bg-gradient-to-r from-border to-amber-500/50" /><ArrowRight className="w-4 h-4 text-amber-400/60 -ml-1" /></div></div>
              <div className="md:hidden flex justify-center"><div className="flex flex-col items-center"><div className="w-px h-8 bg-gradient-to-b from-border to-amber-500/50" /><ArrowDown className="w-4 h-4 text-amber-400/60 -mt-1" /></div></div>
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.2 }} className="flex-shrink-0 w-64 p-6 rounded-xl border border-amber-500/30 bg-card/80 backdrop-blur-sm text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-amber-500/5" />
                <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-amber-500/5 blur-3xl" />
                <div className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full bg-amber-500/5 blur-3xl" />
                <div className="relative">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-3"><Shield className="w-5 h-5 text-amber-400" /></div>
                  <p className="text-sm font-semibold text-amber-400">Privaro Layer</p>
                  <div className="flex items-center justify-center gap-2 mt-2 flex-wrap">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400/80">Detection</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400/80">Tokenisation</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400/80">iBS Certified</span>
                  </div>
                </div>
              </motion.div>
              <div className="hidden md:flex items-center px-2"><div className="flex items-center"><div className="w-16 h-px bg-gradient-to-r from-amber-500/50 to-border" /><ArrowRight className="w-4 h-4 text-muted-foreground -ml-1" /></div></div>
              <div className="md:hidden flex justify-center"><div className="flex flex-col items-center"><div className="w-px h-8 bg-gradient-to-b from-amber-500/50 to-border" /><ArrowDown className="w-4 h-4 text-muted-foreground -mt-1" /></div></div>
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.3 }} className="flex-shrink-0 w-56 p-6 rounded-xl border border-border bg-card/80 backdrop-blur-sm text-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-muted/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative">
                  <div className="w-10 h-10 rounded-lg bg-muted/50 border border-border flex items-center justify-center mx-auto mb-3"><Server className="w-5 h-5 text-muted-foreground" /></div>
                  <p className="text-sm font-semibold text-foreground">LLM Model</p>
                  <p className="text-xs text-muted-foreground mt-1.5">Claude · GPT-4 · Mistral</p>
                </div>
              </motion.div>
            </div>
          )}
        </motion.div>

        {/* Steps */}
        <div className="grid md:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <motion.div key={`${mode}-${i}`} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.12 }} className={`relative p-6 rounded-lg border bg-card group transition-colors ${
              mode === "agents" ? "border-amber-500/20 hover:border-amber-500/40" : "border-border hover:border-primary/30"
            }`}>
              <span className={`text-5xl font-extrabold absolute top-4 right-4 transition-colors ${
                mode === "agents" ? "text-amber-500/10 group-hover:text-amber-500/20" : "text-primary/10 group-hover:text-primary/20"
              }`}>{step.number}</span>
              <step.icon className={`w-8 h-8 mb-4 ${mode === "agents" ? "text-amber-400" : "text-primary"}`} />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {"titleKey" in step ? t(step.titleKey) : step.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {"descKey" in step ? t(step.descKey) : step.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
