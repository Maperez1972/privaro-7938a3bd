import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Shield, Eye, EyeOff } from "lucide-react";
import logoPrivaro from "@/assets/logo-privaro.webp";
import { useLanguage } from "@/context/LanguageContext";
import type { Language } from "@/context/LanguageContext";

const Auth = () => {
  const [searchParams] = useSearchParams();
  const invitationToken = searchParams.get("invitation_token");
  const invitedEmail = searchParams.get("email");

  const [mode, setMode] = useState<"login" | "signup" | "forgot">(invitationToken ? "signup" : "login");
  const [email, setEmail] = useState(invitedEmail || "");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState("");
  const [orgName, setOrgName] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { t, lang, setLang } = useLanguage();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      navigate("/app");
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const metadata: Record<string, string> = {
      full_name: fullName,
    };
    if (!invitationToken) {
      metadata.organization_name = orgName;
    }
    if (invitationToken) {
      metadata.invitation_token = invitationToken;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/email-confirmed`,
        data: metadata,
      },
    });
    setLoading(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: t("auth.accountCreated"), description: t("auth.checkEmail") });
      setMode("login");
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: t("auth.emailSent"), description: t("auth.checkInbox") });
      setMode("login");
    }
  };

  const titles = {
    login: { title: t("auth.signin"), desc: t("auth.signin.desc") },
    signup: { title: t("auth.signup"), desc: t("auth.signup.desc") },
    forgot: { title: t("auth.forgot"), desc: t("auth.forgot.desc") },
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative">
      <button
        onClick={() => setLang(lang === "en" ? "es" : "en")}
        className="absolute top-4 right-4 px-3 py-1.5 text-sm font-medium rounded-md border border-border bg-card text-foreground hover:bg-accent transition-colors"
      >
        {lang === "en" ? "🇪🇸 Español" : "🇬🇧 English"}
      </button>
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <img src={logoPrivaro} alt="Privaro" className="h-20" />
        </div>
        <Card className="border-border bg-card">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-2">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-xl">{titles[mode].title}</CardTitle>
            <CardDescription>{titles[mode].desc}</CardDescription>
          </CardHeader>
          <CardContent>
            {mode === "forgot" ? (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">{t("auth.email")}</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" required />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? t("auth.sending") : t("auth.sendReset")}
                </Button>
                <div className="text-center text-sm text-muted-foreground">
                  <button onClick={() => setMode("login")} className="text-primary hover:underline">{t("auth.backToSignin")}</button>
                </div>
              </form>
            ) : (
              <>
                <form onSubmit={mode === "login" ? handleLogin : handleSignup} className="space-y-4">
                  {mode === "signup" && (
                    <>
                      {!invitationToken && (
                        <div className="space-y-2">
                          <Label htmlFor="orgName">{t("auth.orgName")}</Label>
                          <Input id="orgName" value={orgName} onChange={(e) => setOrgName(e.target.value)} placeholder="Acme Corp" required />
                        </div>
                      )}
                      {invitationToken && (
                        <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
                          You've been invited to join an organization. Complete your registration below.
                        </p>
                      )}
                      <div className="space-y-2">
                        <Label htmlFor="fullName">{t("auth.fullName")}</Label>
                        <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Jane Doe" required />
                      </div>
                    </>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="email">{t("auth.email")}</Label>
                    <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" required />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">{t("auth.password")}</Label>
                      {mode === "login" && (
                        <button type="button" onClick={() => setMode("forgot")} className="text-xs text-primary hover:underline">{t("auth.forgotLink")}</button>
                      )}
                    </div>
                    <div className="relative">
                      <Input id="password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} className="pr-10" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? t("auth.loading") : mode === "login" ? t("auth.signin") : t("auth.signup")}
                  </Button>
                </form>
                <div className="mt-4 text-center text-sm text-muted-foreground">
                  {mode === "login" ? t("auth.noAccount") : t("auth.hasAccount")}{" "}
                  <button onClick={() => setMode(mode === "login" ? "signup" : "login")} className="text-primary hover:underline">
                    {mode === "login" ? t("auth.signup") : t("auth.signin")}
                  </button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
