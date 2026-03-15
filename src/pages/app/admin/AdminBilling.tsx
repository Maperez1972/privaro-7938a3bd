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

const planColors: Record<string, string> = {
  pilot: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  professional: "bg-purple-500/15 text-purple-400 border-purple-500/30",
  enterprise: "bg-amber-500/15 text-amber-400 border-amber-500/30",
};

const AdminBilling = () => {
  const { profile } = useAuth();
  const orgId = profile?.org_id;
  const queryClient = useQueryClient();

  const { data: org } = useQuery({
    queryKey: ["admin-org", orgId],
    enabled: !!orgId,
    queryFn: async () => {
      const { data } = await supabase
        .from("organizations")
        .select("name, plan")
        .eq("id", orgId!)
        .single();
      return data;
    },
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
        throw new Error("GDPR requires minimum 365 days retention");
      }
      const { error } = await supabase
        .from("org_settings")
        .update(form)
        .eq("org_id", orgId!);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["org-settings", orgId] });
      toast.success("Settings saved");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const usagePercent = settings
    ? Math.min(100, Math.round((Number(settings.requests_used) / Number(settings.requests_limit)) * 100))
    : 0;

  const usageColor = usagePercent >= 90 ? "text-red-400" : usagePercent >= 70 ? "text-amber-400" : "text-green-400";

  const renewalDate = settings?.billing_cycle_start
    ? new Date(new Date(settings.billing_cycle_start).getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()
    : "—";

  return (
    <div className="p-6 space-y-6">
      <div>
        <div className="flex items-center gap-3">
          <CreditCard className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Billing & Usage</h1>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Plan, usage limits, and security configuration
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
              <CardTitle className="text-base">Current Plan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Badge className={planColors[org?.plan ?? "pilot"] ?? planColors.pilot}>
                  {org?.plan?.toUpperCase() ?? "PILOT"}
                </Badge>
                <span className="text-sm text-muted-foreground">Renewal: {renewalDate}</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">API Requests</span>
                  <span className={usageColor}>
                    {Number(settings?.requests_used ?? 0).toLocaleString()} / {Number(settings?.requests_limit ?? 10000).toLocaleString()} ({usagePercent}%)
                  </span>
                </div>
                <Progress value={usagePercent} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-base">Security Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">Enforce GDPR Providers</p>
                  <p className="text-sm text-muted-foreground">Only allow GDPR-compliant LLM providers</p>
                </div>
                <Switch
                  checked={form.enforce_gdpr_providers}
                  onCheckedChange={(v) => setForm({ ...form, enforce_gdpr_providers: v })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">Sandbox Enabled</p>
                  <p className="text-sm text-muted-foreground">Allow PII Sandbox testing</p>
                </div>
                <Switch
                  checked={form.sandbox_enabled}
                  onCheckedChange={(v) => setForm({ ...form, sandbox_enabled: v })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="mb-1.5">Audit Retention (days)</Label>
                  <Input
                    type="number"
                    value={form.audit_retention_days}
                    onChange={(e) => setForm({ ...form, audit_retention_days: parseInt(e.target.value) || 365 })}
                  />
                  <p className="text-xs text-muted-foreground mt-1">GDPR minimum: 365 days</p>
                </div>
                <div>
                  <Label className="mb-1.5">Session Timeout (min)</Label>
                  <Input
                    type="number"
                    value={form.session_timeout_min}
                    onChange={(e) => setForm({ ...form, session_timeout_min: parseInt(e.target.value) || 60 })}
                  />
                </div>
              </div>
              <Button onClick={() => saveSettings.mutate()} disabled={saveSettings.isPending} className="gap-2">
                {saveSettings.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default AdminBilling;
