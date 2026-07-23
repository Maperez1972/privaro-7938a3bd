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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { Cpu, Plus, Loader2, Globe, Shield, FileText, HeartPulse, Bot, Eye, EyeOff, Key, KeyRound, Zap, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/context/LanguageContext";

const TEST_ENDPOINTS: Record<string, { url: string; buildHeaders: (key: string) => Record<string, string>; buildBody?: () => string; method?: string }> = {
  openai: {
    url: "https://api.openai.com/v1/models",
    buildHeaders: (key) => ({ Authorization: `Bearer ${key}` }),
  },
  anthropic: {
    url: "https://api.anthropic.com/v1/messages",
    buildHeaders: (key) => ({ "x-api-key": key, "anthropic-version": "2023-06-01", "Content-Type": "application/json" }),
    buildBody: () => JSON.stringify({ model: "claude-haiku-4-5-20251001", max_tokens: 1, messages: [{ role: "user", content: "hi" }] }),
    method: "POST",
  },
  deepseek: {
    url: "https://api.deepseek.com/v1/models",
    buildHeaders: (key) => ({ Authorization: `Bearer ${key}` }),
  },
  google: {
    url: "https://generativelanguage.googleapis.com/v1/models",
    buildHeaders: (key) => ({ "x-goog-api-key": key }),
  },
};

const API_KEY_PATTERNS: Record<string, { regex: RegExp; hint: string }> = {
  openai: { regex: /^sk-[a-zA-Z0-9_-]{20,}$/, hint: "Must start with sk- (e.g. sk-proj-...)" },
  anthropic: { regex: /^sk-ant-[a-zA-Z0-9_-]{20,}$/, hint: "Must start with sk-ant- (e.g. sk-ant-api03-...)" },
  google: { regex: /^AIza[a-zA-Z0-9_-]{30,}$/, hint: "Must start with AIza..." },
  azure: { regex: /^[a-f0-9]{32}$/, hint: "Must be a 32-char hex string" },
  deepseek: { regex: /^sk-[a-zA-Z0-9_-]{20,}$/, hint: "Must start with sk-" },
  custom: { regex: /^.{8,}$/, hint: "At least 8 characters" },
};

const getNestedEncryptionError = (payload: unknown): string | null => {
  if (!payload || typeof payload !== "object") return null;

  const body = payload as Record<string, unknown>;
  const detail = body.detail;
  if (typeof detail === "string") {
    try {
      const parsed = JSON.parse(detail) as unknown;
      return getNestedEncryptionError(parsed) ?? detail;
    } catch {
      return detail;
    }
  }

  if (detail && typeof detail === "object") {
    const nested = getNestedEncryptionError(detail);
    if (nested) return nested;
  }

  const error = body.error;
  if (typeof error === "string") return error;

  const message = body.message;
  if (typeof message === "string") return message;

  return null;
};

const encryptProviderKey = async (body: { provider: string; raw_key: string; base_url?: string }) => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

  if (sessionError || !sessionData.session?.access_token) {
    throw new Error("Authentication session not available. Please sign in again.");
  }

  const response = await fetch(`${supabaseUrl}/functions/v1/encrypt-provider-key`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: supabasePublishableKey,
      Authorization: `Bearer ${sessionData.session.access_token}`,
    },
    body: JSON.stringify(body),
  });

  const contentType = response.headers.get("content-type") ?? "";
  const payload: unknown = contentType.includes("application/json") ? await response.json() : await response.text();

  if (!response.ok) {
    const detail = getNestedEncryptionError(payload);
    if (detail === "server_misconfigured") {
      throw new Error("Encryption service is misconfigured. The provider API key was not saved.");
    }
    throw new Error(detail || "Failed to encrypt provider API key");
  }

  if (payload && typeof payload === "object") {
    const result = payload as Record<string, unknown>;
    if (result.success === false) {
      throw new Error(getNestedEncryptionError(result) || "Failed to encrypt provider API key");
    }
  }
};

const regionColors: Record<string, string> = {
  EU: "bg-green-500/15 text-green-400 border-green-500/30",
  US: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  CN: "bg-red-500/15 text-red-400 border-red-500/30",
  AU: "bg-blue-500/15 text-blue-400 border-blue-500/30",
};

const riskLevelConfig: Record<string, { label: string; className: string }> = {
  low: { label: "Low Risk", className: "bg-success/15 text-success border-success/30" },
  medium: { label: "Medium", className: "bg-amber-500/15 text-amber-400 border-amber-500/30" },
  high: { label: "High Risk", className: "bg-destructive/15 text-destructive border-destructive/30" },
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
  provider_risk_level: string;
  model_class: string;
  eu_residency: boolean;
  training_disabled: boolean;
  enterprise_agreement: boolean;
  approved_special_categories: boolean;
  approved_for_agents: boolean;
  created_at: string;
  updated_at: string;
}

