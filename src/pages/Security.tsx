import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Download, Mail } from "lucide-react";

const heroBadges = [
  { label: "AES-256-GCM Encryption", active: true },
  { label: "Blockchain-Certified Audit Trail", active: true },
  { label: "GDPR Art.5 Compliant", active: true },
  { label: "TLS 1.3 Enforced", active: true },
  { label: "SOC2 Type I — In Preparation", active: false },
  { label: "ISO 27001 — In Preparation", active: false },
];

const pillars = [
  { icon: "🔐", title: "Zero Raw PII Exposure", desc: "No plaintext personal data is ever transmitted to an AI provider. Tokenization occurs within Privaro's trusted boundary. Original values are stored exclusively in the encrypted vault." },
  { icon: "⛓️", title: "Verifiable Compliance Evidence", desc: "Audit records are cryptographically certified on Fantom Opera Mainnet. Compliance is demonstrable to regulators independently of Privaro's infrastructure." },
  { icon: "🛡️", title: "Defense in Depth", desc: "Security controls are layered: TLS 1.3 at the network level, JWT + API key auth at the application level, Row Level Security at the database level, AES-256-GCM at the data level." },
  { icon: "⚙️", title: "Policy-Driven Governance", desc: "Every entity type has a configurable action: tokenise, anonymise, or block. Sector presets for Legal, Healthcare, Fintech, HR, and Port Environmental are built-in." },
  { icon: "🤖", title: "Agent Governance", desc: "Autonomous AI agents operate under the same privacy policies as human users. The Agent API enforces governance at every step of automated workflows — EU AI Act compliant." },
  { icon: "🌍", title: "EU Data Residency", desc: "All infrastructure is hosted in EU regions by default. Database in eu-central-1, proxy in europe-west4. No data leaves the EU without explicit customer configuration." },
];

const controls = [
  { id: "A.8.24 / CC6.1", desc: "AES-256-GCM encryption for all token originals. 12-byte random nonce per operation. Per-org key segmentation.", status: "implemented" as const },
  { id: "A.8.3 / CC6.3", desc: "Row Level Security enforces org isolation at the database level. All queries filtered by org_id.", status: "implemented" as const },
  { id: "A.8.5 / CC6.1", desc: "API keys stored as SHA-256 hashes. Plaintext never persisted. JWT verification on all frontend calls.", status: "implemented" as const },
  { id: "A.8.15 / CC7.2", desc: "Immutable audit logs with blockchain certification. UPDATE restricted to ibs_* columns only via RLS policy.", status: "implemented" as const },
  { id: "A.8.20 / CC6.6", desc: "TLS 1.3 enforced on all connections. No TLS 1.0 or 1.1 accepted. CORS configured per environment.", status: "implemented" as const },
  { id: "A.8.34 / CC4.1", desc: "Blockchain-certified audit trail. Every PII interaction generates a tamper-evident record on Fantom Opera Mainnet.", status: "implemented" as const },
  { id: "A.5.2 / CC6.2", desc: "Four-tier role model: viewer, developer, dpo, admin. Cumulative permissions enforced at DB level, not application layer.", status: "implemented" as const },
  { id: "A.8.25 / CC8.1", desc: "Secure development lifecycle: GitHub-based code review, Railway deployment pipeline, automated health checks.", status: "progress" as const },
];

const regulations = [
  { reg: "GDPR Art.5", scope: "Data minimization, purpose limitation", coverage: "Policy engine enforces minimum necessary processing. No raw PII to LLMs.", status: "Covered" as const },
  { reg: "GDPR Art.9", scope: "Special category data (health, biometric)", coverage: "health_record entity blocked or anonymised by default in Healthcare/HR presets.", status: "Covered" as const },
  { reg: "GDPR Art.30", scope: "Records of processing activities", coverage: "Blockchain-certified audit log per interaction. DPO report export with TX hashes.", status: "Covered" as const },
  { reg: "EU AI Act", scope: "High-risk AI systems, human oversight", coverage: "Agent API enforces governance on autonomous agents. Per-entity action in audit logs.", status: "Covered" as const },
  { reg: "PSD2", scope: "Payment data protection", coverage: "IBAN and card numbers tokenized before any LLM call. Fintech preset built-in.", status: "Covered" as const },
  { reg: "HIPAA", scope: "Protected Health Information", coverage: "PHI tokenized/anonymised. Blockchain audit trail per PHI access. Healthcare preset.", status: "Covered" as const },
  { reg: "ISO 27001:2022", scope: "Information security management", coverage: "83% of Annex A controls implemented. ISMS documentation in progress.", status: "In Progress" as const },
  { reg: "SOC2 Type I", scope: "Security, Confidentiality trust criteria", coverage: "Controls implemented. Formal audit preparation in progress for Q3 2026.", status: "In Progress" as const },
];

