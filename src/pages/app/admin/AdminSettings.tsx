import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings2, Building2, Bell, Save, Loader2, Plus, X } from "lucide-react";
import { toast } from "sonner";

interface OrgNotification {
  id: string;
  org_id: string;
  type: string;
  is_enabled: boolean;
  threshold: number | null;
  recipients: string[];
  channel: string;
}

const notificationLabels: Record<string, string> = {
  incident_critical: "Critical Incidents",
  pii_leaked: "PII Leaks Detected",
  ibs_failed: "Blockchain Certification Failed",
  usage_threshold: "Usage Threshold Exceeded",
  cert_expiry: "Certificate Expiry",
};

const AdminSettings = () => {
  const { profile } = useAuth();
  const orgId = profile?.org_id;
  const queryClient = useQueryClient();

  // Org data
  const { data: org } = useQuery({
    queryKey: ["admin-org-detail", orgId],
    enabled: !!orgId,
    queryFn: async () => {
      const { data } = await supabase
        .from("organizations")
        .select("*")
        .eq("id", orgId!)
        .single();
      return data;
    },
  });

  const [orgForm, setOrgForm] = useState({ name: "", slug: "", gdpr_dpo_email: "", data_region: "EU" });

  useEffect(() => {
    if (org) {
      setOrgForm({
        name: org.name,
        slug: org.slug,
        gdpr_dpo_email: org.gdpr_dpo_email ?? "",
        data_region: org.data_region,
      });
    }
  }, [org]);

  const saveOrg = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("organizations")
        .update(orgForm)
        .eq("id", orgId!);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-org-detail", orgId] });
      toast.success("Organization updated");
    },
    onError: () => toast.error("Failed to update organization"),
  });

  // Notifications
  const { data: notifications } = useQuery({
    queryKey: ["org-notifications", orgId],
    enabled: !!orgId,
    queryFn: async () => {
      const { data } = await supabase
        .from("org_notifications")
        .select("*")
        .eq("org_id", orgId!)
        .order("type");
      return data as OrgNotification[];
    },
  });

  const [notifForm, setNotifForm] = useState<Record<string, { is_enabled: boolean; threshold: number | null; recipients: string[]; newEmail: string }>>({});

  useEffect(() => {
    if (notifications) {
      const form: typeof notifForm = {};
      notifications.forEach((n) => {
        form[n.type] = {
          is_enabled: n.is_enabled,
          threshold: n.threshold,
          recipients: n.recipients,
          newEmail: "",
        };
      });
      setNotifForm(form);
    }
  }, [notifications]);

  const saveNotifications = useMutation({
    mutationFn: async () => {
      for (const [type, val] of Object.entries(notifForm)) {
        const { error } = await supabase
          .from("org_notifications")
          .upsert({
            org_id: orgId!,
            type,
            is_enabled: val.is_enabled,
            threshold: val.threshold,
            recipients: val.recipients,
          }, { onConflict: "org_id,type" });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["org-notifications", orgId] });
      toast.success("Notifications saved");
    },
    onError: () => toast.error("Failed to save notifications"),
  });

  const updateNotif = (type: string, field: string, value: unknown) => {
    setNotifForm((prev) => ({
      ...prev,
      [type]: { ...prev[type], [field]: value },
    }));
  };

  const addRecipient = (type: string) => {
    const email = notifForm[type]?.newEmail?.trim();
    if (!email) return;
    setNotifForm((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        recipients: [...(prev[type]?.recipients ?? []), email],
        newEmail: "",
      },
    }));
  };

  const removeRecipient = (type: string, idx: number) => {
    setNotifForm((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        recipients: prev[type].recipients.filter((_, i) => i !== idx),
      },
    }));
  };

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Settings2 className="w-5 h-5 text-primary" /> Admin Settings
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Organization configuration and notification rules
        </p>
      </div>

      {/* Section A: Organization */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Building2 className="w-4 h-4 text-primary" /> Organization
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={orgForm.name} onChange={(e) => setOrgForm({ ...orgForm, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Slug</Label>
              <Input value={orgForm.slug} onChange={(e) => setOrgForm({ ...orgForm, slug: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>DPO Email</Label>
              <Input value={orgForm.gdpr_dpo_email} onChange={(e) => setOrgForm({ ...orgForm, gdpr_dpo_email: e.target.value })} placeholder="dpo@company.com" />
            </div>
            <div className="space-y-2">
              <Label>Data Region</Label>
              <Select value={orgForm.data_region} onValueChange={(v) => setOrgForm({ ...orgForm, data_region: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="EU">EU</SelectItem>
                  <SelectItem value="US">US</SelectItem>
                  <SelectItem value="AU">AU</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button size="sm" onClick={() => saveOrg.mutate()} disabled={saveOrg.isPending} className="gap-2">
            {saveOrg.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Organization
          </Button>
        </CardContent>
      </Card>

      {/* Section B: Notifications */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Bell className="w-4 h-4 text-primary" /> Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {Object.entries(notifForm).map(([type, val]) => (
            <div key={type} className="space-y-3 pb-4 border-b border-border last:border-0 last:pb-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{notificationLabels[type] ?? type}</p>
                </div>
                <Switch
                  checked={val.is_enabled}
                  onCheckedChange={(v) => updateNotif(type, "is_enabled", v)}
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-xs">Threshold</Label>
                  <Input
                    type="number"
                    value={val.threshold ?? ""}
                    onChange={(e) => updateNotif(type, "threshold", e.target.value ? parseInt(e.target.value) : null)}
                    placeholder="Optional"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Recipients</Label>
                  <div className="flex flex-wrap gap-1 mb-1">
                    {val.recipients.map((email, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs gap-1">
                        {email}
                        <button onClick={() => removeRecipient(type, idx)} className="hover:text-destructive">
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-1">
                    <Input
                      value={val.newEmail}
                      onChange={(e) => updateNotif(type, "newEmail", e.target.value)}
                      placeholder="email@company.com"
                      className="text-xs"
                      onKeyDown={(e) => e.key === "Enter" && addRecipient(type)}
                    />
                    <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => addRecipient(type)}>
                      <Plus className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {Object.keys(notifForm).length === 0 && (
            <p className="text-sm text-muted-foreground">No notification rules configured yet.</p>
          )}
          <Button onClick={() => saveNotifications.mutate()} disabled={saveNotifications.isPending} className="gap-2">
            {saveNotifications.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Notifications
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSettings;
