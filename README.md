# Privaro Frontend

Developer playground for Privaro.

---

## 🚀 What it does

- Test prompt protection (input)
- Test response protection (output)
- Visualize tokenization
- Inspect audit logs and output incidents

---

## ⚡ Run

```bash
npm install
npm run dev
```

---

## 🔌 Key endpoints

| Method | Path | Description |
| --- | --- | --- |
| POST | `/v1/proxy/protect` | Detect and mask PII in a prompt before it reaches the LLM |
| POST | `/v1/proxy/detect` | Detect PII without masking |
| POST | `/v1/proxy/protect-output` | Detect and mask PII in an LLM response |
| POST | `/v1/relay/complete` | Protected round-trip call to the LLM provider |
| POST | `/v1/relay/stream` | Streaming (SSE) round-trip call |

### ⚠️ Streaming limitation

With `/v1/relay/stream` (SSE) the response is emitted token by token, so PII in the
output **cannot be masked in real time**. Streaming pipelines are **audit-only**:
detections are logged and surfaced in the *Output Incidents* dashboard and in DPO
reports, but the text reaching the user is not rewritten. Use `/v1/relay/complete`
or `/v1/proxy/protect-output` when actual output masking is required.

---

## 🧠 Why it matters

Helps developers understand:

- Before vs after
- Agent flows
- Data protection in both directions (input and output)

---

## 🔗 Related

- Proxy
- SDKs
