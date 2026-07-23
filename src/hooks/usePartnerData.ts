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
    queryKey: ["partner-sub-accounts", options.suppressErrors ? "optional" : "required"],
    queryFn: async () => {
      // Use raw fetch instead of supabase.functions.invoke so an expected 403
      // (non-partner org) is handled as data — not thrown/logged as a runtime error.
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return null;

      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${FN}`;
      const res = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
      });

      if (res.status === 403) return null;

      if (!res.ok) {
        let body: { error?: string } | null = null;
        try { body = normalizeErrorBody(await res.json()); } catch { /* ignore */ }
        if (body?.error === "not_a_partner_organization") return null;
        const code = body?.error || `http_${res.status}`;
        if (options.suppressErrors) {
          console.warn("[partner-sub-accounts] unavailable:", res.status, code);
          return null;
        }
        throw new Error(code);
      }

      return (await res.json()) as PartnerData;
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
        const { body } = await readFunctionError(error);
        throw new Error(body?.error || error.message || "Failed to create client");
      }
      return data as NewSubAccountResult;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["partner-sub-accounts"] });
    },
  });
};
