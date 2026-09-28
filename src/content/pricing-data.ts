// Single source of truth for Privaro list prices (EUR, VAT excluded).
// Consumed by the /pricing page, its Product/Offer JSON-LD and the build-time llms.txt.
// Plain data only (no imports) so the Node build scripts can import it too.

export interface PricedPlan {
  key: "starter" | "pro";
  name: string;
  /** EUR per month, billed monthly */
  monthlyPrice: number;
  /** EUR per month, billed annually upfront (20% discount) */
  annualPrice: number;
  requestsPerMonth: number;
}

export const PRICING_CURRENCY = "EUR";
export const ANNUAL_DISCOUNT_PCT = 20;
export const TRIAL_DAYS = 14;
export const EXTRA_REQUESTS_PRICE = { eur: 15, per: 100_000 };

export const PRICED_PLANS: PricedPlan[] = [
  { key: "starter", name: "Starter", monthlyPrice: 150, annualPrice: 120, requestsPerMonth: 100_000 },
  { key: "pro", name: "Business", monthlyPrice: 400, annualPrice: 320, requestsPerMonth: 500_000 },
];

export const ENTERPRISE_PLAN = {
  name: "Enterprise / ISV",
  summary: "Custom pricing for >5M requests/month, white-label, dedicated VPC instance, 99.9% SLA.",
};

export const planPrice = (key: PricedPlan["key"]): PricedPlan =>
  PRICED_PLANS.find((p) => p.key === key) as PricedPlan;
