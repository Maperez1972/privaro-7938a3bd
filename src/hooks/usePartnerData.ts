import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type SubAccount = { id: string; name: string; created_at: string };
export type PartnerBilling = {
  plan: string;
  requests_used: number;
  requests_limit: number;
  discount_phase: string;
  billing_cycle_start: string;
};
export type PartnerData = {
  partner: { id: string; name: string };
  sub_accounts: SubAccount[];
  billing: PartnerBilling;
};

export type NewSubAccountInput = {
  name: string;
  sector: string;
  llm_provider: string;
  llm_model: string;
};

export type NewSubAccountResult = {
  org_id: string;
  pipeline_id: string;
  api_key: string;
  warning?: string;
};

const FN = "partner-sub-accounts";

type FunctionErrorContext = {
  status?: number;
  json?: () => Promise<unknown>;
  text?: () => Promise<string>;
};

type FunctionErrorWithContext = Error & { context?: FunctionErrorContext };

type PartnerDataOptions = {
  enabled?: boolean;
  suppressErrors?: boolean;
};

const normalizeErrorBody = (value: unknown): { error?: string } | null => {
  if (!value) return null;
  if (typeof value === "string") return { error: value };
  if (typeof value === "object" && "error" in value) {
    const errorValue = (value as { error?: unknown }).error;
    return { error: typeof errorValue === "string" ? errorValue : String(errorValue ?? "unknown_error") };
  }
  return { error: String(value) };
};

const readFunctionError = async (error: Error) => {
  const ctx = (error as FunctionErrorWithContext).context;
  let body: { error?: string } | null = null;

  try {
    if (ctx && typeof ctx.json === "function") {
      body = normalizeErrorBody(await ctx.json());
    } else if (ctx && typeof ctx.text === "function") {
      const text = await ctx.text();
      try {
        body = normalizeErrorBody(JSON.parse(text));
      } catch {
        body = normalizeErrorBody(text);
      }
    }
  } catch {
    body = null;
  }

  return { status: ctx?.status, body };
};

export const usePartnerData = (options: PartnerDataOptions = {}) =>
  useQuery<PartnerData | null, Error>({
    queryKey: ["partner-sub-accounts"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke(FN, { method: "GET" });
      if (error) {
        const { status, body } = await readFunctionError(error);
        // Expected 403 for non-partner orgs → hide section silently.
        if (status === 403 || body?.error === "not_a_partner_organization") return null;

        const code = body?.error || error.message || "unknown_error";

        if (options.suppressErrors) {
          console.warn("[partner-sub-accounts] unavailable:", status, code);
          return null;
        }

        // Real backend failure — surface it so the page can show a clear message.
        throw new Error(code);
      }
      return data as PartnerData;
    },
    enabled: options.enabled ?? true,
    retry: false,
    staleTime: 60_000,
  });

export const useCreateSubAccount = () => {
  const qc = useQueryClient();
  return useMutation<NewSubAccountResult, Error, NewSubAccountInput>({
    mutationFn: async (input) => {
      const { data, error } = await supabase.functions.invoke(FN, {
        method: "POST",
        body: input,
      });
      if (error) {
        const ctx: any = (error as any).context;
        let body: any = null;
        try {
          if (ctx && typeof ctx.json === "function") body = await ctx.json();
        } catch { /* ignore */ }
        throw new Error(body?.error || error.message || "Failed to create client");
      }
      return data as NewSubAccountResult;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["partner-sub-accounts"] });
    },
  });
};
