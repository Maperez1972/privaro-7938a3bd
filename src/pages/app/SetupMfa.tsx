import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/context/LanguageContext";

const SetupMfa = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [factorId, setFactorId] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState("");
  const [secret, setSecret] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [enrolling, setEnrolling] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const prepare = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) { navigate("/auth"); return; }

        // Step 1: call enforce-mfa?action=enroll to clear any stale unverified factors
        // This bypasses the AAL2 requirement that Supabase enforces client-side
        await supabase.functions.invoke("enforce-mfa", {
          headers: { Authorization: `Bearer ${session.access_token}` },
          body: null,
        });

        // The invoke above uses POST by default — use fetch directly for query param
        await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/enforce-mfa?action=enroll`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${session.access_token}`,
              "Content-Type": "application/json",
              apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
            },
          }
        );

        // Step 2: now enroll client-side (stale factors cleared)
        const { data, error } = await supabase.auth.mfa.enroll({
          factorType: "totp",
          friendlyName: `Privaro Admin ${Date.now()}`,
        });

        if (error) throw error;

        setFactorId(data.id);
        setQrCode(data.totp.qr_code);
        setSecret(data.totp.secret);
        localStorage.setItem("privaro_mfa_factor_id", data.id);
      } catch (err: any) {
        toast({ title: t("app.mfa.setup.errorTitle"), description: err.message, variant: "destructive" });
      } finally {
        setEnrolling(false);
      }
    };
    prepare();
  }, [navigate, toast]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!factorId || code.length !== 6) return;
    setLoading(true);
    const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId, code });
    setLoading(false);
    if (error) {
      toast({ title: t("app.mfa.verifyFailed"), description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: t("app.mfa.setup.enabled") });
    navigate("/app");
  };

  const copySecret = async () => {
    await navigator.clipboard.writeText(secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-4">
            <Shield className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">{t("app.mfa.setup.title")}</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            {t("app.mfa.setup.scanInstructions")}
          </p>
          <span className="inline-block mt-3 px-3 py-1 text-xs font-semibold rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400">
            {t("app.mfa.setup.requiredForAdmins")}
          </span>
        </div>

        <div className="bg-card border border-border rounded-xl p-8">
          <ol className="text-sm text-muted-foreground mb-6 space-y-1">
            <li>1. {t("app.mfa.setup.step1")}</li>
            <li>2. {t("app.mfa.setup.step2")}</li>
            <li>3. {t("app.mfa.setup.step3")}</li>
          </ol>

          {enrolling ? (
            <p className="text-center text-muted-foreground text-sm py-8">{t("app.mfa.setup.preparing")}</p>
          ) : (
            <form onSubmit={handleVerify} className="space-y-5">
              {qrCode && (
                <div className="flex justify-center">
                  <img src={qrCode} alt="MFA QR Code" className="w-48 h-48 rounded-lg border border-border" />
                </div>
              )}
              {secret && (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground text-center">{t("app.mfa.setup.manualEntry")}</p>
                  <div className="flex items-center gap-2 bg-surface border border-border rounded-md px-3 py-2">
                    <code className="flex-1 text-xs font-mono text-foreground break-all">{secret}</code>
                    <button type="button" onClick={copySecret} className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors">
                      {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}
              <div className="space-y-2">
                <Label>{t("app.mfa.verificationCode")}</Label>
                <Input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="123456"
                  className="text-center text-xl tracking-[0.5em] font-mono"
                  autoFocus
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading || code.length !== 6}>
                {loading ? t("app.mfa.verifying") : t("app.common.confirm")}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default SetupMfa;
