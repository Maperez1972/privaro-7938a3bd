// Sector rule templates (Legal, Fintech, Healthcare).
// Used as the built-in catalogue when the `policy_presets` table is empty,
// and surfaced in the Sandbox so users can see which template is active.

export interface SectorPresetRule {
  entity_type: string;
  category: string;
  action: "tokenise" | "pseudonymise" | "anonymise" | "block";
  regulation_ref?: string;
  priority: number;
  direction?: "input" | "output" | "both";
}

export interface SectorPreset {
  slug: string;
  name: string;
  name_es: string;
  description: string;
  description_es: string;
  sector: string;
  icon: string;
  rules: SectorPresetRule[];
  sample_text: string;
  sample_text_es: string;
}

export const SECTOR_PRESETS: SectorPreset[] = [
  {
    slug: "legal",
    name: "Legal",
    name_es: "Legal",
    sector: "legal",
    icon: "⚖️",
    description:
      "Client identifiers, case data and contract parties masked before reaching any LLM. Protects legal privilege.",
    description_es:
      "Identificadores de cliente, datos de expediente y partes contractuales enmascarados antes de llegar al LLM. Protege el secreto profesional.",
    rules: [
      { entity_type: "person_name", category: "personal", action: "pseudonymise", regulation_ref: "GDPR Art. 4", priority: 1, direction: "both" },
      { entity_type: "national_id", category: "personal", action: "tokenise", regulation_ref: "GDPR Art. 9", priority: 2, direction: "both" },
      { entity_type: "email", category: "personal", action: "tokenise", regulation_ref: "GDPR Art. 4", priority: 3, direction: "both" },
      { entity_type: "phone", category: "personal", action: "tokenise", regulation_ref: "GDPR Art. 4", priority: 4, direction: "input" },
      { entity_type: "address", category: "personal", action: "anonymise", regulation_ref: "GDPR Art. 5", priority: 5, direction: "input" },
      { entity_type: "case_number", category: "confidential", action: "tokenise", regulation_ref: "LOPDGDD", priority: 6, direction: "both" },
      { entity_type: "company_name", category: "confidential", action: "pseudonymise", priority: 7, direction: "input" },
      { entity_type: "iban", category: "financial", action: "tokenise", regulation_ref: "PCI DSS", priority: 8, direction: "both" },
    ],
    sample_text:
      "Case 2026/0114: our client María López (ID 12345678Z, maria.lopez@example.com) claims EUR 48,000 from Acme Iberia S.L. Payment to ES91 2100 0418 4502 0005 1332.",
    sample_text_es:
      "Expediente 2026/0114: nuestra clienta María López (DNI 12345678Z, maria.lopez@example.com) reclama 48.000 EUR a Acme Iberia S.L. Pago a ES91 2100 0418 4502 0005 1332.",
  },
  {
    slug: "fintech",
    name: "Fintech",
    name_es: "Fintech",
    sector: "fintech",
    icon: "🏦",
    description:
      "Card numbers, IBANs and account identifiers blocked or tokenised. Aligned with PCI DSS and PSD2 requirements.",
    description_es:
      "Números de tarjeta, IBAN e identificadores de cuenta bloqueados o tokenizados. Alineado con PCI DSS y PSD2.",
    rules: [
      { entity_type: "credit_card", category: "financial", action: "block", regulation_ref: "PCI DSS 3.4", priority: 1, direction: "both" },
      { entity_type: "iban", category: "financial", action: "tokenise", regulation_ref: "PSD2", priority: 2, direction: "both" },
      { entity_type: "account_number", category: "financial", action: "tokenise", regulation_ref: "PCI DSS", priority: 3, direction: "both" },
      { entity_type: "national_id", category: "personal", action: "tokenise", regulation_ref: "AML/KYC", priority: 4, direction: "both" },
      { entity_type: "person_name", category: "personal", action: "pseudonymise", regulation_ref: "GDPR Art. 4", priority: 5, direction: "input" },
      { entity_type: "email", category: "personal", action: "tokenise", regulation_ref: "GDPR Art. 4", priority: 6, direction: "input" },
      { entity_type: "phone", category: "personal", action: "tokenise", priority: 7, direction: "input" },
      { entity_type: "swift_bic", category: "financial", action: "tokenise", regulation_ref: "PSD2", priority: 8, direction: "both" },
    ],
    sample_text:
      "Customer John Meyer (ID 98765432B) disputes a EUR 1,250 charge on card 4111 1111 1111 1111, settled to IBAN DE89 3704 0044 0532 0130 00 (BIC COBADEFFXXX).",
    sample_text_es:
      "El cliente John Meyer (DNI 98765432B) reclama un cargo de 1.250 EUR en la tarjeta 4111 1111 1111 1111, liquidado al IBAN DE89 3704 0044 0532 0130 00 (BIC COBADEFFXXX).",
  },
  {
    slug: "healthcare",
    name: "Healthcare",
    name_es: "Salud",
    sector: "healthcare",
    icon: "🩺",
    description:
      "Clinical records, diagnoses and patient identifiers treated as special-category data under GDPR Art. 9.",
    description_es:
      "Historias clínicas, diagnósticos e identificadores de paciente tratados como datos de categoría especial (RGPD Art. 9).",
    rules: [
      { entity_type: "health_record", category: "special", action: "block", regulation_ref: "GDPR Art. 9", priority: 1, direction: "both" },
      { entity_type: "diagnosis", category: "special", action: "anonymise", regulation_ref: "GDPR Art. 9", priority: 2, direction: "both" },
      { entity_type: "patient_id", category: "special", action: "tokenise", regulation_ref: "GDPR Art. 9", priority: 3, direction: "both" },
      { entity_type: "national_id", category: "personal", action: "tokenise", regulation_ref: "LOPDGDD", priority: 4, direction: "both" },
      { entity_type: "person_name", category: "personal", action: "pseudonymise", regulation_ref: "GDPR Art. 4", priority: 5, direction: "both" },
      { entity_type: "date_of_birth", category: "personal", action: "anonymise", regulation_ref: "GDPR Art. 5", priority: 6, direction: "input" },
      { entity_type: "email", category: "personal", action: "tokenise", priority: 7, direction: "input" },
      { entity_type: "phone", category: "personal", action: "tokenise", priority: 8, direction: "input" },
    ],
    sample_text:
      "Patient Ana Ruiz (ID 45678912K, DOB 12/03/1981, record HC-889213) diagnosed with type 2 diabetes; contact ana.ruiz@example.com.",
    sample_text_es:
      "La paciente Ana Ruiz (DNI 45678912K, nacida el 12/03/1981, historia HC-889213) presenta diabetes tipo 2; contacto ana.ruiz@example.com.",
  },
];

export const getSectorPreset = (slug: string | null | undefined) =>
  slug ? SECTOR_PRESETS.find((p) => p.slug === slug) ?? null : null;
