import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { CreditCard, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AdminBilling = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    enforce_gdpr: true,
    sandbox_enabled: true,
    audit_retention_days: 365,
    session_timeout_min: 60,
  });

  const plan = {
    name: "PILOT",
    renewal: "10/4/2026",
    api_used: 3247,
    api_limit: 10000,
  };

  const usagePercent = Math.round((plan.api_used / plan.api_limit) * 100);

  const handleSave = () => {
    toast({ title: "Settings saved" });
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <div className="flex items-center gap-3">
          <CreditCard className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Billing & Usage</h1>
        </div>
        <p className="text-sm text-muted-foreground mt-1">Plan, usage limits, and security configuration</p>
      </div>

      <Card className="p-6 space-y-4">
        <h2 className="text-lg font-bold">Current Plan</h2>
        <div className="flex items-center gap-3">
          <Badge className="bg-primary/20 text-primary border-primary/30">{plan.name}</Badge>
          <span className="text-sm text-muted-foreground">Renewal: {plan.renewal}</span>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">API Requests</span>
            <span className="text-primary">
              {plan.api_used.toLocaleString()} / {plan.api_limit.toLocaleString()} ({usagePercent}%)
            </span>
          </div>
          <Progress value={usagePercent} className="h-2" />
        </div>
      </Card>

      <Card className="p-6 space-y-5">
        <h2 className="text-lg font-bold">Security Configuration</h2>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold">Enforce GDPR Providers</p>
            <p className="text-sm text-muted-foreground">Only allow GDPR-compliant LLM providers</p>
          </div>
          <Switch
            checked={settings.enforce_gdpr}
            onCheckedChange={(v) => setSettings(s => ({ ...s, enforce_gdpr: v }))}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold">Sandbox Enabled</p>
            <p className="text-sm text-muted-foreground">Allow PII Sandbox testing</p>
          </div>
          <Switch
            checked={settings.sandbox_enabled}
            onCheckedChange={(v) => setSettings(s => ({ ...s, sandbox_enabled: v }))}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-1.5">Audit Retention (days)</label>
            <Input
              type="number"
              value={settings.audit_retention_days}
              onChange={(e) => setSettings(s => ({ ...s, audit_retention_days: Number(e.target.value) }))}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1.5">Session Timeout (min)</label>
            <Input
              type="number"
              value={settings.session_timeout_min}
              onChange={(e) => setSettings(s => ({ ...s, session_timeout_min: Number(e.target.value) }))}
            />
          </div>
        </div>
        <p className="text-xs text-muted-foreground">GDPR minimum: 365 days</p>

        <Button onClick={handleSave}>
          <Save className="h-4 w-4 mr-2" />Save Changes
        </Button>
      </Card>
    </div>
  );
};

export default AdminBilling;
