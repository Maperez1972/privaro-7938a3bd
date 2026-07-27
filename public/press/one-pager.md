# Privaro — One-Pager

**AI privacy governance infrastructure for regulated enterprises.**

## The problem
Legal, fintech, and healthcare teams want to use LLMs but can't send raw sensitive data to third-party providers. Ad-hoc redaction breaks under real workloads and leaves no audit trail.

## The product
Privaro is a proxy layer between enterprise apps / AI agents and any LLM.

1. **Detect** — hybrid engine (regex + NLP) finds PII, financial data, health data, contracts, identifiers.
2. **Decide** — policy engine picks the action per entity type, role, org, provider: tokenize, anonymize, block, or allow.
3. **Protect** — reversible AES-256 token vault; controlled reveal with audit.
4. **Route** — sanitized prompt goes to the chosen LLM (OpenAI, Anthropic, Gemini, custom).
5. **Prove** — every interaction logged; optional blockchain certification.

## Who it's for
Legal teams · Fintech & banking compliance · Healthcare · Security / DPO / governance teams · Agent builders exchanging sensitive data.

## What makes it different
- Provider-agnostic — not tied to one LLM vendor.
- Real audit layer, not just prompt logging — every detection and policy decision stored.
- BYOK (AES-256) and blockchain audit as add-ons.
- MCP server built in — usable by AI agents natively.
- Full RBAC + multi-tenant isolation from day one.

## Pricing
6 tiers, €150 → €2,500 / month. Custom Enterprise/ISV tier. 20% recurring partner discount.

## Links
Site: https://privaro.ai · Pricing: https://privaro.ai/pricing · Docs: https://privaro.ai/docs · Status: https://privaro.ai/status · Press: hello@icommunity.io
