import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Shield, Copy, Check } from "lucide-react";
import logoPrivaro from "@/assets/logo-privaro.webp";

const SetupMfa = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [factorId, setFactorId] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string>("");
  const [secret, setSecret] = useState<string>("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [enrolling, setEnrolling] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const enroll = async () => {
      try {
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
        toast({ title: "Error", description: err.message, variant: "destructive" });
      } finally {
        setEnrolling(false);
      }
    };
    enroll();
  }, [toast]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!factorId || code.length !== 6) return;
    setLoading(true);
    const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId, code });
    setLoading(false);
    if (error) {
      toast({ title: "Verification failed", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "MFA enabled successfully" });
    navigate("/app");
  };

  const copySecret = async () => {
    await navigator.clipboard.writeText(secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <img src={logoPrivaro} alt="Privaro" className="h-20" />
        </div>
        <Card className="border-border bg-card">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-2">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-xl">Set up two-factor authentication</CardTitle>
            <CardDescription>
              Scan the QR code with your authenticator app (Google Authenticator, Authy, or similar).
            </CardDescription>
            <div className="flex justify-center pt-2">
              <Badge variant="outline" className="border-amber-500/40 text-amber-400 bg-amber-500/10">
                Required for admin accounts
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Scan QR</li>
              <li>Enter code</li>
              <li>Confirm</li>
            </ol>

            {enrolling ? (
              <p className="text-center text-muted-foreground text-sm py-8">Generating secret...</p>
            ) : (
              <>
                {qrCode && (
                  <div className="flex justify-center bg-white p-4 rounded-md">
                    <img src={qrCode} alt="MFA QR code" className="w-48 h-48" />
                  </div>
                )}
                {secret && (
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Or enter this code manually</Label>
                    <div className="flex gap-2">
                      <Input readOnly value={secret} className="font-mono text-xs" />
                      <Button type="button" variant="outline" size="icon" onClick={copySecret}>
                        {copied ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                )}
                <form onSubmit={handleVerify} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="code">Verification code</Label>
                    <Input
                      id="code"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      autoFocus
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      placeholder="123456"
                      className="text-center text-xl tracking-[0.5em] font-mono"
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading || code.length !== 6}>
                    {loading ? "Verifying..." : "Confirm"}
                  </Button>
                </form>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SetupMfa;
