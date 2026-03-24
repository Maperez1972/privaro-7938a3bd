export interface AgentRun {
  id: string;
  agent_name: string;
  pipeline_name: string;
  status: "running" | "completed" | "failed" | "aborted";
  total_steps: number;
  pii_detected: number;
  pii_masked: number;
  pii_leaked: number;
  risk_score: number;
  ibs_status: "pending" | "certified" | "failed" | "n/a";
  started_at: string;
  ended_at: string | null;
  duration_ms: number;
  sector_preset: string;
}

const presets = ["Legal", "Fintech", "Healthcare", "Insurance", "HR", "General", "Gov"];
const agents = ["Contract Analyzer", "Claims Processor", "Patient Intake", "KYC Agent", "HR Screener", "Research Assistant", "Compliance Checker"];
const pipelines = ["legal-prod", "fintech-eu", "health-hipaa", "kyc-pipeline", "hr-screening", "research-v2", "compliance-main"];
const statuses: AgentRun["status"][] = ["completed", "completed", "completed", "running", "failed", "completed", "aborted"];
const ibsStatuses: AgentRun["ibs_status"][] = ["certified", "certified", "pending", "pending", "failed", "certified", "n/a"];

function randomBetween(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateMockAgentRuns(count = 25): AgentRun[] {
  return Array.from({ length: count }, (_, i) => {
    const idx = i % agents.length;
    const piiDetected = randomBetween(3, 40);
    const piiLeaked = Math.random() > 0.85 ? randomBetween(1, 3) : 0;
    const piiMasked = piiDetected - piiLeaked;
    const status = i < 2 ? "running" : statuses[randomBetween(0, statuses.length - 1)];
    const started = new Date();
    started.setMinutes(started.getMinutes() - randomBetween(10, 10000));
    const durationMs = status === "running" ? Date.now() - started.getTime() : randomBetween(800, 45000);

    return {
      id: `ar_${crypto.randomUUID().slice(0, 8)}`,
      agent_name: agents[idx],
      pipeline_name: pipelines[idx],
      status,
      total_steps: randomBetween(3, 18),
      pii_detected: piiDetected,
      pii_masked: piiMasked,
      pii_leaked: piiLeaked,
      risk_score: +(Math.random() * 0.95 + 0.05).toFixed(2),
      ibs_status: status === "running" ? "pending" : ibsStatuses[randomBetween(0, ibsStatuses.length - 1)],
      started_at: started.toISOString(),
      ended_at: status === "running" ? null : new Date(started.getTime() + durationMs).toISOString(),
      duration_ms: durationMs,
      sector_preset: presets[idx],
    };
  }).sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime());
}
