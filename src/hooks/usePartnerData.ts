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

export const usePartnerData = () =>
  useQuery<PartnerData | null, Error>({
    queryKey: ["partner-sub-accounts"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke(FN, { method: "GET" });
      if (error) {
        // Supabase edge invoke wraps non-2xx into error. Try to detect 403 not_a_partner_organization.
        const ctx: any = (error as any).context;
        let body: any = null;
        try {
          if (ctx && typeof ctx.json === "function") body = await ctx.json();
          else if (ctx && typeof ctx.text === "function") {
            const t = await ctx.text();
            try { body = JSON.parse(t); } catch { body = { error: t }; }
          }
        } catch { /* ignore */ }
        if (body?.error === "not_a_partner_organization") return null;
        throw new Error(body?.error || error.message);
      }
      return data as PartnerData;
    },
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