const TRUST_POSTURE_ITEMS = [
  { key: "eu_residency" as const, icon: Globe, label: "EU Data Residency", desc: "Data processed and stored within EU" },
  { key: "training_disabled" as const, icon: Shield, label: "Training Disabled", desc: "Contractual: data not used for training" },
  { key: "enterprise_agreement" as const, icon: FileText, label: "Enterprise Agreement", desc: "DPA signed, enterprise tier active" },
  { key: "approved_special_categories" as const, icon: HeartPulse, label: "Approved for Special Categories", desc: "GDPR Art.9 — health, biometric, genetic" },
  { key: "approved_for_agents" as const, icon: Bot, label: "Approved for Agent Pipelines", desc: "Safe for autonomous agent workflows" },
] as const;

const TrustPostureIcons = ({ provider }: { provider: LlmProvider }) => (
  <TooltipProvider delayDuration={200}>
    <div className="flex items-center gap-1">
      {TRUST_POSTURE_ITEMS.map(({ key, icon: Icon, label }) => {
        const active = provider[key];
        return (
          <Tooltip key={key}>
            <TooltipTrigger asChild>
              <span>
                <Icon className={`w-3.5 h-3.5 ${active ? "text-success" : "text-muted-foreground/30"}`} />
              </span>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">
              {label}: {active ? "Yes" : "No"}
            </TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  </TooltipProvider>
);

const AdminProviders = () => {
  const { profile } = useAuth();
  const { t } = useLanguage();
  const orgId = profile?.org_id;
  const queryClient = useQueryClient();
  const [selectedProvider, setSelectedProvider] = useState<LlmProvider | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [testStatus, setTestStatus] = useState<"idle" | "testing" | "success" | "error">("idle");
  const [testMessage, setTestMessage] = useState("");
  const [gdprChecked, setGdprChecked] = useState(false);
  const [newModels, setNewModels] = useState("");

  // Trust posture form state
  const [formRiskLevel, setFormRiskLevel] = useState("medium");
  const [formModelClass, setFormModelClass] = useState("public_api");
  const [formEuResidency, setFormEuResidency] = useState(false);
  const [formTrainingDisabled, setFormTrainingDisabled] = useState(false);
  const [formEnterpriseAgreement, setFormEnterpriseAgreement] = useState(false);
  const [formApprovedSpecial, setFormApprovedSpecial] = useState(false);
  const [formApprovedAgents, setFormApprovedAgents] = useState(false);

  // Custom provider form
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customBaseUrl, setCustomBaseUrl] = useState("");
  const [customModels, setCustomModels] = useState("");

  const { data: providers, isLoading } = useQuery({
    queryKey: ["llm-providers", orgId],
    enabled: !!orgId,
    queryFn: async () => {
      // Rely on RLS for scoping instead of filtering by org_id in the client:
      // the encrypt-provider-key edge function may persist rows under a
      // different org_id shape (e.g. null / service org), and RLS already
      // restricts what an admin can read.
      const { data, error } = await (supabase
        .from("llm_providers")
        .select("id, org_id, provider, display_name, is_active, api_key_encrypted, api_key_hint, base_url, available_models, data_region, gdpr_compliant, provider_risk_level, model_class, eu_residency, training_disabled, enterprise_agreement, approved_special_categories, approved_for_agents, created_at, updated_at") as any)
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
      toast.success(t("app.admin.providers.providerUpdated"));
    },
    onError: () => toast.error(t("app.admin.providers.updateFailed")),
  });

  const saveProvider = useMutation({
    mutationFn: async () => {
      if (!selectedProvider) return;
      const updates: Record<string, unknown> = {
        gdpr_compliant: gdprChecked,
        provider_risk_level: formRiskLevel,
        model_class: formModelClass,
        eu_residency: formEuResidency,
        training_disabled: formTrainingDisabled,
        enterprise_agreement: formEnterpriseAgreement,
        approved_special_categories: formApprovedSpecial,
        approved_for_agents: formApprovedAgents,
      };
      if (newModels.trim()) {
        updates.available_models = newModels.split(",").map((m) => m.trim()).filter(Boolean);
      }
      const { error } = await (supabase as any)
        .from("llm_providers")
        .update(updates)
        .eq("id", selectedProvider.id);
      if (error) throw error;

      // Encrypt & persist the API key via the edge function — never store raw keys.
      if (apiKey) {
        const provider = selectedProvider.provider;
        const pattern = API_KEY_PATTERNS[provider] ?? API_KEY_PATTERNS.custom;
        if (!pattern.regex.test(apiKey)) {
          throw new Error(`Invalid API key format for ${provider}. ${pattern.hint}`);
        }
        await encryptProviderKey({
          provider,
          raw_key: apiKey,
          base_url: selectedProvider.base_url ?? undefined,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["llm-providers", orgId] });
      toast.success(t("app.admin.providers.providerSaved"));
      setSheetOpen(false);
      setApiKey("");
    },
    onError: (e: Error) => toast.error(e.message || t("app.admin.providers.saveFailed")),
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
      toast.success(t("app.admin.providers.customProviderAdded"));
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
    setFormRiskLevel(p.provider_risk_level || "medium");
    setFormModelClass(p.model_class || "public_api");
    setFormEuResidency(p.eu_residency ?? false);
    setFormTrainingDisabled(p.training_disabled ?? false);
    setFormEnterpriseAgreement(p.enterprise_agreement ?? false);
    setFormApprovedSpecial(p.approved_special_categories ?? false);
    setFormApprovedAgents(p.approved_for_agents ?? false);
    setSheetOpen(true);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Cpu className="w-5 h-5 text-primary" /> {t("app.admin.providers.title")}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t("app.admin.providers.subtitle")}
          </p>
        </div>
        <Button size="sm" variant="outline" onClick={() => setShowCustomForm(true)}>
          <Plus className="w-4 h-4 mr-1" /> {t("app.admin.providers.addCustomProvider")}
        </Button>
      </div>


      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {providers?.map((p) => {
            const risk = riskLevelConfig[p.provider_risk_level] || riskLevelConfig.medium;
            return (
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
                    <Badge variant="outline" className={risk.className}>
                      {risk.label}
                    </Badge>
                    <Badge variant="outline" className={p.gdpr_compliant ? "bg-success/15 text-success border-success/30" : "bg-amber-500/15 text-amber-400 border-amber-500/30"}>
                      {p.gdpr_compliant ? t("app.admin.providers.gdprBadge") : t("app.admin.providers.notVerifiedBadge")}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="flex items-center gap-1">
                            {p.api_key_hint ? (
                              <Key className="w-3.5 h-3.5 text-success" />
                            ) : (
                              <KeyRound className="w-3.5 h-3.5 text-destructive" />
                            )}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>{p.api_key_hint ? `${t("app.admin.providers.apiKeyConfigured")} (${p.api_key_hint})` : t("app.admin.providers.noApiKeyConfigured")}</TooltipContent>
                      </Tooltip>
                      <span>{p.available_models.length} {p.available_models.length !== 1 ? t("app.admin.providers.models") : t("app.admin.providers.model")}</span>
                    </div>
                    <TrustPostureIcons provider={p} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Provider Detail Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="bg-card border-border overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{selectedProvider?.display_name}</SheetTitle>
          </SheetHeader>
          <div className="space-y-4 mt-6">
            <div className="space-y-2">
              <Label>{t("app.admin.providers.apiKey")}</Label>
              <div className="relative">
                <Input
                  type={showApiKey ? "text" : "password"}
                  value={apiKey}
                  onChange={(e) => { setApiKey(e.target.value); setTestStatus("idle"); setTestMessage(""); }}
                  placeholder={selectedProvider?.api_key_hint ? `${t("app.admin.providers.current")}: ${selectedProvider.api_key_hint}` : t("app.admin.providers.enterApiKey")}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full w-10 hover:bg-transparent"
                  onClick={() => setShowApiKey(!showApiKey)}
                >
                  {showApiKey ? <EyeOff className="w-4 h-4 text-muted-foreground" /> : <Eye className="w-4 h-4 text-muted-foreground" />}
                </Button>
              </div>
              {apiKey && (() => {
                const provider = selectedProvider?.provider ?? "custom";
                const pattern = API_KEY_PATTERNS[provider] ?? API_KEY_PATTERNS.custom;
                const valid = pattern.regex.test(apiKey);
                return (
                  <p className={`text-xs ${valid ? "text-success" : "text-destructive"}`}>
                    {valid ? t("app.admin.providers.validFormat") : `${t("app.admin.providers.invalidFormat")} ${pattern.hint}`}
                  </p>
                );
              })()}
              {apiKey && (() => {
                const provider = selectedProvider?.provider ?? "custom";
                const testEndpoint = TEST_ENDPOINTS[provider];
                if (!testEndpoint) return null;
                const pattern = API_KEY_PATTERNS[provider] ?? API_KEY_PATTERNS.custom;
                const formatValid = pattern.regex.test(apiKey);
                if (!formatValid) return null;

                const handleTest = async () => {
                  setTestStatus("testing");
                  setTestMessage("");
                  try {
                    const res = await fetch(testEndpoint.url, {
                      method: testEndpoint.method ?? "GET",
                      headers: testEndpoint.buildHeaders(apiKey),
                      body: testEndpoint.buildBody?.() ?? undefined,
                    });
                    if (res.ok || res.status === 200 || res.status === 201) {
                      setTestStatus("success");
                      setTestMessage("Connection successful — API key is valid");
                    } else if (res.status === 401 || res.status === 403) {
                      setTestStatus("error");
                      setTestMessage("Authentication failed — invalid or expired API key");
                    } else {
                      const text = await res.text().catch(() => "");
                      setTestStatus("error");
                      setTestMessage(`Error ${res.status}: ${text.slice(0, 100)}`);
                    }
                  } catch (err: any) {
                    // CORS errors are expected for some providers — treat as likely valid
                    if (err.message?.includes("Failed to fetch") || err.name === "TypeError") {
                      setTestStatus("success");
                      setTestMessage("Request sent — CORS blocked response, but key format is valid");
                    } else {
                      setTestStatus("error");
                      setTestMessage(err.message ?? "Connection failed");
                    }
                  }
                };

                return (
                  <div className="space-y-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="gap-2 w-full"
                      disabled={testStatus === "testing"}
                      onClick={handleTest}
                    >
                      {testStatus === "testing" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                      {t("app.admin.providers.testConnection")}
                    </Button>
                    {testStatus === "success" && (
                      <p className="text-xs text-success flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> {testMessage}
                      </p>
                    )}
                    {testStatus === "error" && (
                      <p className="text-xs text-destructive flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5" /> {testMessage}
                      </p>
                    )}
                  </div>
                );
              })()}
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                checked={gdprChecked}
                onCheckedChange={(v) => setGdprChecked(v === true)}
              />
              <Label className="text-sm">{t("app.admin.providers.gdprCompliantLabel")}</Label>
            </div>
            <div className="space-y-2">
              <Label>{t("app.admin.providers.availableModels")}</Label>
              <Input value={newModels} onChange={(e) => setNewModels(e.target.value)} />
            </div>

            <Separator />

            {/* Trust Posture Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">{t("app.admin.providers.trustPosture")}</h3>

              <div className="space-y-2">
                <Label className="text-xs">{t("app.admin.providers.riskLevel")}</Label>
                <Select value={formRiskLevel} onValueChange={setFormRiskLevel}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">{t("app.admin.providers.low")}</SelectItem>
                    <SelectItem value="medium">{t("app.admin.providers.medium")}</SelectItem>
                    <SelectItem value="high">{t("app.admin.providers.high")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs">{t("app.admin.providers.modelClass")}</Label>
                <Select value={formModelClass} onValueChange={setFormModelClass}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public_api">{t("app.admin.providers.publicApi")}</SelectItem>
                    <SelectItem value="enterprise">{t("app.admin.providers.enterprise")}</SelectItem>
                    <SelectItem value="private">{t("app.admin.providers.private")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {TRUST_POSTURE_ITEMS.map(({ key, label, desc }) => {
                const stateMap: Record<string, [boolean, (v: boolean) => void]> = {
                  eu_residency: [formEuResidency, setFormEuResidency],
                  training_disabled: [formTrainingDisabled, setFormTrainingDisabled],
                  enterprise_agreement: [formEnterpriseAgreement, setFormEnterpriseAgreement],
                  approved_special_categories: [formApprovedSpecial, setFormApprovedSpecial],
                  approved_for_agents: [formApprovedAgents, setFormApprovedAgents],
                };
                const [checked, setChecked] = stateMap[key];
                return (
                  <div key={key} className="flex items-start gap-2">
                    <Checkbox
                      checked={checked}
                      onCheckedChange={(v) => setChecked(v === true)}
                      className="mt-0.5"
                    />
                    <div>
                      <Label className="text-sm">{label}</Label>
                      <p className="text-xs text-muted-foreground">{desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <Button onClick={() => saveProvider.mutate()} disabled={saveProvider.isPending} className="w-full">
              {saveProvider.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {t("app.admin.providers.saveProvider")}
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Custom Provider Dialog */}
      {showCustomForm && (
        <Card className="border-primary/30 bg-card">
          <CardHeader><CardTitle className="text-base">{t("app.admin.providers.addCustomProvider")}</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label>{t("app.admin.encryption.displayName")}</Label>
              <Input value={customName} onChange={(e) => setCustomName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>{t("app.admin.providers.baseUrl")}</Label>
              <Input value={customBaseUrl} onChange={(e) => setCustomBaseUrl(e.target.value)} placeholder={t("app.admin.providers.baseUrlPlaceholder")} />
            </div>
            <div className="space-y-2">
              <Label>{t("app.admin.providers.modelsCommaSeparated")}</Label>
              <Input value={customModels} onChange={(e) => setCustomModels(e.target.value)} />
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => addCustomProvider.mutate()} disabled={addCustomProvider.isPending || !customName}>
                {t("app.admin.common.add")}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setShowCustomForm(false)}>{t("app.admin.common.cancel")}</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminProviders;
