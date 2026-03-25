const Security = () => {
  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif', color: '#1F2937', background: '#FFFFFF', lineHeight: 1.6 }}>
      {/* NAV */}
      <nav style={{ background: '#1A1A2E', padding: '0 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
        <a href="/" style={{ color: 'white', fontSize: '1.25rem', fontWeight: 700, letterSpacing: '0.05em', textDecoration: 'none' }}>
          PRIV<span style={{ color: '#A78BFA' }}>ARO</span>
        </a>
        <div style={{ display: 'flex', gap: '2rem' }} className="hidden sm:flex">
          <a href="/" style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.875rem', textDecoration: 'none' }}>Home</a>
          <a href="/docs" style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.875rem', textDecoration: 'none' }}>Docs</a>
          <a href="mailto:security@icommunity.io" style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.875rem', textDecoration: 'none' }}>Contact</a>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ background: 'linear-gradient(135deg, #1A1A2E 0%, #2D1B69 100%)', color: 'white', padding: '80px 2rem', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 100, padding: '0.375rem 1rem', fontSize: '0.8rem', color: '#C4B5FD', marginBottom: '1.5rem' }}>
          🔒 Security &amp; Compliance
        </div>
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.25rem)', fontWeight: 800, marginBottom: '1rem', lineHeight: 1.15 }}>
          Enterprise-grade security<br />by design, not by policy
        </h1>
        <p style={{ fontSize: '1.125rem', color: 'rgba(255,255,255,0.75)', maxWidth: 600, margin: '0 auto 2.5rem' }}>
          Privaro's privacy infrastructure is built on the principle that security controls must be architectural — not application-layer afterthoughts.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.75rem' }}>
          {[
            { dot: 'green', label: 'AES-256-GCM Encryption' },
            { dot: 'green', label: 'Blockchain-Certified Audit Trail' },
            { dot: 'green', label: 'GDPR Art.5 Compliant' },
            { dot: 'green', label: 'TLS 1.3 Enforced' },
            { dot: 'amber', label: 'SOC2 Type I — In Preparation' },
            { dot: 'amber', label: 'ISO 27001 — In Preparation' },
          ].map((b) => (
            <span key={b.label} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, padding: '0.5rem 1rem', fontSize: '0.8rem', color: 'rgba(255,255,255,0.85)' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: b.dot === 'green' ? '#4ADE80' : '#FCD34D', boxShadow: b.dot === 'green' ? '0 0 6px #4ADE80' : 'none' }} />
              {b.label}
            </span>
          ))}
        </div>
      </section>

      {/* ARCHITECTURE */}
      <section style={{ padding: '72px 0', borderBottom: '1px solid #E5E7EB' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 2rem' }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', color: '#7B2D8B', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Architecture</p>
          <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 700, color: '#1A1A2E', marginBottom: '0.75rem' }}>Security built into every layer</h2>
          <p style={{ color: '#4B5563', maxWidth: 640, fontSize: '1rem' }}>
            Privacy controls are applied at the network layer — before any data reaches an AI model. This is architecturally superior to post-processing or application-level filtering.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginTop: '2.5rem' }}>
            {[
              { icon: '🔐', title: 'Zero Raw PII Exposure', desc: "No plaintext personal data is ever transmitted to an AI provider. Tokenization occurs within Privaro's trusted boundary. Original values are stored exclusively in the encrypted vault." },
              { icon: '⛓️', title: 'Verifiable Compliance Evidence', desc: "Audit records are cryptographically certified on Fantom Opera Mainnet. Compliance is demonstrable to regulators independently of Privaro's infrastructure." },
              { icon: '🛡️', title: 'Defense in Depth', desc: 'Security controls are layered: TLS 1.3 at the network level, JWT + API key auth at the application level, Row Level Security at the database level, AES-256-GCM at the data level.' },
              { icon: '⚙️', title: 'Policy-Driven Governance', desc: 'Every entity type has a configurable action: tokenise, anonymise, or block. Sector presets for Legal, Healthcare, Fintech, HR, and Port Environmental are built-in.' },
              { icon: '🤖', title: 'Agent Governance', desc: 'Autonomous AI agents operate under the same privacy policies as human users. The Agent API enforces governance at every step of automated workflows — EU AI Act compliant.' },
              { icon: '🌍', title: 'EU Data Residency', desc: 'All infrastructure is hosted in EU regions by default. Database in eu-central-1, proxy in europe-west4. No data leaves the EU without explicit customer configuration.' },
            ].map((p) => (
              <div key={p.title} style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 12, padding: '1.75rem' }}>
                <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>{p.icon}</div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1A1A2E', marginBottom: '0.5rem' }}>{p.title}</h3>
                <p style={{ fontSize: '0.875rem', color: '#4B5563', lineHeight: 1.6 }}>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTROLS */}
      <section style={{ padding: '72px 0', borderBottom: '1px solid #E5E7EB' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 2rem' }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', color: '#7B2D8B', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Controls</p>
          <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 700, color: '#1A1A2E', marginBottom: '0.75rem' }}>Implemented security controls</h2>
          <p style={{ color: '#4B5563', maxWidth: 640, fontSize: '1rem' }}>
            Key technical controls aligned to ISO/IEC 27001:2022 Annex A and SOC2 Trust Services Criteria.
          </p>
          <div style={{ display: 'grid', gap: '0.75rem', marginTop: '2rem' }}>
            {[
              { id: 'A.8.24 / CC6.1', desc: 'AES-256-GCM encryption for all token originals. 12-byte random nonce per operation. Per-org key segmentation.', status: 'implemented' },
              { id: 'A.8.3 / CC6.3', desc: 'Row Level Security enforces org isolation at the database level. All queries filtered by org_id.', status: 'implemented' },
              { id: 'A.8.5 / CC6.1', desc: 'API keys stored as SHA-256 hashes. Plaintext never persisted. JWT verification on all frontend calls.', status: 'implemented' },
              { id: 'A.8.15 / CC7.2', desc: 'Immutable audit logs with blockchain certification. UPDATE restricted to ibs_* columns only via RLS policy.', status: 'implemented' },
              { id: 'A.8.20 / CC6.6', desc: 'TLS 1.3 enforced on all connections. No TLS 1.0 or 1.1 accepted. CORS configured per environment.', status: 'implemented' },
              { id: 'A.8.34 / CC4.1', desc: 'Blockchain-certified audit trail. Every PII interaction generates a tamper-evident record on Fantom Opera Mainnet.', status: 'implemented' },
              { id: 'A.5.2 / CC6.2', desc: 'Four-tier role model: viewer, developer, dpo, admin. Cumulative permissions enforced at DB level, not application layer.', status: 'implemented' },
              { id: 'A.8.25 / CC8.1', desc: 'Secure development lifecycle: GitHub-based code review, Railway deployment pipeline, automated health checks.', status: 'progress' },
            ].map((c) => (
              <div key={c.id} className="grid grid-cols-1 sm:grid-cols-[200px_1fr_auto]" style={{ gap: '1rem', alignItems: 'center', padding: '1rem 1.25rem', background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 8 }}>
                <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', fontWeight: 700, color: '#2563EB' }}>{c.id}</span>
                <span style={{ fontSize: '0.875rem', color: '#1F2937' }}>{c.desc}</span>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.75rem', fontWeight: 600, borderRadius: 100, padding: '0.25rem 0.75rem', whiteSpace: 'nowrap',
                  background: c.status === 'implemented' ? '#DCFCE7' : '#FEF3C7',
                  color: c.status === 'implemented' ? '#16A34A' : '#D97706',
                }}>
                  {c.status === 'implemented' ? '✓ Implemented' : '⟳ In Progress'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMPLIANCE */}
      <section style={{ padding: '72px 0', borderBottom: '1px solid #E5E7EB' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 2rem' }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', color: '#7B2D8B', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Compliance</p>
          <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 700, color: '#1A1A2E', marginBottom: '0.75rem' }}>Regulatory coverage</h2>
          <p style={{ color: '#4B5563', maxWidth: 640, fontSize: '1rem' }}>
            Privaro is designed to help enterprise customers meet their data protection obligations under multiple regulatory frameworks.
          </p>
          <div style={{ overflowX: 'auto', marginTop: '2rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Regulation', 'Scope', 'Privaro Coverage', 'Status'].map((h, i) => (
                    <th key={h} style={{
                      textAlign: 'left', padding: '0.75rem 1rem', background: '#1A1A2E', color: 'white', fontSize: '0.8rem', fontWeight: 600,
                      borderRadius: i === 0 ? '8px 0 0 0' : i === 3 ? '0 8px 0 0' : 0,
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { reg: 'GDPR Art.5', scope: 'Data minimization, purpose limitation', coverage: 'Policy engine enforces minimum necessary processing. No raw PII to LLMs.', status: 'Covered' },
                  { reg: 'GDPR Art.9', scope: 'Special category data (health, biometric)', coverage: 'health_record entity blocked or anonymised by default in Healthcare/HR presets.', status: 'Covered' },
                  { reg: 'GDPR Art.30', scope: 'Records of processing activities', coverage: 'Blockchain-certified audit log per interaction. DPO report export with TX hashes.', status: 'Covered' },
                  { reg: 'EU AI Act', scope: 'High-risk AI systems, human oversight', coverage: 'Agent API enforces governance on autonomous agents. Per-entity action in audit logs.', status: 'Covered' },
                  { reg: 'PSD2', scope: 'Payment data protection', coverage: 'IBAN and card numbers tokenized before any LLM call. Fintech preset built-in.', status: 'Covered' },
                  { reg: 'HIPAA', scope: 'Protected Health Information', coverage: 'PHI tokenized/anonymised. Blockchain audit trail per PHI access. Healthcare preset.', status: 'Covered' },
                  { reg: 'ISO 27001:2022', scope: 'Information security management', coverage: '83% of Annex A controls implemented. ISMS documentation in progress.', status: 'In Progress' },
                  { reg: 'SOC2 Type I', scope: 'Security, Confidentiality trust criteria', coverage: 'Controls implemented. Formal audit preparation in progress for Q3 2026.', status: 'In Progress' },
                ].map((r, i) => (
                  <tr key={r.reg}>
                    <td style={{ padding: '0.875rem 1rem', borderBottom: '1px solid #E5E7EB', fontSize: '0.875rem', fontWeight: 600, background: i % 2 === 1 ? '#F9FAFB' : undefined }}>{r.reg}</td>
                    <td style={{ padding: '0.875rem 1rem', borderBottom: '1px solid #E5E7EB', fontSize: '0.875rem', background: i % 2 === 1 ? '#F9FAFB' : undefined }}>{r.scope}</td>
                    <td style={{ padding: '0.875rem 1rem', borderBottom: '1px solid #E5E7EB', fontSize: '0.875rem', background: i % 2 === 1 ? '#F9FAFB' : undefined }}>{r.coverage}</td>
                    <td style={{ padding: '0.875rem 1rem', borderBottom: '1px solid #E5E7EB', fontSize: '0.875rem', background: i % 2 === 1 ? '#F9FAFB' : undefined }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.75rem', fontWeight: 600, borderRadius: 100, padding: '0.25rem 0.75rem',
                        background: r.status === 'Covered' ? '#DCFCE7' : '#FEF3C7',
                        color: r.status === 'Covered' ? '#16A34A' : '#D97706',
                      }}>{r.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* BLOCKCHAIN */}
      <section style={{ padding: '72px 0', borderBottom: '1px solid #E5E7EB' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 2rem' }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', color: '#7B2D8B', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Blockchain Audit Trail</p>
          <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 700, color: '#1A1A2E', marginBottom: '0.75rem' }}>Tamper-proof compliance evidence</h2>
          <p style={{ color: '#4B5563', maxWidth: 640, fontSize: '1rem' }}>
            Every audit event is cryptographically certified on Fantom Opera Mainnet — independently verifiable by regulators, auditors, and data subjects.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2" style={{ background: 'linear-gradient(135deg, #1A1A2E 0%, #2D1B69 100%)', borderRadius: 16, padding: '2.5rem', color: 'white', gap: '2rem', marginTop: '2rem' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem' }}>How it works</h3>
              <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.75)', lineHeight: 1.7 }}>
                Every PII detection event generates an audit record. The record's SHA-512 hash is certified on Fantom Opera Mainnet via iBS API. The resulting blockchain TX hash is stored in the audit log.
              </p>
              <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.75)', lineHeight: 1.7, marginTop: '0.75rem' }}>
                Batch certification reduces costs: up to 100 audit events are certified in a single blockchain transaction every 5 minutes.
              </p>
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem' }}>Public verifiability</h3>
              <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.75)', lineHeight: 1.7 }}>
                Any certified event can be independently verified using the TX hash — no access to Privaro's infrastructure required.
              </p>
              <div style={{ fontFamily: 'monospace', fontSize: '0.7rem', color: '#A78BFA', wordBreak: 'break-all', marginTop: '0.75rem', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', borderRadius: 6 }}>
                Example TX:<br />
                https://checker.icommunitylabs.com/check/<br />
                fantom_opera_mainnet/<br />
                0xfbe1b5163bdb4e7265e130e09b1b2b0c6b606799...
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.25rem', marginTop: '2rem' }}>
            {[
              { value: 'Fantom', label: 'Opera Mainnet blockchain' },
              { value: '~60s', label: 'Avg. certification time' },
              { value: '100x', label: 'Batch efficiency (events per TX)' },
              { value: 'SHA-512', label: 'Hashing algorithm' },
            ].map((s) => (
              <div key={s.label} style={{ textAlign: 'center', padding: '1.5rem', border: '1px solid #E5E7EB', borderRadius: 12 }}>
                <div style={{ fontSize: '2.25rem', fontWeight: 800, color: '#1A1A2E', lineHeight: 1, marginBottom: '0.375rem' }}>{s.value}</div>
                <div style={{ fontSize: '0.8rem', color: '#4B5563' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* POLICY DOCUMENTS */}
      <section style={{ padding: '72px 0', borderBottom: '1px solid #E5E7EB' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 2rem' }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', color: '#7B2D8B', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Policy Documents</p>
          <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 700, color: '#1A1A2E', marginBottom: '0.75rem' }}>Security policies &amp; procedures</h2>
          <p style={{ color: '#4B5563', maxWidth: 640, fontSize: '1rem' }}>
            Privaro maintains a complete set of security policies aligned to ISO 27001 and SOC2 requirements. Available to enterprise customers under NDA.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem', marginTop: '2rem' }}>
            {[
              { icon: '📋', title: 'Information Security Policy', id: 'POL-001 · v1.0 · March 2026' },
              { icon: '🔒', title: 'Data Processing & Privacy Policy', id: 'POL-002 · v1.0 · March 2026' },
              { icon: '✅', title: 'Security Controls Register (ISO 27001 Annex A)', id: 'POL-003 · v1.0 · March 2026 · 83% implemented' },
              { icon: '🚨', title: 'Incident Response Plan', id: 'POL-004 · v1.0 · March 2026 · GDPR Art.33 compliant' },
              { icon: '♻️', title: 'Business Continuity & Availability Policy', id: 'POL-005 · v1.0 · March 2026 · RTO < 4h · RPO < 1h' },
              { icon: '📄', title: 'Data Processing Agreement (DPA)', id: 'Available upon request · GDPR Art.28 compliant' },
            ].map((d) => (
              <div key={d.title} style={{ border: '1px solid #E5E7EB', borderRadius: 10, padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>{d.icon}</span>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1A1A2E', marginBottom: '0.25rem' }}>{d.title}</div>
                  <div style={{ fontSize: '0.75rem', color: '#9CA3AF', fontFamily: 'monospace' }}>{d.id}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '72px 0' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 2rem' }}>
          <div style={{ background: '#F9FAFB', borderRadius: 16, padding: '3rem 2rem', textAlign: 'center' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#1A1A2E', marginBottom: '0.75rem' }}>Security questions?</h2>
            <p style={{ color: '#4B5563', marginBottom: '2rem', maxWidth: 480, marginLeft: 'auto', marginRight: 'auto' }}>
              Our team is available to answer security questionnaires, complete vendor assessments, or schedule a technical deep-dive.
            </p>
            <div>
              <a href="mailto:security@icommunity.io" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.75rem', borderRadius: 8, fontSize: '0.9rem', fontWeight: 600, background: '#7B2D8B', color: 'white', textDecoration: 'none' }}>
                📧 Contact Security Team
              </a>
              <a href="mailto:hello@icommunity.io" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.75rem', borderRadius: 8, fontSize: '0.9rem', fontWeight: 600, background: 'white', color: '#1A1A2E', border: '1px solid #E5E7EB', textDecoration: 'none', marginLeft: '0.75rem' }}>
                Request Policy Documents
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: '#1A1A2E', color: 'rgba(255,255,255,0.6)', textAlign: 'center', padding: '2rem', fontSize: '0.8rem' }}>
        <p>© 2026 <span style={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>iCommunity Labs</span> · privaro.io · Last reviewed March 2026</p>
        <p style={{ marginTop: '0.5rem' }}>
          For security disclosures: <a href="mailto:security@icommunity.io" style={{ color: '#A78BFA', textDecoration: 'none' }}>security@icommunity.io</a>
        </p>
      </footer>
    </div>
  );
};

export default Security;