const stats = [
  { value: "Fantom", label: "Opera Mainnet blockchain" },
  { value: "~60s", label: "Avg. certification time" },
  { value: "100x", label: "Batch efficiency (events per TX)" },
  { value: "SHA-512", label: "Hashing algorithm" },
];

const policyDocs = [
  { icon: "📋", title: "Information Security Policy", id: "POL-001 · v1.0 · March 2026" },
  { icon: "🔒", title: "Data Processing & Privacy Policy", id: "POL-002 · v1.0 · March 2026" },
  { icon: "✅", title: "Security Controls Register (ISO 27001 Annex A)", id: "POL-003 · v1.0 · March 2026 · 83% implemented" },
  { icon: "🚨", title: "Incident Response Plan", id: "POL-004 · v1.0 · March 2026 · GDPR Art.33 compliant" },
  { icon: "♻️", title: "Business Continuity & Availability Policy", id: "POL-005 · v1.0 · March 2026 · RTO < 4h · RPO < 1h" },
  { icon: "📄", title: "Data Processing Agreement (DPA)", id: "Available upon request · GDPR Art.28 compliant" },
];

const SectionHeader = ({ label, title, desc }: { label: string; title: string; desc: string }) => (
  <>
    <p className="text-xs font-bold tracking-widest text-primary uppercase mb-3">{label}</p>
    <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">{title}</h2>
    <p className="text-muted-foreground max-w-xl">{desc}</p>
  </>
);

