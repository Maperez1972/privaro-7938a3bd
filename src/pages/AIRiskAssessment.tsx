import { useState } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import {
  Eye, AlertTriangle, FileText, Shield,
  Plug, Search, BarChart,
  Users, EyeOff, Scale,
} from "lucide-react";

const whatYouGet = [
  { icon: Eye, title: "Real AI usage visibility", desc: "See exactly what data your team is sending to AI tools — not assumptions, real data." },
  { icon: AlertTriangle, title: "Sensitive data detection", desc: "PII, financial identifiers, contracts, health data — classified by risk level." },
  { icon: FileText, title: "Audit-ready report", desc: "Structured findings with risk levels, affected workflows, and remediation priorities." },
  { icon: Shield, title: "GDPR & EU AI Act gap analysis", desc: "Identify compliance gaps before a regulator does." },
];

const steps = [
  { icon: Plug, title: "Connect or simulate", desc: "Connect your AI tools or simulate workflows. No complex integration required to get started." },
  { icon: Search, title: "Privaro analyses", desc: "The privacy engine scans prompts and interactions. PII detected, classified, and risk-scored." },
  { icon: BarChart, title: "You receive the report", desc: "Structured findings in 1-2 weeks. Risk levels, affected data types, and clear next steps." },
];

const whyMatters = [
  { icon: Users, title: "Employees are already using AI", desc: "Teams across legal, finance, and operations use AI daily — with real data, outside controlled systems." },
  { icon: EyeOff, title: "No visibility by default", desc: "Standard AI tools have no data governance layer. What gets sent — stays sent." },
  { icon: Scale, title: "Regulatory pressure is increasing", desc: "GDPR enforcement on AI interactions is active. EU AI Act enters into force progressively 2025-2026." },
];

const roleOptions = ["CISO", "CTO", "DPO", "Legal", "Compliance", "Other"];
const sizeOptions = ["1-50", "51-200", "201-1000", "1000+"];

