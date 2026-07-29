/**
 * Reference input-token prices (USD per 1M tokens) for popular LLMs.
 * Used by the Demo and Sandbox savings estimators. These are indicative
 * public list prices — the picker lets the user pick the closest match
 * to their own workload so the "$ saved per call" figure feels concrete.
 */

export interface ModelPrice {
  id: string;
  label: string;
  /** USD per 1,000,000 input tokens */
  pricePerMillion: number;
}

export const MODEL_PRICES: ModelPrice[] = [
  { id: "gpt-4o",         label: "GPT-4o",             pricePerMillion: 2.5 },
  { id: "gpt-4o-mini",    label: "GPT-4o mini",        pricePerMillion: 0.15 },
  { id: "claude-sonnet",  label: "Claude Sonnet 4",    pricePerMillion: 3 },
  { id: "claude-haiku",   label: "Claude Haiku 4.5",   pricePerMillion: 1 },
  { id: "gemini-pro",     label: "Gemini 2.5 Pro",     pricePerMillion: 1.25 },
];

export const DEFAULT_MODEL_PRICE_ID = "claude-sonnet";

export const getModelPrice = (id: string): ModelPrice =>
  MODEL_PRICES.find((m) => m.id === id) ?? MODEL_PRICES[2];

export const estimateSavingsUsd = (tokensSaved: number, pricePerMillion: number): number =>
  (tokensSaved / 1_000_000) * pricePerMillion;

export const formatSavingsUsd = (usd: number): string => {
  if (usd >= 0.01) return `$${usd.toFixed(4)}`;
  if (usd >= 0.0001) return `$${usd.toFixed(5)}`;
  return `$${usd.toExponential(2)}`;
};
