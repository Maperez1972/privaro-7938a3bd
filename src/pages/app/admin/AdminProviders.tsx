import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Cpu, Plus, Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

const regionColors: Record<string, string> = {
  EU: "bg-green-500/15 text-green-400 border-green-500/30",
  US: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  CN: "bg-red-500/15 text-red-400 border-red-500/30",
  AU: "bg-blue-500/15 text-blue-400 border-blue-500/30",
};

interface LlmProvider {
  id: string;
  org_id: string;
  provider: string;
  display_name: string;
  is_active: boolean;
  api_key_encrypted: string | null;
  api_key_hint: string | null;
  base_url: string | null;
  available_models: string[];
  data_region: string;
  gdpr_compliant: boolean;
  created_at: string;
  updated_at: string;
}

const AdminProviders = () => {
  const { profile } = useAuth();
  const orgId = profile?.org_id;
  const queryClient = useQueryClient();
  const [selectedProvider, setSelectedProvider] = useState<LlmProvider | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [gdprChecked, setGdprChecked] = useState(false);
  const [newModels, setNewModels] = useState("");

  // Custom provider form
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customBaseUrl, setCustomBaseUrl] = useState("");
  const [customModels, setCustomModels] = useState("");

  const { data: providers, isLoading } = useQuery({
    queryKey: ["llm-providers", orgId],
    enabled: !!orgId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("llm_providers")
        .select("*")
        .eq("org_id", orgId!)
        .order("provider");
      if (error) throw error;
      return data as LlmProvider[];
    },
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from("llm_providers")
        .update({ is_active })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["llm-providers", orgId] });
      toast.success("Provider updated");
    },
    onError: () => toast.error("Failed to update provider"),
  });

  const saveProvider = useMutation({
    mutationFn: async () => {
      if (!selectedProvider) return;
      const updates: Record<string, unknown> = {
        gdpr_compliant: gdprChecked,
      };
      if (apiKey) {
        updates.api_key_encrypted = apiKey; // Mock — real encryption via Proxy API
        updates.api_key_hint = `...${apiKey.slice(-4)}`;
      }
      if (newModels.trim()) {
        updates.available_models = newModels.split(",").map((m) => m.trim()).filter(Boolean);
      }
      const { error } = await supabase
        .from("llm_providers")
        .update(updates)
        .eq("id", selectedProvider.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["llm-providers", orgId] });
      toast.success("La API key se almacenará cifrada. Integración con Proxy API pendiente.");
      setSheetOpen(false);
      setApiKey("");
    },
    onError: () => toast.error("Failed to save"),
  });

  const addCustomProvider = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("llm_providers").insert({
        org_id: orgId!,
        provider: "custom",
        display_name: customName,
        base_url: customBaseUrl,
        available_models: customModels.split(",").map((m) => m.trim()).filter(Boolean),
        data_region: "EU",
        gdpr_compliant: false,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["llm-providers", orgId] });
      toast.success("Custom provider added");
      setShowCustomForm(false);
      setCustomName("");
      setCustomBaseUrl("");
      setCustomModels("");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const openSheet = (p: LlmProvider) => {
    setSelectedProvider(p);
    setGdprChecked(p.gdpr_compliant);
    setNewModels(p.available_models.join(", "));
    setApiKey("");
    setSheetOpen(true);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Cpu className="w-5 h-5 text-primary" /> LLM Providers
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage LLM providers and API keys for your organization
          </p>
        </div>
        <Button size="sm" variant="outline" onClick={() => setShowCustomForm(true)}>
          <Plus className="w-4 h-4 mr-1" /> Add Custom Provider
        </Button>
      </div>

      {/* Banner */}
      <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-sm text-amber-300">
        <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
        <p>
          Las API keys se almacenan temporalmente en texto. El cifrado AES-256-GCM real se implementará
          cuando el Proxy API esté desplegado.
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {providers?.map((p) => (
            <Card
              key={p.id}
              className="border-border bg-card cursor-pointer hover:border-primary/30 transition-colors"
              onClick={() => openSheet(p)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{p.display_name}</CardTitle>
                  <Switch
                    checked={p.is_active}
                    onCheckedChange={(v) => {
                      toggleActive.mutate({ id: p.id, is_active: v });
                    }}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className={regionColors[p.data_region] || ""}>
                    {p.data_region}
                  </Badge>
                  <Badge variant="outline" className={p.gdpr_compliant ? "bg-green-500/15 text-green-400 border-green-500/30" : "bg-amber-500/15 text-amber-400 border-amber-500/30"}>
                    {p.gdpr_compliant ? "✅ GDPR" : "⚠️ No verificado"}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  {p.available_models.length} model{p.available_models.length !== 1 ? "s" : ""}
                  {p.api_key_hint && <span className="ml-2">Key: {p.api_key_hint}</span>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Provider Detail Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="bg-card border-border">
          <SheetHeader>
            <SheetTitle>{selectedProvider?.display_name}</SheetTitle>
          </SheetHeader>
          <div className="space-y-4 mt-6">
            <div className="space-y-2">
              <Label>API Key</Label>
              <Input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={selectedProvider?.api_key_hint ? `Current: ${selectedProvider.api_key_hint}` : "Enter API key"}
              />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                checked={gdprChecked}
                onCheckedChange={(v) => setGdprChecked(v === true)}
              />
              <Label className="text-sm">GDPR Compliant — verified by admin</Label>
            </div>
            <div className="space-y-2">
              <Label>Available Models (comma separated)</Label>
              <Input value={newModels} onChange={(e) => setNewModels(e.target.value)} />
            </div>
            <Button onClick={() => saveProvider.mutate()} disabled={saveProvider.isPending} className="w-full">
              {saveProvider.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Save Provider
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Custom Provider Dialog */}
      {showCustomForm && (
        <Card className="border-primary/30 bg-card">
          <CardHeader><CardTitle className="text-base">Add Custom Provider</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label>Display Name</Label>
              <Input value={customName} onChange={(e) => setCustomName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Base URL</Label>
              <Input value={customBaseUrl} onChange={(e) => setCustomBaseUrl(e.target.value)} placeholder="https://api.custom-llm.com/v1" />
            </div>
            <div className="space-y-2">
              <Label>Models (comma separated)</Label>
              <Input value={customModels} onChange={(e) => setCustomModels(e.target.value)} />
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => addCustomProvider.mutate()} disabled={addCustomProvider.isPending || !customName}>
                Add
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setShowCustomForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminProviders;
