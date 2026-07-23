import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CreditCard, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";

const planColors: Record<string, string> = {
  pilot: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  professional: "bg-purple-500/15 text-purple-400 border-purple-500/30",
  enterprise: "bg-amber-500/15 text-amber-400 border-amber-500/30",
};

const AdminBilling = () => {
  const { profile } = useAuth();
  const { t } = useLanguage();
  const orgId = profile?.org_id;
  const queryClient = useQueryClient();

  const { data: org } = useQuery({
    queryKey: ["admin-org", orgId],
    enabled: !!orgId,
    queryFn: async () => {
      const { data } = await supabase
        .from("organizations")
        .select("name, plan, streaming_enabled, org_type, billing_account_id" as any)
        .eq("id", orgId!)
        .single();
      return data as any;
    },
  });

  const billingAccountId = org?.billing_account_id as string | undefined;
  const orgType = org?.org_type as string | undefined;

  const { data: billing } = useQuery({
    queryKey: ["admin-billing-account", billingAccountId],
    enabled: !!billingAccountId,
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("billing_accounts")
        .select("plan, requests_used, requests_limit, discount_phase, billing_cycle_start")
        .eq("id", billingAccountId!)
        .maybeSingle();
      return data as {
        plan: string;
        requests_used: number;
        requests_limit: number;
        discount_phase: string;
        billing_cycle_start: string;
      } | null;
    },
  });

  const cycleStart = (() => {
    const d = new Date();
    return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1)).toISOString().slice(0, 10);
  })();

  const { data: ownUsage } = useQuery({
    queryKey: ["admin-own-usage", orgId, cycleStart],
    enabled: !!orgId && orgType === "sub_account",
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("org_usage_monthly")
        .select("requests_used")
        .eq("org_id", orgId!)
        .eq("cycle_start", cycleStart)
        .maybeSingle();
      return (data as { requests_used: number } | null) ?? { requests_used: 0 };
    },
  });

  const toggleStreaming = useMutation({
    mutationFn: async (v: boolean) => {
      const { error } = await supabase
        .from("organizations")
        .update({ streaming_enabled: v } as any)
        .eq("id", orgId!);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-org", orgId] });
      toast.success(t("app.admin.billing.streamingUpdated"));
    },
    onError: (e: Error) => toast.error(e.message),
  });


  const { data: settings, isLoading } = useQuery({
    queryKey: ["org-settings", orgId],
    enabled: !!orgId,
    queryFn: async () => {
      const { data } = await supabase
        .from("org_settings")
        .select("*")
        .eq("org_id", orgId!)
        .maybeSingle();
      if (!data) {
        const { data: created } = await supabase
          .from("org_settings")
          .insert({ org_id: orgId! })
          .select()
          .single();
        return created;
      }
      return data;
    },
  });

  const [form, setForm] = useState({
    enforce_gdpr_providers: true,
    sandbox_enabled: true,
    audit_retention_days: 365,
    session_timeout_min: 60,
  });

  useEffect(() => {
    if (settings) {
      setForm({
        enforce_gdpr_providers: settings.enforce_gdpr_providers,
        sandbox_enabled: settings.sandbox_enabled,
        audit_retention_days: settings.audit_retention_days,
        session_timeout_min: settings.session_timeout_min,
      });
    }
  }, [settings]);

  const saveSettings = useMutation({
    mutationFn: async () => {
      if (form.audit_retention_days < 365) {
        throw new Error(t("app.admin.billing.gdprMinRetention"));
      }
      const { error } = await supabase
        .from("org_settings")
        .update(form)
        .eq("org_id", orgId!);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["org-settings", orgId] });
      toast.success(t("app.admin.billing.settingsSaved"));
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const usagePercent = billing && billing.requests_limit
    ? Math.min(100, Math.round((Number(billing.requests_used) / Number(billing.requests_limit)) * 100))
    : 0;

  const usageColor = usagePercent >= 90 ? "text-red-400" : usagePercent >= 70 ? "text-amber-400" : "text-green-400";

  const renewalDate = billing?.billing_cycle_start
    ? new Date(new Date(billing.billing_cycle_start).getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()
    : "—";

  const isSubAccount = orgType === "sub_account";
  const planLabel = (billing?.plan ?? org?.plan ?? "pilot") as string;

  return (
    <div className="p-6 space-y-6">
      <div>
        <div className="flex items-center gap-3">
          <CreditCard className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">{t("app.admin.billing.title")}</h1>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          {t("app.admin.billing.subtitle")}
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {/* Plan Card */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-base">{t("app.admin.billing.currentPlan")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 flex-wrap">
                <Badge className={planColors[planLabel] ?? planColors.pilot}>
                  {planLabel.toUpperCase()}
                </Badge>
                {billing?.discount_phase && (
                  <Badge variant="outline" className="capitalize">
                    Fase: {billing.discount_phase.replace("_", " ")}
                  </Badge>
                )}
                <span className="text-sm text-muted-foreground">{t("app.admin.billing.renewal")}: {renewalDate}</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">
                    {isSubAccount ? "Consumo agregado del partner" : t("app.admin.billing.apiRequests")}
                  </span>
                  <span className={usageColor}>
                    {Number(billing?.requests_used ?? 0).toLocaleString()} / {Number(billing?.requests_limit ?? 0).toLocaleString()} ({usagePercent}%)
                  </span>
                </div>
                <Progress value={usagePercent} className="h-2" />
                {isSubAccount && (
                  <p className="text-xs text-muted-foreground">
                    Este total incluye el consumo de todas las organizaciones del partner, no solo el tuyo.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {isSubAccount && (
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-base">Tu consumo este mes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold tabular-nums">
                    {Number(ownUsage?.requests_used ?? 0).toLocaleString()}
                  </span>
                  <span className="text-sm text-muted-foreground">peticiones</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Ciclo actual desde {new Date(cycleStart).toLocaleDateString()}. Solo tu organización.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Security Settings */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-base">{t("app.admin.billing.securityConfig")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{t("app.admin.billing.enforceGdpr")}</p>
                  <p className="text-sm text-muted-foreground">{t("app.admin.billing.enforceGdprDesc")}</p>
                </div>
                <Switch
                  checked={form.enforce_gdpr_providers}
                  onCheckedChange={(v) => setForm({ ...form, enforce_gdpr_providers: v })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{t("app.admin.billing.sandboxEnabled")}</p>
                  <p className="text-sm text-muted-foreground">{t("app.admin.billing.sandboxEnabledDesc")}</p>
                </div>
                <Switch
                  checked={form.sandbox_enabled}
                  onCheckedChange={(v) => setForm({ ...form, sandbox_enabled: v })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{t("app.admin.billing.streamingResponses")}</p>
                  <p className="text-sm text-muted-foreground">
                    Permite a vuestra integración recibir las respuestas del LLM en streaming (palabra a palabra) en vez de esperar la respuesta completa. Activado por defecto.
                  </p>
                </div>
                <Switch
                  checked={org?.streaming_enabled ?? true}
                  disabled={toggleStreaming.isPending}
                  onCheckedChange={(v) => toggleStreaming.mutate(v)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="mb-1.5">{t("app.admin.billing.auditRetention")}</Label>
                  <Input
                    type="number"
                    value={form.audit_retention_days}
                    onChange={(e) => setForm({ ...form, audit_retention_days: parseInt(e.target.value) || 365 })}
                  />
                  <p className="text-xs text-muted-foreground mt-1">{t("app.admin.billing.gdprMinLabel")}</p>
                </div>
                <div>
                  <Label className="mb-1.5">{t("app.admin.billing.sessionTimeout")}</Label>
                  <Input
                    type="number"
                    value={form.session_timeout_min}
                    onChange={(e) => setForm({ ...form, session_timeout_min: parseInt(e.target.value) || 60 })}
                  />
                </div>
              </div>
              <Button onClick={() => saveSettings.mutate()} disabled={saveSettings.isPending} className="gap-2">
                {saveSettings.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {t("app.admin.billing.saveChanges")}
              </Button>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default AdminBilling;