const AIRiskAssessmentPage = () => {
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [role, setRole] = useState("");
  const [companySize, setCompanySize] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSending(true);
    setError("");
    const formData = new FormData(e.currentTarget);
    try {
      const concern = `AI tools used: ${formData.get("aiTools") || "Not specified"}\nCompany size: ${companySize || "Not specified"}\nSource: AI Risk Assessment landing`;
      const { data, error: fnError } = await supabase.functions.invoke("send-demo-request", {
        body: {
          name: formData.get("name"),
          company: formData.get("company"),
          industry: "AI Risk Assessment",
          role,
          email: formData.get("email"),
          concern,
        },
      });
      if (fnError) throw fnError;
      if (data && !data.success) throw new Error(data.error);
      setSubmitted(true);
    } catch (err) {
      console.error("Error sending assessment request:", err);
      setError("Something went wrong. Please try again or email info@privaro.ai.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-primary bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-6">
              Free Assessment
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              See what data your team is already sending to <span className="text-primary">AI</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Most companies have no visibility into what their employees paste into AI tools.
              <br />We do — in 1-2 weeks.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
              <a href="#assessment-form" className="px-8 py-3.5 rounded-md bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity">
                Start Risk Assessment
              </a>
              <a href="#sample-report" className="px-8 py-3.5 rounded-md border border-border bg-card text-foreground font-semibold hover:bg-secondary/50 transition-colors">
                See a sample report
              </a>
            </div>
            <p className="text-sm text-muted-foreground/80 mt-4">
              No commitment. No complex integration required.
            </p>
          </motion.div>
        </div>
      </section>

      {/* What You Get */}
      <section className="pb-20 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-2xl md:text-3xl font-bold text-center mb-12">
            What the assessment gives you
          </motion.h2>
          <div className="grid md:grid-cols-2 gap-6">
            {whatYouGet.map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="p-6 rounded-xl border border-border bg-card hover:border-primary/40 transition-colors">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-5">
                  <item.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="pb-20 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-2xl md:text-3xl font-bold text-center mb-3">
            Simple. No disruption.
          </motion.h2>
          <div className="flex justify-center mb-12">
            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-primary bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5">
              Completed in 1–2 weeks
            </span>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {steps.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="p-6 rounded-xl border border-border bg-card text-center">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-5">
                  <s.icon className="h-6 w-6 text-primary" />
                </div>
                <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">Step {i + 1}</p>
                <h3 className="text-lg font-semibold mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Sample Output */}
      <section id="sample-report" className="pb-20 px-6 scroll-mt-24">
        <div className="max-w-3xl mx-auto">
          <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-2xl md:text-3xl font-bold text-center mb-12">
            What you'll see
          </motion.h2>
          <div className="rounded-xl border border-border bg-card p-8 font-mono text-sm">
            <p className="text-primary font-bold mb-4">── AI Risk Assessment Sample ─────────────────</p>
            <div className="space-y-3 text-muted-foreground">
              <p><span className="text-red-400 font-bold">● HIGH RISK</span>   23% of prompts contained sensitive data</p>
              <p><span className="text-orange-400 font-bold">● MEDIUM  </span>   12% included financial identifiers (IBAN, salary)</p>
              <p><span className="text-yellow-400 font-bold">● MEDIUM  </span>   8% contained contract or legal document excerpts</p>
              <p><span className="text-blue-400 font-bold">● LOW     </span>   5% involved personal identifiers (names, emails)</p>
              <p className="pt-3 border-t border-border text-xs">Workflows affected: CRM analysis, contract review, financial reporting</p>
              <p className="text-xs">Recommended: Immediate tokenisation policy for finance and legal workflows</p>
            </div>
            <p className="text-xs text-muted-foreground/60 mt-4 italic">
              * Illustrative sample. Actual results vary by organisation — but exposure is almost always present.
            </p>
          </div>
        </div>
      </section>

      {/* Why It Matters */}
      <section className="pb-20 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-2xl md:text-3xl font-bold text-center mb-12">
            You can't control what you can't see
          </motion.h2>
          <div className="grid md:grid-cols-3 gap-6">
            {whyMatters.map((c, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="p-6 rounded-xl border border-border bg-card">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-5">
                  <c.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{c.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{c.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Form */}
      <section id="assessment-form" className="py-20 px-6 scroll-mt-24 relative">
        <div className="absolute inset-0 grid-pattern opacity-20" />
        <div className="relative max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-3xl md:text-4xl font-bold mb-4">
              Start with <span className="text-gradient">visibility</span>
            </motion.h2>
            <p className="text-muted-foreground">
              Fill in the form and we'll reach out within 24 hours to schedule your assessment.
            </p>
          </div>
          {submitted ? (
            <div className="p-8 rounded-lg border border-primary/30 bg-card text-center glow-border">
              <h3 className="text-2xl font-bold mb-3 text-foreground">Thank you</h3>
              <p className="text-muted-foreground">
                We've received your request. Our team will contact you within 24 hours to schedule your AI Risk Assessment.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-8 rounded-lg border border-border bg-card space-y-5">
              <div>
                <label className="block text-sm text-muted-foreground mb-1.5">Name</label>
                <input name="name" type="text" required className="w-full px-4 py-2.5 rounded-md bg-surface border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
              <div>
                <label className="block text-sm text-muted-foreground mb-1.5">Company</label>
                <input name="company" type="text" required className="w-full px-4 py-2.5 rounded-md bg-surface border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
              <div>
                <label className="block text-sm text-muted-foreground mb-1.5">Role</label>
                <Select required value={role} onValueChange={setRole}>
                  <SelectTrigger className="w-full bg-surface border-border text-foreground"><SelectValue placeholder="Select your role" /></SelectTrigger>
                  <SelectContent>{roleOptions.map((r) => (<SelectItem key={r} value={r}>{r}</SelectItem>))}</SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm text-muted-foreground mb-1.5">Work email</label>
                <input name="email" type="email" required className="w-full px-4 py-2.5 rounded-md bg-surface border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
              <div>
                <label className="block text-sm text-muted-foreground mb-1.5">Company size <span className="text-muted-foreground/60">(optional)</span></label>
                <Select value={companySize} onValueChange={setCompanySize}>
                  <SelectTrigger className="w-full bg-surface border-border text-foreground"><SelectValue placeholder="Select company size" /></SelectTrigger>
                  <SelectContent>{sizeOptions.map((s) => (<SelectItem key={s} value={s}>{s}</SelectItem>))}</SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm text-muted-foreground mb-1.5">What AI tools does your team use? <span className="text-muted-foreground/60">(optional)</span></label>
                <textarea name="aiTools" rows={3} className="w-full px-4 py-2.5 rounded-md bg-surface border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none" />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <button type="submit" disabled={sending} className="w-full py-3 rounded-md bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity disabled:opacity-50">
                {sending ? "Sending..." : "Request AI Risk Assessment"}
              </button>
              <p className="text-xs text-muted-foreground text-center">
                No commitment. We'll contact you within 24 hours.
              </p>
            </form>
          )}
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-2xl md:text-3xl font-bold mb-4">
            Privaro is the governance layer for enterprise AI.
          </motion.h2>
          <p className="text-muted-foreground mb-8">
            Control what reaches your AI models. Audit every interaction. Deploy in minutes.
          </p>
          <a href="#assessment-form" className="inline-block px-8 py-3.5 rounded-md bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity">
            Run AI Risk Assessment
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AIRiskAssessmentPage;
