/**
 * pii-engine.ts
 * Shared client-side PII detection and protection engine.
 * Used by:
 *   - /demo  (public sandbox, no credentials)
 *   - /app/sandbox fallback (when proxy is unavailable)
 *   - mock-data.ts mockProxyDetect / mockProxyProtect
 *
 * Single source of truth — fixes applied here propagate everywhere.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PiiDetection {
  type: string;
  value: string;
  start: number;
  end: number;
  severity: string;
  category: string;
}

export interface ProtectResult {
  protectedText: string;
  /** Snapshot of the input at the moment protectText() was called. Never mutated. */
  originalText: string;
  detections: PiiDetection[];
  tokenMap: Record<string, string>;
  /** Simulated processing time (35–65 ms realistic range) */
  processingMs: number;
  auditLogId: null;
  requestId: null;
}

// ─── Stopwords ────────────────────────────────────────────────────────────────
// Capitalised words that start sentences but are NOT person names.

const NAME_STOP = new Set([
  "Dear","Best","Please","Her","His","The","This","That","Patient","Transfer",
  "Regards","March","April","May","June","July","August","September","October",
  "November","December","Hello","Hola","Estimado","Estimada","Atentamente",
  "Clinical","Insurance","Emergency","Contact","Diagnosis","Salary","Bank",
  "Transaction","Alert","Session","Screening","Candidate","Current","Type",
  "Adeslas","LinkedIn","Note","Details","Account","Third","Birthday","DOB",
  "Admission","Consultation","Follow","New","Next","Last","First","Second",
  "Fourth","For","From","With","Without","About","After","Before","Between",
  "During","Into","Over","Under","Until","Upon","Within","Already","Building",
  "Invoice","Policy","Contract","Reference","Number","Subject","Regarding",
  "Enclosed","Attached","Sincerely","Warmly","Cordially","Yours","Truly",
]);

// ─── Token prefix map ─────────────────────────────────────────────────────────

const PREFIX: Record<string, string> = {
  full_name:     "NM",
  email:         "EM",
  iban:          "BK",
  dni:           "ID",
  phone:         "PH",
  ssn:           "SS",
  credit_card:   "CC",
  ip_address:    "IP",
  session_id:    "SI",
  policy_number: "PN",
};

// ─── Core detection engine ────────────────────────────────────────────────────

interface RawDetection {
  type: string; severity: string; category: string; start: number; end: number;
}

