import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { User, Building2, Shield, Key, Save, Loader2, RotateCcw, Globe } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/context/LanguageContext";
import type { Language } from "@/context/LanguageContext";

const Settings = () => {
  const { user, profile, roles, signOut } = useAuth();
  const { lang, setLangAndPersist, t } = useLanguage();
  const [fullName, setFullName] = useState(profile?.full_name ?? "");
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingLang, setSavingLang] = useState(false);

  // Fetch org details
  const { data: org, isLoading: orgLoading } = useQuery({
    queryKey: ["org-details", profile?.org_id],
    enabled: !!profile?.org_id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("organizations")
        .select("name, slug, plan, data_region, gdpr_dpo_email, max_pipelines")
        .eq("id", profile!.org_id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const handleSaveName = async () => {
    if (!profile) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName })
      .eq("id", profile.id);
    setSaving(false);
    if (error) {
      toast.error(t("app.settings.toast.updateNameError"));
    } else {
      toast.success(t("app.settings.toast.updateNameSuccess"));
    }
  };

  const handleChangePassword = async () => {
    if (newPassword.length < 8) {
      toast.error(t("app.settings.toast.passwordTooShort"));
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error(t("app.settings.toast.passwordMismatch"));
      return;
    }
    setChangingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setChangingPassword(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(t("app.settings.toast.passwordUpdated"));
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  const roleLabels: Record<string, string> = {
    admin: t("app.settings.roles.admin"),
    dpo: t("app.settings.roles.dpo"),
    developer: t("app.settings.roles.developer"),
    viewer: t("app.settings.roles.viewer"),
  };

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("app.settings.title")}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t("app.settings.subtitle")}
        </p>
      </div>

      {/* Profile */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <User className="w-4 h-4 text-primary" />
            {t("app.settings.profile.title")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>{t("app.settings.profile.fullName")}</Label>
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("app.settings.profile.email")}</Label>
              <Input value={user?.email ?? ""} disabled className="opacity-60" />
            </div>
          </div>
          <Button
            size="sm"
            onClick={handleSaveName}
            disabled={saving || fullName === profile?.full_name}
            className="gap-2"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {t("app.settings.profile.save")}
          </Button>
        </CardContent>
      </Card>

      {/* Language */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Globe className="w-4 h-4 text-primary" />
            {lang === "es" ? "Idioma" : "Language"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            {(["en", "es"] as Language[]).map((l) => (
              <Button
                key={l}
                size="sm"
                variant={lang === l ? "default" : "outline"}
                disabled={savingLang}
                onClick={async () => {
                  setSavingLang(true);
                  await setLangAndPersist(l);
                  setSavingLang(false);
                  toast.success(l === "es" ? "Idioma actualizado" : "Language updated");
                }}
                className="gap-2"
              >
                {l === "en" ? "🇬🇧 English" : "🇪🇸 Español"}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Building2 className="w-4 h-4 text-primary" />
            {t("app.settings.organization.title")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {org ? (
            <div className="grid gap-3 sm:grid-cols-2 text-sm">
              <div>
                <span className="text-muted-foreground">{t("app.settings.organization.name")}</span>
                <p className="font-medium">{org.name}</p>
              </div>
              <div>
                <span className="text-muted-foreground">{t("app.settings.organization.slug")}</span>
                <p className="font-mono text-xs">{org.slug}</p>
              </div>
              <div>
                <span className="text-muted-foreground">{t("app.settings.organization.plan")}</span>
                <p className="font-medium capitalize">{org.plan}</p>
              </div>
              <div>
                <span className="text-muted-foreground">{t("app.settings.organization.dataRegion")}</span>
                <p className="font-medium">{org.data_region}</p>
              </div>
              <div>
                <span className="text-muted-foreground">{t("app.settings.organization.maxPipelines")}</span>
                <p className="font-medium">{org.max_pipelines}</p>
              </div>
              {org.gdpr_dpo_email && (
                <div>
                  <span className="text-muted-foreground">{t("app.settings.organization.dpoEmail")}</span>
                  <p className="font-medium">{org.gdpr_dpo_email}</p>
                </div>
              )}
            </div>
          ) : orgLoading ? (
            <p className="text-sm text-muted-foreground">{t("app.settings.organization.loading")}</p>
          ) : (
            <p className="text-sm text-muted-foreground">
              {t("app.settings.organization.notFound")} <code className="text-xs bg-muted px-1 py-0.5 rounded">organizations</code>.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Roles */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Shield className="w-4 h-4 text-primary" />
            {t("app.settings.roles.title")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {roles.map((role) => (
              <span
                key={role}
                className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20"
              >
                {roleLabels[role] ?? role}
              </span>
            ))}
          </div>
          {roles.length === 0 && (
            <p className="text-sm text-muted-foreground">{t("app.settings.roles.none")}</p>
          )}
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Key className="w-4 h-4 text-primary" />
            {t("app.settings.password.title")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>{t("app.settings.password.new")}</Label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder={t("app.settings.password.minChars")}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("app.settings.password.confirm")}</Label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={t("app.settings.password.repeat")}
              />
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={handleChangePassword}
            disabled={changingPassword || !newPassword}
            className="gap-2"
          >
            {changingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
            {t("app.settings.password.update")}
          </Button>
        </CardContent>
      </Card>

      {/* Onboarding Reset */}
      {roles.includes("admin") && (
        <Card className="border-border bg-card">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold">{t("app.settings.onboarding.title")}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{t("app.settings.onboarding.description")}</p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                localStorage.removeItem("privaro-onboarding-done");
                localStorage.removeItem("privaro-lastPreset");
                toast.success(t("app.settings.onboarding.resetSuccess"));
                window.dispatchEvent(new Event("storage"));
              }}
              className="gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              {t("app.settings.onboarding.reset")}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Sign Out */}
      <div className="pt-2">
        <Button variant="destructive" size="sm" onClick={signOut}>
          {t("app.settings.signOut")}
        </Button>
      </div>
    </div>
  );
};

export default Settings;
