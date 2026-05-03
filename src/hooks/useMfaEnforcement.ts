import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export type MfaStatus = {
  checked: boolean;
  required: boolean;
  enrolled: boolean;
  verified: boolean;
  role: string;
  factorId: string | null;
};

export function useMfaEnforcement() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<MfaStatus>({
    checked: false,
    required: false,
    enrolled: false,
    verified: false,
    role: "",
    factorId: null,
  });

  useEffect(() => {
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase.functions.invoke("enforce-mfa", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (error || !data) return;

      setStatus({
        checked: true,
        required: data.mfa_required,
        enrolled: data.mfa_enrolled,
        verified: data.mfa_verified,
        role: data.role,
        factorId: data.factor_id,
      });

      if (data.factor_id) {
        localStorage.setItem("privaro_mfa_factor_id", data.factor_id);
      }

      if (data.mfa_required && !data.mfa_enrolled) {
        navigate("/app/setup-mfa");
      } else if (data.mfa_required && data.mfa_enrolled && !data.mfa_verified) {
        navigate("/app/verify-mfa");
      }
    };
    check();
  }, [navigate]);

  return status;
}
