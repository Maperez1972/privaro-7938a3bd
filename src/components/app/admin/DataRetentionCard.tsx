import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Save, Loader2, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface RetentionForm {
  audit_retention_days: number;
  token_ttl_days: number;
  conversations_retention_days: number;
  pii_detections_retention_days: number;
}

const DEFAULTS: RetentionForm = {
  audit_retention_days: 365,
  token_ttl_days: 90,
  conversations_retention_days: 180,
  pii_detections_retention_days: 365,
};

const FIELDS: { key: keyof RetentionForm; label: string; desc: string }[] = [
  { key: "audit_retention_days", label: "Audit Logs", desc: "Days to retain audit log entries" },
  { key: "token_ttl_days", label: "Tokens Vault", desc: "Days to retain tokenized values" },
  { key: "conversations_retention_days", label: "Conversations", desc: "Days to retain chat messages" },
  { key: "pii_detections_retention_days", label: "PII Detections", desc: "Days to retain PII detection records" },
];

export const DataRetentionCard = ({ orgId }: { orgId: string }) => {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<RetentionForm>(DEFAULTS);

  const { data: settings } = useQuery({
    queryKey: ["org-settings-retention", orgId],
    queryFn: async () => {
      const { data } = await supabase
        .from("org_settings")
        .select("audit_retention_days, token_ttl_days")
        .eq("org_id", orgId)
        .maybeSingle();
      return data;
    },
  });

  useEffect(() => {
    if (settings) {
      setForm({
        audit_retention_days: settings.audit_retention_days ?? DEFAULTS.audit_retention_days,
        token_ttl_days: settings.token_ttl_days ?? DEFAULTS.token_ttl_days,
        conversations_retention_days: (settings as any).conversations_retention_days ?? DEFAULTS.conversations_retention_days,
        pii_detections_retention_days: (settings as any).pii_detections_retention_days ?? DEFAULTS.pii_detections_retention_days,
      });
    }
  }, [settings]);

  const save = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("org_settings")
        .update(form as any)
        .eq("org_id", orgId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["org-settings-retention", orgId] });
      toast.success("Data retention policy saved");
    },
    onError: () => toast.error("Failed to save retention policy"),
  });

  const { data: runs } = useQuery({
    queryKey: ["retention-runs", orgId],
    queryFn: async () => {
      const { data } = await supabase
        .from("retention_runs" as any)
        .select("*")
        .eq("org_id", orgId)
        .order("ran_at", { ascending: false })
        .limit(5);
      return data as any[] | null;
    },
  });

  const statusIcon = (s: string) => {
    if (s === "completed") return <CheckCircle2 className="w-3.5 h-3.5 text-primary" />;
    if (s === "failed") return <XCircle className="w-3.5 h-3.5 text-destructive" />;
    return <AlertCircle className="w-3.5 h-3.5 text-accent-foreground" />;
  };

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Clock className="w-4 h-4 text-primary" /> Data Retention Policy
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          {FIELDS.map((f) => (
            <div key={f.key} className="space-y-1.5">
              <Label className="text-sm">{f.label}</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={1}
                  value={form[f.key]}
                  onChange={(e) => setForm({ ...form, [f.key]: parseInt(e.target.value) || 0 })}
                  className="w-24"
                />
                <span className="text-xs text-muted-foreground">days</span>
              </div>
              <p className="text-xs text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>

        <Button size="sm" onClick={() => save.mutate()} disabled={save.isPending} className="gap-2">
          {save.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Retention Policy
        </Button>

        {/* Retention Runs History */}
        {runs && runs.length > 0 && (
          <div className="pt-4 border-t border-border">
            <p className="text-sm font-medium mb-3">Recent Retention Runs</p>
            <div className="space-y-2">
              {runs.map((run: any) => (
                <div key={run.id} className="flex items-center justify-between text-xs bg-muted/50 rounded-md px-3 py-2">
                  <div className="flex items-center gap-2">
                    {statusIcon(run.status)}
                    <span className="text-muted-foreground">
                      {new Date(run.ran_at).toLocaleDateString()} {new Date(run.ran_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <div className="flex gap-3">
                    <Badge variant="outline" className="text-[10px]">{run.tokens_revoked} tokens</Badge>
                    <Badge variant="outline" className="text-[10px]">{run.logs_anonymized} logs</Badge>
                    <Badge variant="outline" className="text-[10px]">{run.messages_deleted} msgs</Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
