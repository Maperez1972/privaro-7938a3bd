import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export type SubAccount = { id: string; name: string; created_at: string; requests_used_this_month?: number };
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

type PartnerDataOptions = {
  enabled?: boolean;
  suppressErrors?: boolean;
};

type OrganizationPartnerFlag = { org_type?: string | null };

const normalizeErrorBody = (value: unknown): { error?: string } | null => {
  if (!value) return null;
  if (typeof value === "string") return { error: value };
  if (typeof value === "object" && "error" in value) {
    const errorValue = (value as { error?: unknown }).error;
    return { error: typeof errorValue === "string" ? errorValue : String(errorValue ?? "unknown_error") };
  }
  return { error: String(value) };
};

export const usePartnerData = (options: PartnerDataOptions = {}) => {
  const { session, profile, rolesLoaded, hasRole } = useAuth();
  const orgId = profile?.org_id ?? null;
  const isAdmin = hasRole("admin");

  return useQuery<PartnerData | null, Error>({
    queryKey: ["partner-sub-accounts", orgId, options.suppressErrors ? "optional" : "required"],
    queryFn: async () => {
      if (!session || !orgId || !isAdmin) return null;

      const { data: orgData, error: orgError } = await supabase
        .from("organizations")
        .select("org_type")
        .eq("id", orgId)
        .maybeSingle();

      if (orgError) {
        if (options.suppressErrors) {
          console.warn("[partner-sub-accounts] unable to check organization type:", orgError.message);
          return null;
        }
        throw new Error(orgError.message);
      }

      const organization = orgData as unknown as OrganizationPartnerFlag | null;
      if (organization?.org_type !== "partner") return null;

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
    enabled: (options.enabled ?? true) && rolesLoaded && !!session && !!orgId,
    retry: false,
    staleTime: 60_000,
  });
};


export const useCreateSubAccount = () => {
  const qc = useQueryClient();
  const { session } = useAuth();

  return useMutation<NewSubAccountResult, Error, NewSubAccountInput>({
    mutationFn: async (input) => {
      if (!session) throw new Error("not_authenticated");

      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${FN}`;
      const res = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(input),
      });

      if (!res.ok) {
        let body: { error?: string } | null = null;
        try { body = normalizeErrorBody(await res.json()); } catch { /* ignore */ }
        throw new Error(body?.error || `http_${res.status}`);
      }

      return (await res.json()) as NewSubAccountResult;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["partner-sub-accounts"] });
    },
  });
};
