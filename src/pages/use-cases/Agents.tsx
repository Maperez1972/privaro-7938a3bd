import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Bot, Shield, Zap, Code2, X, Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const features = [
  { icon: Bot, title: "Step-Level Protection", desc: "Privaro intercepts every call to /v1/agent/protect before it hits the LLM. PII is detected, tokenised, and replaced with secure references. The agent works normally — the model never sees real data." },
  { icon: Shield, title: "Blockchain Certification (iBS)", desc: "Every agent step generates an iBS signature on Fantom Opera Mainnet. Immutable, timestamped, tamper-proof. When a regulator asks what your agent did with client data — you have the proof." },
  { icon: Zap, title: "Zero Latency Impact", desc: "Privaro adds <50ms per step. Built for autonomous workflows where speed matters. Supports LangChain, CrewAI, n8n, and any agent framework that makes HTTP calls." },
  { icon: Code2, title: "One-Line Integration", desc: "Replace your LLM call with Privaro's agent endpoint. Works with Claude, GPT-4, Mistral, and Gemini. No SDK required — pure HTTP." },
];

const withoutPrivaro = [
  "Raw customer data sent directly to the LLM",
  "No visibility into what the agent exposed",
  "GDPR liability on every autonomous step",
  "No audit trail when regulators ask",
];

const withPrivaro = [
  "PII never reaches the model — tokenised before each step",
  "Full visibility: every agent step logged and certified",
  "GDPR-compliant by design — not as an afterthought",
  "Blockchain audit trail per interaction (iBS)",
];

const steps = [
  { num: "01", title: "Agent triggers a step", desc: "Calls POST /v1/agent/protect" },
  { num: "02", title: "Privaro detects PII", desc: "Tokenises in <10ms" },
  { num: "03", title: "Clean payload sent to LLM", desc: "Claude, GPT-4, Mistral, etc." },
  { num: "04", title: "Response returned", desc: "Optional de-tokenisation" },
  { num: "05", title: "iBS certificate generated", desc: "Blockchain proof per step" },
];

const frameworks = ["LangChain", "CrewAI", "n8n", "Custom Agents", "OpenAI Agents", "Claude", "ruflo"];

const pricing = [
  { name: "Agent Starter", price: "€99", period: "/mo", steps: "50K agent steps", desc: "Entry for builders", highlighted: false },
  { name: "Agent Business", price: "€499", period: "/mo", steps: "500K agent steps", desc: "Growing ISVs", highlighted: true },
  { name: "Agent Enterprise", price: "Custom", period: "", steps: "5M+ steps", desc: "White-label available", highlighted: false },
];

const AgentsPage = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-full px-4 py-1.5 mb-6">New Use Case</span>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Privacy for <span className="text-primary">AI Agents</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Every agent step that touches customer data creates GDPR liability. Privaro intercepts each step, tokenises PII, certifies on blockchain, and returns a clean payload — in milliseconds.
            </p>
          </motion.div>
        </div>
      </section>

      {/* The Problem — comparison */}
      <section className="pb-20 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-2xl md:text-3xl font-bold text-center mb-12">The Problem</motion.h2>
          <div className="grid md:grid-cols-2 gap-6">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="p-6 rounded-xl border border-destructive/30 bg-destructive/5">
              <h3 className="text-lg font-semibold mb-4 text-destructive">Without Privaro</h3>
              <ul className="space-y-3">
                {withoutPrivaro.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                    <X className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="p-6 rounded-xl border border-emerald-500/30 bg-emerald-500/5">
              <h3 className="text-lg font-semibold mb-4 text-emerald-400">With Privaro</h3>
              <ul className="space-y-3">
                {withPrivaro.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section className="pb-20 px-6">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8">
          {features.map((f, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="p-6 rounded-xl border border-amber-500/20 bg-card hover:border-amber-500/40 transition-colors">
              <div className="w-12 h-12 rounded-lg bg-amber-500/10 flex items-center justify-center mb-5">
                <f.icon className="h-6 w-6 text-amber-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{f.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="pb-20 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-2xl md:text-3xl font-bold text-center mb-12">How It Works</motion.h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {steps.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="relative p-5 rounded-xl border border-border bg-card text-center">
                <span className="text-2xl font-bold text-amber-400/60 mb-2 block">{s.num}</span>
                <h4 className="text-sm font-semibold mb-1">{s.title}</h4>
                <p className="text-xs text-muted-foreground">{s.desc}</p>
                {i < steps.length - 1 && (
                  <ArrowRight className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40 z-10" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Compatible Frameworks */}
      <section className="pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-2xl md:text-3xl font-bold mb-8">Compatible Frameworks</motion.h2>
          <div className="flex flex-wrap justify-center gap-3">
            {frameworks.map((fw) => (
              <span key={fw} className="text-sm font-medium px-4 py-2 rounded-full border border-border bg-secondary/50 text-muted-foreground">{fw}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="pb-20 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-2xl md:text-3xl font-bold text-center mb-12">Pricing</motion.h2>
          <div className="grid md:grid-cols-3 gap-6">
            {pricing.map((p, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className={`p-6 rounded-xl border ${p.highlighted ? "border-amber-500/50 bg-amber-500/5 ring-1 ring-amber-500/20" : "border-border bg-card"} text-center`}>
                <h3 className="text-lg font-semibold mb-2">{p.name}</h3>
                <div className="mb-2">
                  <span className="text-3xl font-bold">{p.price}</span>
                  <span className="text-muted-foreground text-sm">{p.period}</span>
                </div>
                <p className="text-sm text-muted-foreground mb-1">{p.steps}</p>
                <p className="text-xs text-muted-foreground">{p.desc}</p>
                {p.highlighted && <span className="inline-block mt-3 text-xs font-semibold text-amber-400 uppercase tracking-wider">Most Popular</span>}
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Button size="lg" onClick={() => window.location.href = "/#early-access"}>Get Early Access</Button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="pb-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <Button size="lg" onClick={() => window.location.href = "/#early-access"}>Request Early Access</Button>
          <p className="text-sm text-muted-foreground mt-4">Deploys in minutes. No infra changes.</p>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AgentsPage;
