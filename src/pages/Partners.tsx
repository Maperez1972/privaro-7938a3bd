import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, Layers, DollarSign, Check, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const Partners = () => {
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [role, setRole] = useState("");
  const [clients, setClients] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSending(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("send-demo-request", {
        body: {
          name: fd.get("name"),
          company: fd.get("company"),
          role,
          email: fd.get("email"),
          concern: `Agents/Workflows: ${fd.get("workflows") || "—"} | Clients: ${clients || "—"}`,
          source: "partner",
        },
      });
      if (fnError) throw fnError;
      if (data && !data.success) throw new Error(data.error);
      setSubmitted(true);
    } catch (err) {
      console.error("Partner form error:", err);
      setError("Something went wrong. Please try again or email partners@privaro.ai");
    } finally {
      setSending(false);
    }
  };

  const whyCards = [
    { icon: TrendingUp, title: "Unlock Regulated Sectors", desc: "Your agents can now work with real client data in legal, healthcare, and finance. Privaro handles compliance — you focus on the workflow." },
    { icon: Layers, title: "No Infra Changes", desc: "Embed Privaro via HTTP in minutes. No new infrastructure, no re-architecture. Your clients don't even need to know it's there." },
    { icon: DollarSign, title: "You Control the Margin", desc: "Usage-based pricing means you decide what to charge your clients. Most partners mark up 2-3x. White-label available on Enterprise." },
  ];

  const models = [
    {
      emoji: "🟢", name: "Co-branded", badge: "Fastest to deploy", badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
      desc: '"Powered by Privaro" visible in your product.',
      bullets: ["Deploy in days", "Shared dashboard", "No custom infra"],
      ideal: "ISVs validating the use case",
      border: "border-emerald-500/30",
    },
    {
      emoji: "🟡", name: "Embedded", badge: "Most popular", badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/30",
      desc: "Privaro fully integrated — no brand visible. API + SDK in your backend.",
      bullets: ["Seamless for your clients", "Your product, your brand", "Higher perceived value"],
      ideal: "ISVs with production agents",
      border: "border-amber-500/40 ring-1 ring-amber-500/20",
    },
    {
      emoji: "🔴", name: "White-label", badge: "Enterprise only", badgeColor: "bg-primary/10 text-primary border-primary/30",
      desc: "Full white-label. Custom domain. Dedicated infra.",
      bullets: ["100% your brand", "Multi-tenant", "Custom SLA"],
      ideal: "platforms serving regulated enterprise",
      border: "border-border",
    },
  ];

  const impacts = [
    "Use real client data without blocking your agents",
    "Close contracts in regulated sectors — legal, healthcare, finance",
    "Avoid costly on-prem deployments for your clients",
    "Ship to regulated clients in days, not months",
    "Add a verifiable audit trail to every AI interaction",
    "Differentiate from competitors who don't have compliance",
  ];

  const yesItems = [
    "AI agencies building agents for enterprise clients",
    "ISVs embedding LLMs in regulated sector products",
    "Consulting firms deploying AI in legal, finance, or healthcare",
    "Platforms that need multi-tenant compliance infrastructure",
  ];
  const noItems = [
    "Companies just exploring AI without production agents",
    'Developers who want to "put their logo" on Privaro',
    "Partners seeking exclusivity agreements",
    "Anyone not bringing distribution or volume",
  ];

  const frameworks = ["LangChain", "CrewAI", "n8n", "Claude", "GPT-4", "Custom Agents"];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-primary bg-primary/10 border border-primary/30 rounded-full px-4 py-1.5 mb-6">
              EMBEDDED PARTNERSHIP
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Privaro is not a feature.<br />
              <span className="text-primary">It's a deal enabler.</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Integrate Privaro as a data control layer in your agents and unlock regulated sector clients — without building compliance infrastructure from scratch.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4">
              <Button size="lg" asChild>
                <a href="mailto:partners@privaro.ai">Request Partner Pricing</a>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a href="#how-it-works">See how it works</a>
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">Usage-based pricing. You control the margin.</p>
          </motion.div>
        </div>
      </section>

      {/* Why Partners Choose Privaro */}
      <section className="pb-20 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-2xl md:text-3xl font-bold text-center mb-12">
            Close deals you couldn't close before
          </motion.h2>
          <div className="grid md:grid-cols-3 gap-6">
            {whyCards.map((c, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="p-6 rounded-xl border border-primary/20 bg-card hover:border-primary/40 transition-colors">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-5">
                  <c.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{c.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{c.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How the partnership works */}
      <section id="how-it-works" className="pb-20 px-6 scroll-mt-20">
        <div className="max-w-6xl mx-auto">
          <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-2xl md:text-3xl font-bold text-center mb-12">
            Three models. Pick what fits.
          </motion.h2>
          <div className="grid md:grid-cols-3 gap-6">
            {models.map((m, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className={`p-6 rounded-xl border ${m.border} bg-card flex flex-col`}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">{m.emoji}</span>
                  <h3 className="text-lg font-semibold">{m.name}</h3>
                </div>
                <span className={`self-start text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full border mb-4 ${m.badgeColor}`}>{m.badge}</span>
                <p className="text-sm text-muted-foreground mb-4">{m.desc}</p>
                <ul className="space-y-2 mb-5">
                  {m.bullets.map((b, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-foreground">
                      <Check className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                      {b}
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-muted-foreground mt-auto pt-3 border-t border-border">
                  → ideal for: {m.ideal}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Commercial Impact */}
      <section className="pb-20 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-2xl md:text-3xl font-bold text-center mb-12">
            What partners actually get
          </motion.h2>
          <div className="grid sm:grid-cols-2 gap-4 mb-12">
            {impacts.map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}
                className="flex items-start gap-3 p-4 rounded-lg border border-border bg-card">
                <Check className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-muted-foreground">{item}</p>
              </motion.div>
            ))}
          </div>
          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="text-center text-xl md:text-2xl font-semibold italic text-foreground">
            Privaro is not a feature. It's a deal enabler.
          </motion.p>
        </div>
      </section>

      {/* Pricing */}
      <section className="pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-2xl md:text-3xl font-bold text-center mb-3">
            Partner pricing
          </motion.h2>
          <p className="text-sm text-muted-foreground text-center mb-12">Usage-based. You control what you charge your clients.</p>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 rounded-xl border border-border bg-card">
              <h3 className="text-lg font-semibold mb-3">Revenue Share</h3>
              <p className="text-2xl font-bold mb-1">20–30%</p>
              <p className="text-sm text-muted-foreground mb-5">of what you charge your clients<br />+ minimum monthly fee</p>
              <ul className="space-y-2 mb-4">
                {["Aligned incentives", "Scales with your growth", "No upfront commitment"].map((b) => (
                  <li key={b} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />{b}
                  </li>
                ))}
              </ul>
              <p className="text-xs text-muted-foreground/80 pt-3 border-t border-border">Best for: ISVs still validating pricing</p>
            </div>
            <div className="p-6 rounded-xl border border-primary/50 bg-primary/5 ring-1 ring-primary/20">
              <h3 className="text-lg font-semibold mb-3">Usage-Based</h3>
              <p className="text-2xl font-bold mb-1">€0.0015 <span className="text-sm font-normal text-muted-foreground">/ agent step</span></p>
              <p className="text-sm text-muted-foreground mb-5">+ monthly minimum</p>
              <ul className="space-y-2 mb-4">
                {["Predictable costs", "Easy to margin up", "Overage transparent"].map((b) => (
                  <li key={b} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />{b}
                  </li>
                ))}
              </ul>
              <p className="text-xs text-muted-foreground/80 pt-3 border-t border-primary/20">Best for: ISVs with production workloads</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground text-center mt-8 max-w-2xl mx-auto">
            Both models include: onboarding support, technical documentation, partner dashboard access, and co-marketing opportunities.
          </p>
        </div>
      </section>

      {/* Who this is for */}
      <section className="pb-20 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-2xl md:text-3xl font-bold text-center mb-12">
            Built for builders, not browsers
          </motion.h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 rounded-xl border border-emerald-500/30 bg-emerald-500/5">
              <h3 className="text-lg font-semibold mb-4 text-emerald-400">✓ YES</h3>
              <ul className="space-y-3">
                {yesItems.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />{item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="p-6 rounded-xl border border-destructive/30 bg-destructive/5">
              <h3 className="text-lg font-semibold mb-4 text-destructive">✗ NOT FOR YOU</h3>
              <ul className="space-y-3">
                {noItems.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                    <X className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />{item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Final form */}
      <section id="partner-form" className="pb-20 px-6 scroll-mt-20">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">Let's talk partnership</h2>
            <p className="text-muted-foreground">Tell us about your use case and we'll send you partner pricing within 24 hours.</p>
          </div>
          {submitted ? (
            <div className="p-8 rounded-lg border border-primary/30 bg-card text-center glow-border">
              <h3 className="text-2xl font-bold mb-3">Thanks — we'll be in touch</h3>
              <p className="text-muted-foreground">Expect a response from our partnerships team within 24 hours.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-8 rounded-lg border border-border bg-card space-y-5">
              <div>
                <label className="block text-sm text-muted-foreground mb-1.5">Name</label>
                <input name="name" type="text" required maxLength={100} className="w-full px-4 py-2.5 rounded-md bg-surface border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
              <div>
                <label className="block text-sm text-muted-foreground mb-1.5">Company</label>
                <input name="company" type="text" required maxLength={100} className="w-full px-4 py-2.5 rounded-md bg-surface border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
              <div>
                <label className="block text-sm text-muted-foreground mb-1.5">Role</label>
                <Select required value={role} onValueChange={setRole}>
                  <SelectTrigger className="w-full bg-surface border-border"><SelectValue placeholder="Select your role" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CEO">CEO</SelectItem>
                    <SelectItem value="CTO">CTO</SelectItem>
                    <SelectItem value="Head of Product">Head of Product</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm text-muted-foreground mb-1.5">Email</label>
                <input name="email" type="email" required maxLength={255} className="w-full px-4 py-2.5 rounded-md bg-surface border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
              <div>
                <label className="block text-sm text-muted-foreground mb-1.5">What agents or AI workflows are you building?</label>
                <textarea name="workflows" rows={3} maxLength={1000} className="w-full px-4 py-2.5 rounded-md bg-surface border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none" />
              </div>
              <div>
                <label className="block text-sm text-muted-foreground mb-1.5">How many clients could benefit?</label>
                <Select required value={clients} onValueChange={setClients}>
                  <SelectTrigger className="w-full bg-surface border-border"><SelectValue placeholder="Select range" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-10">1-10</SelectItem>
                    <SelectItem value="11-50">11-50</SelectItem>
                    <SelectItem value="50+">50+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <button type="submit" disabled={sending} className="w-full py-3 rounded-md bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity disabled:opacity-50">
                {sending ? "Sending..." : "Request Partner Pricing"}
              </button>
              <p className="text-xs text-muted-foreground text-center">No commitment. Response within 24 hours.</p>
            </form>
          )}

          <div className="mt-12 text-center">
            <p className="text-xs text-muted-foreground/70 uppercase tracking-wider mb-4">Already building with</p>
            <div className="flex flex-wrap justify-center gap-2">
              {frameworks.map((fw) => (
                <span key={fw} className="text-sm font-medium px-3 py-1.5 rounded-full border border-border bg-secondary/50 text-muted-foreground">{fw}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Partners;
