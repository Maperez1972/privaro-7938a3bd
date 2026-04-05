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
  const { lang, setLangAndPersist } = useLanguage();
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
      toast.error("Error updating name");
    } else {
      toast.success("Name updated");
    }
  };

  const handleChangePassword = async () => {
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }
    setChangingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setChangingPassword(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Password updated");
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  const roleLabels: Record<string, string> = {
    admin: "Administrator",
    dpo: "Data Protection Officer",
    developer: "Developer",
    viewer: "Viewer",
  };

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your profile, organization, and account
        </p>
      </div>

      {/* Profile */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <User className="w-4 h-4 text-primary" />
            Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
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
            Save
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
            Organization
          </CardTitle>
        </CardHeader>
        <CardContent>
          {org ? (
            <div className="grid gap-3 sm:grid-cols-2 text-sm">
              <div>
                <span className="text-muted-foreground">Name</span>
                <p className="font-medium">{org.name}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Slug</span>
                <p className="font-mono text-xs">{org.slug}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Plan</span>
                <p className="font-medium capitalize">{org.plan}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Data Region</span>
                <p className="font-medium">{org.data_region}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Max Pipelines</span>
                <p className="font-medium">{org.max_pipelines}</p>
              </div>
              {org.gdpr_dpo_email && (
                <div>
                  <span className="text-muted-foreground">DPO Email</span>
                  <p className="font-medium">{org.gdpr_dpo_email}</p>
                </div>
              )}
            </div>
          ) : orgLoading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Organization not found. Check RLS policies on the <code className="text-xs bg-muted px-1 py-0.5 rounded">organizations</code> table.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Roles */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Shield className="w-4 h-4 text-primary" />
            Roles & Permissions
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
            <p className="text-sm text-muted-foreground">No roles assigned</p>
          )}
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Key className="w-4 h-4 text-primary" />
            Change Password
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>New Password</Label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min. 8 characters"
              />
            </div>
            <div className="space-y-2">
              <Label>Confirm Password</Label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat password"
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
            Update Password
          </Button>
        </CardContent>
      </Card>

      {/* Onboarding Reset */}
      {roles.includes("admin") && (
        <Card className="border-border bg-card">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold">Onboarding Wizard</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Reset the setup wizard to run it again</p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                localStorage.removeItem("privaro-onboarding-done");
                localStorage.removeItem("privaro-lastPreset");
                toast.success("Onboarding reset — it will appear in the sidebar again");
                window.dispatchEvent(new Event("storage"));
              }}
              className="gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Reset Onboarding
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Sign Out */}
      <div className="pt-2">
        <Button variant="destructive" size="sm" onClick={signOut}>
          Sign Out
        </Button>
      </div>
    </div>
  );
};

export default Settings;