const Security = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* HERO */}
      <section className="bg-gradient-to-br from-background to-secondary text-foreground py-20 px-8 text-center">
        <span className="inline-flex items-center gap-2 bg-secondary border border-border rounded-full px-4 py-1.5 text-xs text-primary mb-6">
          🔒 Security &amp; Compliance
        </span>
        <h1 className="text-3xl md:text-5xl font-extrabold mb-4 leading-tight">
          Enterprise-grade security<br />by design, not by policy
        </h1>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-10">
          Privaro's privacy infrastructure is built on the principle that security controls must be architectural — not application-layer afterthoughts.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          {heroBadges.map((b) => (
            <span key={b.label} className="inline-flex items-center gap-2 bg-secondary/60 border border-border rounded-lg px-4 py-2 text-xs text-muted-foreground">
              <span className={`w-2 h-2 rounded-full ${b.active ? "bg-green-400 shadow-[0_0_6px_theme(colors.green.400)]" : "bg-yellow-300"}`} />
              {b.label}
            </span>
          ))}
        </div>
      </section>

      {/* ARCHITECTURE */}
      <section className="py-16 border-b border-border">
        <div className="max-w-[1100px] mx-auto px-8">
          <SectionHeader label="Architecture" title="Security built into every layer" desc="Privacy controls are applied at the network layer — before any data reaches an AI model. This is architecturally superior to post-processing or application-level filtering." />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
            {pillars.map((p) => (
              <div key={p.title} className="bg-card border border-border rounded-xl p-7">
                <div className="text-3xl mb-4">{p.icon}</div>
                <h3 className="text-sm font-bold text-foreground mb-2">{p.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTROLS */}
      <section className="py-16 border-b border-border">
        <div className="max-w-[1100px] mx-auto px-8">
          <SectionHeader label="Controls" title="Implemented security controls" desc="Key technical controls aligned to ISO/IEC 27001:2022 Annex A and SOC2 Trust Services Criteria." />
          <div className="grid gap-3 mt-8">
            {controls.map((c) => (
              <div key={c.id} className="grid grid-cols-1 sm:grid-cols-[200px_1fr_auto] gap-4 items-center p-4 bg-card border border-border rounded-lg">
                <span className="font-mono text-xs font-bold text-primary">{c.id}</span>
                <span className="text-sm text-foreground">{c.desc}</span>
                <span className={`inline-flex items-center gap-1.5 text-xs font-semibold rounded-full px-3 py-1 whitespace-nowrap ${c.status === "implemented" ? "bg-green-500/15 text-green-400" : "bg-yellow-500/15 text-yellow-400"}`}>
                  {c.status === "implemented" ? "✓ Implemented" : "⟳ In Progress"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMPLIANCE */}
      <section className="py-16 border-b border-border">
        <div className="max-w-[1100px] mx-auto px-8">
          <SectionHeader label="Compliance" title="Regulatory coverage" desc="Privaro is designed to help enterprise customers meet their data protection obligations under multiple regulatory frameworks." />
          <div className="overflow-x-auto mt-8">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  {["Regulation", "Scope", "Privaro Coverage", "Status"].map((h, i) => (
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
                      <span className={`inline-flex items-center gap-1.5 text-xs font-semibold rounded-full px-3 py-1 ${r.status === "Covered" ? "bg-green-500/15 text-green-400" : "bg-yellow-500/15 text-yellow-400"}`}>{r.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* BLOCKCHAIN */}
      <section className="py-16 border-b border-border">
        <div className="max-w-[1100px] mx-auto px-8">
          <SectionHeader label="Blockchain Audit Trail" title="Tamper-proof compliance evidence" desc="Every audit event is cryptographically certified on Fantom Opera Mainnet — independently verifiable by regulators, auditors, and data subjects." />

          <div className="grid grid-cols-1 sm:grid-cols-2 bg-gradient-to-br from-background to-secondary rounded-2xl p-10 gap-8 mt-8 border border-border">
            <div>
              <h3 className="text-lg font-bold text-foreground mb-3">How it works</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Every PII detection event generates an audit record. The record's SHA-512 hash is certified on Fantom Opera Mainnet via iBS API. The resulting blockchain TX hash is stored in the audit log.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed mt-3">
                Batch certification reduces costs: up to 100 audit events are certified in a single blockchain transaction every 5 minutes.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground mb-3">Public verifiability</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Any certified event can be independently verified using the TX hash — no access to Privaro's infrastructure required.
              </p>
              <div className="font-mono text-[11px] text-primary break-all mt-3 p-3 bg-muted rounded-md">
                Example TX:<br />
                https://checker.icommunitylabs.com/check/<br />
                fantom_opera_mainnet/<br />
                0xfbe1b5163bdb4e7265e130e09b1b2b0c6b606799...
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 mt-8">
            {stats.map((s) => (
              <div key={s.label} className="text-center p-6 border border-border rounded-xl bg-card">
                <div className="text-3xl font-extrabold text-foreground leading-none mb-1.5">{s.value}</div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* POLICY DOCUMENTS */}
      <section className="py-16 border-b border-border">
        <div className="max-w-[1100px] mx-auto px-8">
          <SectionHeader label="Policy Documents" title="Security policies & procedures" desc="Privaro maintains a complete set of security policies aligned to ISO 27001 and SOC2 requirements. Available to enterprise customers under NDA." />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-8">
            {policyDocs.map((d) => (
              <div key={d.title} className="border border-border rounded-xl px-5 py-4 flex items-start gap-4 bg-card">
                <span className="text-2xl flex-shrink-0">{d.icon}</span>
                <div>
                  <div className="text-sm font-bold text-foreground mb-1">{d.title}</div>
                  <div className="text-xs text-muted-foreground font-mono">{d.id}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="max-w-[1100px] mx-auto px-8">
          <div className="bg-card border border-border rounded-2xl p-12 text-center">
            <h2 className="text-2xl font-bold text-foreground mb-3">Security questions?</h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Our team is available to answer security questionnaires, complete vendor assessments, or schedule a technical deep-dive.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button asChild>
                <a href="mailto:hello@icommunity.io">
                  <Mail className="w-4 h-4" />
                  Contact Security Team
                </a>
              </Button>
              <Button variant="outline" asChild>
                <a href="/docs/Privaro_Compliance_Pack_v1.0.zip" download>
                  <Download className="w-4 h-4" />
                  Download Policy Documents
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Security;
