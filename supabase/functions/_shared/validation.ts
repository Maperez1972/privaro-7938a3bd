const requestCounts = new Map<string, { count: number; resetAt: number }>();

const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 5;
const EMAIL_RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const EMAIL_RATE_LIMIT_MAX = 3;

export function isRateLimited(identifier: string): boolean {
  const now = Date.now();
  const entry = requestCounts.get(identifier);
  if (!entry || now > entry.resetAt) {
    requestCounts.set(identifier, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  entry.count++;
  return entry.count > RATE_LIMIT_MAX_REQUESTS;
}

export function isEmailRateLimited(email: string): boolean {
  const key = `email:${email.toLowerCase()}`;
  const now = Date.now();
  const entry = requestCounts.get(key);
  if (!entry || now > entry.resetAt) {
    requestCounts.set(key, { count: 1, resetAt: now + EMAIL_RATE_LIMIT_WINDOW_MS });
    return false;
  }
  entry.count++;
  return entry.count > EMAIL_RATE_LIMIT_MAX;
}

export function getClientIP(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

export function sanitize(value: unknown, maxLength: number): string {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength).replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface DemoRequestData {
  name: string;
  company: string;
  industry: string;
  role: string;
  email: string;
  concern: string;
}

export function validateDemoRequest(body: unknown): { data?: DemoRequestData; error?: string } {
  if (!body || typeof body !== "object") return { error: "Invalid request body" };
  const raw = body as Record<string, unknown>;
  if (raw.website && typeof raw.website === "string" && raw.website.trim().length > 0) {
    return { error: "bot_detected" };
  }
  const name = sanitize(raw.name, 100);
  const company = sanitize(raw.company, 200);
  const industry = sanitize(raw.industry, 100);
  const role = sanitize(raw.role, 100);
  const email = sanitize(raw.email, 255);
  const concern = sanitize(raw.concern, 1000);
  if (!name) return { error: "Name is required" };
  if (!company) return { error: "Company is required" };
  if (!industry) return { error: "Industry is required" };
  if (!role) return { error: "Role is required" };
  if (!email) return { error: "Email is required" };
  if (!EMAIL_REGEX.test(email)) return { error: "Invalid email format" };
  return { data: { name, company, industry, role, email, concern } };
}