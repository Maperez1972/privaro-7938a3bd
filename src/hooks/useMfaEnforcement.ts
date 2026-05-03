import { useEffect, useRef, useState } from "react";
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
  const navigateRef = useRef(navigate);
  const hasChecked = useRef(false);

  const [status, setStatus] = useState<MfaStatus>({
    checked: false,
    required: false,
    enrolled: false,
    verified: false,
    role: "",
    factorId: null,
  });

  // Keep navigateRef current without re-triggering effect
  useEffect(() => {
    navigateRef.current = navigate;
  }, [navigate]);

  useEffect(() => {
    // Only run once per mount — prevent loops with onboarding redirect
    if (hasChecked.current) return;
    hasChecked.current = true;

    const check = async () => {
      console.log("[MFA] Starting check...");

      const { data: { session } } = await supabase.auth.getSession();
      console.log("[MFA] Session:", session ? "exists" : "null");
      if (!session) return;

      console.log("[MFA] Calling enforce-mfa...");
      const { data, error } = await supabase.functions.invoke("enforce-mfa", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      console.log("[MFA] Result:", JSON.stringify(data), error);

      if (error || !data) {
        console.log("[MFA] Error or no data — skipping redirect");
        return;
      }

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
        console.log("[MFA] Redirecting to setup-mfa");
        navigateRef.current("/app/setup-mfa");
      } else if (data.mfa_required && data.mfa_enrolled && !data.mfa_verified) {
        console.log("[MFA] Redirecting to verify-mfa");
        navigateRef.current("/app/verify-mfa");
      } else {
        console.log("[MFA] No redirect needed — access granted");
      }
    };

    check();
  }, []); // Empty deps — run only on mount

  return status;
}
