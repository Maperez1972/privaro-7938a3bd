import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Shield } from "lucide-react";
import logoPrivaro from "@/assets/logo-privaro.webp";

const VerifyMfa = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [factorId, setFactorId] = useState<string | null>(null);
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fid =
      searchParams.get("factor_id") ||
      localStorage.getItem("privaro_mfa_factor_id");
    if (!fid) {
      toast({ title: "Missing MFA factor", description: "Please sign in again.", variant: "destructive" });
      navigate("/auth");
      return;
    }
    setFactorId(fid);
    supabase.auth.mfa.challenge({ factorId: fid }).then(({ data, error }) => {
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
        return;
      }
      setChallengeId(data.id);
    });
  }, [searchParams, navigate, toast]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!factorId || !challengeId || code.length !== 6) return;
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.mfa.verify({ factorId, challengeId, code });
    setLoading(false);
    if (error) {
      setError("Invalid code. Please try again.");
      setCode("");
      return;
    }
    toast({ title: "Verified" });
    navigate("/app");
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
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
            <CardTitle className="text-xl">Enter your authentication code</CardTitle>
            <CardDescription>
              Open your authenticator app and enter the 6-digit code.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleVerify} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code" className="sr-only">Verification code</Label>
                <Input
                  id="code"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  autoFocus
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="••••••"
                  className="text-center text-2xl tracking-[0.6em] font-mono h-14"
                />
                {error && <p className="text-sm text-destructive text-center">{error}</p>}
              </div>
              <Button type="submit" className="w-full" disabled={loading || code.length !== 6 || !challengeId}>
                {loading ? "Verifying..." : "Verify"}
              </Button>
              <div className="text-center text-sm">
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="text-muted-foreground hover:text-foreground hover:underline"
                >
                  Sign out
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VerifyMfa;
