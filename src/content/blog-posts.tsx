import { ReactNode } from "react";

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string; // ISO
  readingTime: string;
  tags: string[];
  keyword: string;
  content: ReactNode;
}

const H2 = ({ children }: { children: ReactNode }) => (
  <h2 className="text-2xl font-bold text-foreground mt-10 mb-3">{children}</h2>
);
const H3 = ({ children }: { children: ReactNode }) => (
  <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">{children}</h3>
);
const P = ({ children }: { children: ReactNode }) => (
  <p className="mb-4 leading-relaxed">{children}</p>
);
const UL = ({ children }: { children: ReactNode }) => (
  <ul className="list-disc list-inside space-y-2 mb-4">{children}</ul>
);
const Strong = ({ children }: { children: ReactNode }) => (
  <strong className="text-foreground">{children}</strong>
);

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "gdpr-checklist-llm-apps",
    title: "GDPR Checklist for LLM Applications (2026)",
    description:
      "A practical GDPR checklist for teams shipping LLM-powered apps: lawful basis, data minimization, DPIA, retention and third-country transfers.",
    date: "2026-06-10",
    readingTime: "8 min",
    tags: ["GDPR", "Compliance", "LLM"],
    keyword: "GDPR LLM compliance",
    content: (
      <>
        <P>
          Every LLM feature you ship handles personal data — even if you did not
          intend it to. Users paste emails, contract clauses, internal IDs and
          customer names into prompts. Under the GDPR that is <Strong>processing</Strong>,
          and it triggers the same obligations as any other data flow in your product.
        </P>
        <P>
          This checklist condenses what a DPO will actually ask you before signing
          off on an LLM feature. Use it as an internal review template.
        </P>

        <H2>1. Establish a lawful basis for prompt data</H2>
        <P>
          Article 6 requires a lawful basis for every processing activity. For
          most B2B LLM features that means <Strong>legitimate interest</Strong>{" "}
          (documented via a balancing test) or <Strong>contract</Strong> when the
          feature is part of the service the customer paid for. Consent is rarely
          the right basis for an internal productivity tool.
        </P>

        <H2>2. Apply data minimization at the proxy layer</H2>
        <P>
          The single most effective control is to strip PII <em>before</em> the
          prompt reaches the model provider. This is where a{" "}
          <a href="/pii-detection-api" className="text-primary underline">PII detection API</a>{" "}
          or a governance proxy like Privaro fits — every prompt gets scanned,
          entities get tokenized or masked, and only sanitized text hits OpenAI,
          Anthropic or Gemini.
        </P>

        <H2>3. Run a DPIA for high-risk features</H2>
        <P>
          Article 35 requires a Data Protection Impact Assessment when processing
          is likely to result in high risk. Any LLM feature that touches health,
          finance, legal or biometric data falls in scope. The DPIA should cover:
        </P>
        <UL>
          <li>Categories of personal data flowing into prompts</li>
          <li>Model provider and sub-processors (with SCCs on file)</li>
          <li>Retention of prompts, completions and embeddings</li>
          <li>Mitigations (tokenization, human review, opt-out)</li>
        </UL>

        <H2>4. Lock down retention</H2>
        <P>
          Model providers cache prompts. Vector databases retain embeddings.
          Log stores keep completions. Define a retention policy per surface and
          enforce it with automated deletion — do not rely on manual cleanup.
        </P>

        <H2>5. Handle third-country transfers explicitly</H2>
        <P>
          Most LLM providers process data in the US. You need Standard
          Contractual Clauses on file, and for sensitive categories a{" "}
          <Strong>Transfer Impact Assessment</Strong>. EU-region endpoints from
          Azure OpenAI or Anthropic on Bedrock EU can eliminate the transfer
          altogether — worth the migration for regulated verticals.
        </P>

        <H2>6. Give data subjects a working DSAR path</H2>
        <P>
          If a user requests deletion, you need to prove that their prompts,
          completions and derived embeddings are gone. That requires request-level
          audit logs from day one, not something you bolt on when the first DSAR
          arrives.
        </P>

        <H2>Next step</H2>
        <P>
          If you want to see how your current LLM usage stacks up against this
          checklist, run our free{" "}
          <a href="/ai-risk-assessment" className="text-primary underline">AI risk assessment</a>{" "}
          or read the{" "}
          <a href="/ai-compliance-software" className="text-primary underline">AI compliance software</a>{" "}
          overview for the control mapping to GDPR and the EU AI Act.
        </P>
      </>
    ),
  },
  {
    slug: "eu-ai-act-compliance-saas",
    title: "EU AI Act Compliance for SaaS: What Ships in 2026",
    description:
      "How the EU AI Act applies to SaaS products using LLMs — risk tiers, GPAI obligations, transparency requirements and a practical roadmap.",
    date: "2026-05-22",
    readingTime: "9 min",
    tags: ["EU AI Act", "Compliance", "SaaS"],
    keyword: "EU AI Act SaaS compliance",
    content: (
      <>
        <P>
          The EU AI Act is the first horizontal AI regulation in force worldwide.
          If your SaaS serves EU customers, ships an LLM feature, or embeds a
          third-party model, you are in scope — regardless of where your company
          is headquartered.
        </P>

        <H2>The four risk tiers, in plain English</H2>
        <UL>
          <li><Strong>Unacceptable</Strong> — social scoring, manipulative AI. Banned.</li>
          <li><Strong>High-risk</Strong> — AI in hiring, credit scoring, medical devices, critical infrastructure. Heavy documentation and conformity assessment.</li>
          <li><Strong>Limited risk</Strong> — chatbots, generative AI. Transparency obligations (users must know they are interacting with AI).</li>
          <li><Strong>Minimal risk</Strong> — everything else. No specific obligations.</li>
        </UL>
        <P>
          Most SaaS LLM features land in <Strong>limited risk</Strong>, but a
          copilot that recommends candidates or scores loan applications moves
          straight into <Strong>high-risk</Strong>.
        </P>

        <H2>GPAI: the model provider obligations that leak into you</H2>
        <P>
          General-Purpose AI (GPAI) providers — OpenAI, Anthropic, Google — must
          maintain technical documentation, publish training data summaries and
          implement copyright policies. For you as a downstream deployer, this
          means:
        </P>
        <UL>
          <li>Pin model versions and log them per request</li>
          <li>Retain provider documentation with your DPIA</li>
          <li>Notify users when GPAI output is used in decisions affecting them</li>
        </UL>

        <H2>Transparency: the article 50 requirements</H2>
        <P>
          Users interacting with an AI system must be informed. Content generated
          by AI (text, image, audio) must be marked as such in a{" "}
          <Strong>machine-readable</Strong> way. In practice this means adding
          disclosure UI to any user-facing generation surface and metadata to
          exported artifacts.
        </P>

        <H2>The audit trail is the compliance product</H2>
        <P>
          Enforcement will not ask for your policy document — it will ask for
          <em> evidence</em>. Every prompt, every model version, every policy
          decision, every human override must be logged in a way you can export
          to an auditor. This is the same requirement GDPR imposes for personal
          data, and the same one SOC 2 imposes for change management.
        </P>

        <H2>A 90-day roadmap</H2>
        <UL>
          <li><Strong>Days 1–30:</Strong> Inventory every LLM feature. Classify each into a risk tier.</li>
          <li><Strong>Days 31–60:</Strong> Deploy a governance proxy for PII detection, tokenization and per-request audit logs.</li>
          <li><Strong>Days 61–90:</Strong> Write the DPIA, publish the transparency notice, pin model versions.</li>
        </UL>

        <P>
          Privaro is designed to be that governance layer.{" "}
          <a href="/ai-governance-platform" className="text-primary underline">Read the platform overview</a>{" "}
          or explore the{" "}
          <a href="/enterprise-ai-security" className="text-primary underline">enterprise AI security guide</a>{" "}
          for the technical controls.
        </P>
      </>
    ),
  },
  {
    slug: "mask-pii-before-openai",
    title: "How to Mask PII Before Sending Prompts to OpenAI",
    description:
      "A developer guide to detecting and masking PII in prompts before calling OpenAI, Anthropic or Gemini — with code samples and reversible tokenization.",
    date: "2026-04-15",
    readingTime: "7 min",
    tags: ["PII", "OpenAI", "Developers"],
    keyword: "mask PII before OpenAI",
    content: (
      <>
        <P>
          The fastest way to leak customer data is to forward a raw user prompt
          straight to OpenAI. This guide shows the pattern we recommend at
          Privaro: detect entities, replace them with reversible tokens, call
          the model, then re-hydrate the response.
        </P>

        <H2>Why not just regex it?</H2>
        <P>
          Regex catches email addresses and credit cards. It misses names,
          addresses, medical conditions, internal identifiers and anything
          context-dependent. Real PII detection needs a hybrid of regex,
          dictionaries and an NER model. Building that in-house is a 3-month
          project; the{" "}
          <a href="/pii-detection-api" className="text-primary underline">PII detection API</a>{" "}
          gets you there in a day.
        </P>

        <H2>The reversible tokenization pattern</H2>
        <P>Four steps:</P>
        <UL>
          <li><Strong>Detect</Strong> — scan the prompt, return spans with entity type and confidence.</li>
          <li><Strong>Tokenize</Strong> — replace each span with a stable placeholder like <code className="text-primary">[EMAIL_1]</code>. Store the mapping encrypted in a vault, keyed to the request ID.</li>
          <li><Strong>Send</Strong> — forward the sanitized prompt to OpenAI. The model reasons about placeholders exactly like real values.</li>
          <li><Strong>Rehydrate</Strong> — on the response, swap placeholders back to originals before returning to the user.</li>
        </UL>

        <H3>Minimal example</H3>
        <pre className="bg-surface border border-border rounded-md p-4 text-sm overflow-x-auto mb-4"><code>{`const protect = await fetch("https://api.privaro.ai/v1/protect", {
  method: "POST",
  headers: { "Authorization": \`Bearer \${API_KEY}\` },
  body: JSON.stringify({ text: userPrompt, policy: "strict" }),
});
const { safe_text, request_id } = await protect.json();

const completion = await openai.chat.completions.create({
  model: "gpt-4o",
  messages: [{ role: "user", content: safe_text }],
});

const rehydrate = await fetch("https://api.privaro.ai/v1/rehydrate", {
  method: "POST",
  headers: { "Authorization": \`Bearer \${API_KEY}\` },
  body: JSON.stringify({ text: completion.choices[0].message.content, request_id }),
});
const { text } = await rehydrate.json();
return text;`}</code></pre>

        <H2>When to use irreversible anonymization instead</H2>
        <P>
          Tokenization is right when you need to display the original values back
          to the end user. For analytics prompts, log summarization or training
          data preparation you want <Strong>irreversible</Strong> anonymization —
          the mapping is discarded and the data cannot be re-identified.
        </P>

        <H2>What about latency?</H2>
        <P>
          A well-designed proxy adds 40–80 ms per call. In practice that is
          invisible next to the 500–2000 ms of the LLM call itself, and it is
          the price of not leaking a customer's national ID into someone else's
          training set.
        </P>
      </>
    ),
  },
  {
    slug: "openai-vs-anthropic-data-privacy",
    title: "OpenAI vs Anthropic: Data Privacy Compared for Enterprise",
    description:
      "A side-by-side comparison of OpenAI and Anthropic data privacy: retention, training on customer data, EU residency, DPAs and audit posture.",
    date: "2026-03-04",
    readingTime: "6 min",
    tags: ["OpenAI", "Anthropic", "Privacy"],
    keyword: "OpenAI vs Anthropic privacy",
    content: (
      <>
        <P>
          Procurement teams keep asking the same question: which frontier
          provider is safer for regulated data? The short answer is that both
          have enterprise tiers with strong contractual guarantees — and both
          have a consumer tier that is inappropriate for customer data. Here
          is the detail that matters.
        </P>

        <H2>Training on customer data</H2>
        <P>
          Neither OpenAI's API tier nor Anthropic's API tier trains on customer
          content by default. The risk is not the API — it is employees pasting
          into ChatGPT.com or Claude.ai personal accounts, where the default is
          different. Enforce this at the network or proxy layer, not with a
          policy PDF.
        </P>

        <H2>Retention</H2>
        <UL>
          <li><Strong>OpenAI API:</Strong> 30 days by default, zero-retention available for approved enterprise customers.</li>
          <li><Strong>Anthropic API:</Strong> 30 days by default, zero-retention available under enterprise agreements.</li>
        </UL>

        <H2>EU data residency</H2>
        <P>
          Both providers offer EU-region processing through hyperscaler partners
          (Azure OpenAI in EU regions, Anthropic on AWS Bedrock EU). Direct
          calls to <code>api.openai.com</code> and <code>api.anthropic.com</code>{" "}
          still route through the US — check your endpoint, not the marketing page.
        </P>

        <H2>DPAs and sub-processors</H2>
        <P>
          Both publish DPAs and sub-processor lists. Anthropic's list is shorter,
          which some procurement teams prefer for simpler vendor assessments.
          OpenAI's is longer because of the Microsoft hosting relationship.
          Neither is a red flag on its own.
        </P>

        <H2>The verdict</H2>
        <P>
          The provider is not the bottleneck — <Strong>the data leaving your
          perimeter is</Strong>. A governance layer that tokenizes PII before it
          leaves your infrastructure makes the choice between OpenAI and
          Anthropic a performance and cost decision, not a privacy one.
        </P>

        <P>
          See how a proxy architecture handles this in the{" "}
          <a href="/enterprise-ai-security" className="text-primary underline">enterprise AI security guide</a>{" "}
          or start with a{" "}
          <a href="/ai-risk-assessment" className="text-primary underline">free risk assessment</a>{" "}
          of your current usage.
        </P>
      </>
    ),
  },
];

export const getPostBySlug = (slug: string) =>
  BLOG_POSTS.find((p) => p.slug === slug);