export function detectPii(text: string): PiiDetection[] {
  const raw: RawDetection[] = [];

  // ── 1) Names — two-pass strategy ─────────────────────────────────────────────
  //
  // Pass 1: Titled names → "Dr. García", "Sr. López Martínez", "Prof. Ana Ruiz"
  // The title anchors the match so a single-word surname is still captured.
  const TITLE_RE = /\b(Dr|Dra|Mr|Mrs|Ms|Sr|Sra|Prof)\.?\s+([A-ZÁÉÍÓÚÀÈÌÒÙÑÇ][a-záéíóúàèìòùñç]+(?:\s+[A-ZÁÉÍÓÚÀÈÌÒÙÑÇ][a-záéíóúàèìòùñç]+){0,2})/g;
  let tm: RegExpExecArray | null;
  while ((tm = TITLE_RE.exec(text)) !== null) {
    raw.push({ type: "full_name", severity: "medium", category: "personal", start: tm.index, end: tm.index + tm[0].length });
  }

  // Pass 2: Multi-word names without title → "María López Fernández", "Juan Martínez"
  // Matches 2–4 capitalised words. For each match, walks forward past leading
  // stopwords so "Patient María López" → detects "María López", not "Patient".
  const NAME_RE = /[A-ZÁÉÍÓÚÀÈÌÒÙÑÇ][a-záéíóúàèìòùñç]{1,}(?:\s+[A-ZÁÉÍÓÚÀÈÌÒÙÑÇ][a-záéíóúàèìòùñç]{2,}){1,3}/gu;
  let nm: RegExpExecArray | null;
  NAME_RE.lastIndex = 0;
  while ((nm = NAME_RE.exec(text)) !== null) {
    const words = nm[0].split(" ");
    let skip = 0;
    while (skip < words.length - 1 && NAME_STOP.has(words[skip])) skip++;
    if (skip >= words.length - 1) continue; // entire match is stopwords
    const skipChars = words.slice(0, skip).join(" ").length + (skip > 0 ? 1 : 0);
    const start = nm.index + skipChars;
    const nameStr = words.slice(skip).join(" ");
    raw.push({ type: "full_name", severity: "medium", category: "personal", start, end: start + nameStr.length });
  }

  // ── 2) Structural patterns ────────────────────────────────────────────────────

  const patterns: { regex: RegExp; type: string; severity: string; category: string }[] = [
    // Email
    {
      regex: /[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}/g,
      type: "email", severity: "medium", category: "personal",
    },
    // IBAN — ES91 2100 0418 4502 0005 1332 (spaces optional)
    {
      regex: /\b[A-Z]{2}\d{2}(?:\s?\d{4}){4,6}\b/g,
      type: "iban", severity: "critical", category: "financial",
    },
    // DNI / NIE Spain — 8 digits + ANY letter (upper or lower — user may edit)
    {
      regex: /\b\d{8}[A-Za-z]\b/g,
      type: "dni", severity: "critical", category: "personal",
    },
    // Phone — ES/EU formats: 612-34-5678 | 699 12 34 56 | +34 612 345 678
    {
      regex: /(?<!\d)(?:\+\d{1,3}[\s\-]?)?(?:\d{3}[\s\-]?\d{2}[\s\-]?\d{2}[\s\-]?\d{2}|\d{3}[\s\-]?\d{3}[\s\-]?\d{3})(?!\d)/g,
      type: "phone", severity: "high", category: "personal",
    },
    // SSN (US)
    {
      regex: /\b\d{3}-\d{2}-\d{4}\b/g,
      type: "ssn", severity: "critical", category: "personal",
    },
    // Credit card
    {
      regex: /\b(?:\d{4}[\s\-]?){3}\d{4}\b/g,
      type: "credit_card", severity: "critical", category: "financial",
    },
    // Private IP
    {
      regex: /\b(?:192\.168|10\.\d{1,3}|172\.(?:1[6-9]|2\d|3[01]))\.\d{1,3}\.\d{1,3}\b/g,
      type: "ip_address", severity: "low", category: "technical",
    },
    // Session / API token
    {
      regex: /\bsess_[A-Za-z0-9]+\b/g,
      type: "session_id", severity: "low", category: "technical",
    },
    // Policy / contract number (Spanish)
    {
      regex: /n[oº°][\s]?(?:de\s)?(?:s[oó]cios?|póliza|factura|contrato|cuenta|tarjeta|afiliado)?[\s]*\d{6,}/gi,
      type: "policy_number", severity: "high", category: "financial",
    },
  ];

  for (const p of patterns) {
    p.regex.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = p.regex.exec(text)) !== null) {
      raw.push({ type: p.type, severity: p.severity, category: p.category, start: m.index, end: m.index + m[0].length });
    }
  }

  // ── 3) Deduplicate — sort by start asc, length desc; sweep removes overlaps ──
  raw.sort((a, b) => {
    if (a.start !== b.start) return a.start - b.start;
    return (b.end - b.start) - (a.end - a.start); // longer match wins at same position
  });

  const clean: RawDetection[] = [];
  let cursor = 0;
  for (const d of raw) {
    if (d.start >= cursor) { clean.push(d); cursor = d.end; }
  }

  // ── 4) Attach values from source text ────────────────────────────────────────
  return clean.map(d => ({ ...d, value: text.slice(d.start, d.end) }));
}

// ─── Protect engine ───────────────────────────────────────────────────────────

export function protectText(text: string): ProtectResult {
  const t0 = performance.now();
  const detections = detectPii(text);

  const tokenMap: Record<string, string> = {};
  const counters: Record<string, number> = {};

  // Process in reverse order to preserve original indices during substitution
  let protectedText = text;
  const sorted = [...detections].sort((a, b) => b.start - a.start);
  for (const d of sorted) {
    const prefix = PREFIX[d.type] ?? "PII";
    counters[prefix] = (counters[prefix] ?? 0) + 1;
    const token = `[${prefix}-${String(counters[prefix]).padStart(4, "0")}]`;
    tokenMap[token] = d.value;
    protectedText = protectedText.slice(0, d.start) + token + protectedText.slice(d.end);
  }

  const elapsed = Math.round(performance.now() - t0);
  return {
    protectedText,
    originalText: text,
    detections,
    tokenMap,
    processingMs: elapsed + 35 + Math.floor(Math.random() * 30),
    auditLogId: null,
    requestId: null,
  };
}
