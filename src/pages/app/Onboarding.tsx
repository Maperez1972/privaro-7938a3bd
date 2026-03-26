import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Rocket, ArrowRight, Check, Copy, Loader2, Play, ShieldCheck, Zap, Code2 } from "lucide-react";
import type { Preset } from "@/components/app/PolicyPresetPanel";

const SECTORS = ["legal", "healthcare", "fintech", "hr", "general"];

const Onboarding = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  // Step 2 — Presets
  const [presets, setPresets] = useState<Preset[]>([]);
  const [presetsLoading, setPresetsLoading] = useState(true);
  const [hasRules, setHasRules] = useState(false);
  const [confirmPreset, setConfirmPreset] = useState<Preset | null>(null);
  const [applyingPreset, setApplyingPreset] = useState(false);

  // Step 3 — Pipeline
  const [pipelineName, setPipelineName] = useState("");
  const [pipelineSector, setPipelineSector] = useState("general");
  const [pipelineProvider, setPipelineProvider] = useState("");
  const [pipelineModel, setPipelineModel] = useState("");
  const [providers, setProviders] = useState<{ provider: string; display_name: string }[]>([]);
  const [existingPipeline, setExistingPipeline] = useState<{ id: string; name: string } | null>(null);
  const [creatingPipeline, setCreatingPipeline] = useState(false);

  // Step 4 — Integration
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const orgId = profile?.org_id;

  // Load presets + check existing rules
  useEffect(() => {
    (supabase as any)
      .from("policy_presets")
      .select("id, name, slug, description, sector, icon, color, rules")
      .order("name")
      .then(({ data }: { data: Preset[] | null }) => {
        setPresets(data ?? []);
        setPresetsLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!orgId) return;
    supabase
      .from("policy_rules")
      .select("id", { count: "exact", head: true })
      .eq("org_id", orgId)
      .then(({ count }) => setHasRules((count ?? 0) > 0));
  }, [orgId]);

  // Load providers + existing pipeline
  useEffect(() => {
    if (!orgId) return;
    (supabase as any)
      .from("llm_providers")
      .select("provider, display_name")
      .eq("org_id", orgId)
      .eq("is_active", true)
      .then(({ data }: { data: any[] | null }) => setProviders(data ?? []));

    supabase
      .from("pipelines")
      .select("id, name")
      .eq("org_id", orgId)
      .eq("status", "active")
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setExistingPipeline(data);
      });
  }, [orgId]);

  // Load API key
  useEffect(() => {
    if (!orgId) return;
    (supabase as any)
      .from("api_keys")
      .select("key_prefix")
      .eq("org_id", orgId)
      .eq("is_active", true)
      .limit(1)
      .maybeSingle()
      .then(({ data }: { data: any }) => {
        if (data) setApiKey(data.key_prefix);
      });
  }, [orgId]);

  const pipelineId = existingPipeline?.id ?? "<pipeline-id>";
  const keyDisplay = apiKey ? `${apiKey}...` : "prvr_xxxxxxxx";

  const handleApplyPreset = async () => {
    if (!confirmPreset || !orgId || !profile) return;
    setApplyingPreset(true);

    await supabase.from("policy_rules").delete().eq("org_id", orgId);

    const rules = Array.isArray(confirmPreset.rules) ? confirmPreset.rules : [];
    const rows = rules.map((r) => ({
      org_id: orgId,
      entity_type: r.entity_type,
      category: r.category,
      action: r.action,
      regulation_ref: r.regulation_ref || null,
      priority: r.priority,
      custom_pattern: r.custom_pattern || null,
      is_enabled: true,
      updated_by: profile.id,
    }));

    const { error } = await supabase.from("policy_rules").insert(rows);
    setApplyingPreset(false);
    setConfirmPreset(null);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      localStorage.setItem("privaro-lastPreset", confirmPreset.slug);
      setHasRules(true);
      toast({ title: `${confirmPreset.name} applied`, description: `${rules.length} rules configured` });
    }
  };

  const handleCreatePipeline = async () => {
    if (!orgId || !pipelineName.trim()) return;
    setCreatingPipeline(true);

    const { data, error } = await supabase
      .from("pipelines")
      .insert({
        org_id: orgId,
        name: pipelineName.trim(),
        sector: pipelineSector,
        llm_provider: pipelineProvider || "openai",
        llm_model: pipelineModel || "gpt-4o",
      })
      .select("id, name")
      .single();

    setCreatingPipeline(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setExistingPipeline(data);
      toast({ title: "Pipeline created" });
    }
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const { proxyDetect } = await import("@/lib/proxy-client");
      const detections = await proxyDetect("Test PII: DNI 34521789X, email test@example.com", existingPipeline?.id);
      setTestResult(JSON.stringify(detections, null, 2));
    } catch (e: any) {
      setTestResult(`Error: ${e.message}`);
    }
    setTesting(false);
  };

  const handleFinish = () => {
    localStorage.setItem("privaro-onboarding-done", "true");
    navigate("/app/dashboard");
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  const pythonCode = `import requests

response = requests.post(
    "https://privaro-proxy-production.up.railway.app/v1/proxy/protect",
    headers={
        "X-Privaro-Key": "${keyDisplay}",
        "Content-Type": "application/json",
    },
    json={
        "pipeline_id": "${pipelineId}",
        "prompt": "User DNI is 34521789X and email john@acme.com",
        "options": {"mode": "tokenise", "include_detections": True},
    },
)

print(response.json())`;

  const jsCode = `const response = await fetch(
  "https://privaro-proxy-production.up.railway.app/v1/proxy/protect",
  {
    method: "POST",
    headers: {
      "X-Privaro-Key": "${keyDisplay}",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      pipeline_id: "${pipelineId}",
      prompt: "User DNI is 34521789X and email john@acme.com",
      options: { mode: "tokenise", include_detections: true },
    }),
  }
);

const data = await response.json();
console.log(data);`;

  const curlCode = `curl -X POST https://privaro-proxy-production.up.railway.app/v1/proxy/protect \\
  -H "X-Privaro-Key: ${keyDisplay}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "pipeline_id": "${pipelineId}",
    "prompt": "Test PII: DNI 34521789X",
    "options": {"mode": "tokenise"}
  }'`;

  const steps = [
    { label: "Welcome", icon: Rocket },
    { label: "Policies", icon: ShieldCheck },
    { label: "Pipeline", icon: Zap },
    { label: "Integrate", icon: Code2 },
  ];

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      {/* Progress */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          {steps.map((s, i) => {
            const Icon = s.icon;
            const done = i < step;
            const active = i === step;
            return (
              <div key={i} className="flex items-center gap-2">
                {i > 0 && <div className={`w-8 h-px ${done ? "bg-primary" : "bg-border"}`} />}
                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${active ? "bg-primary/15 text-primary" : done ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                  {done ? <Check className="w-3 h-3" /> : <Icon className="w-3 h-3" />}
                  <span className="hidden sm:inline">{s.label}</span>
                </div>
              </div>
            );
          })}
        </div>
        <Progress value={((step + 1) / steps.length) * 100} className="h-1" />
      </div>

      {/* Step 0 — Welcome */}
      {step === 0 && (
        <Card className="border-border bg-card">
          <CardContent className="p-8 text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-primary/15 flex items-center justify-center mx-auto">
              <Rocket className="w-8 h-8 text-primary" />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight">Welcome to Privaro</h1>
              <p className="text-lg text-primary font-medium">Privacy Infrastructure for Enterprise AI</p>
            </div>
            <p className="text-muted-foreground max-w-md mx-auto">
              Let's get your organization set up in 4 steps. Your AI interactions will be protected, tokenized, and blockchain-certified in under 5 minutes.
            </p>
            <Button size="lg" onClick={() => setStep(1)} className="gap-2">
              Get Started <ArrowRight className="w-4 h-4" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 1 — Policies */}
      {step === 1 && (
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-bold">Choose your industry preset</h2>
            <p className="text-sm text-muted-foreground mt-1">Apply a pre-configured policy set for your industry vertical</p>
          </div>

          {hasRules && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/10 border border-primary/20">
              <Check className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Already configured — you can continue or apply a different preset</span>
            </div>
          )}

          {presetsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="border-border"><CardContent className="p-4 space-y-2"><Skeleton className="h-5 w-32" /><Skeleton className="h-8 w-full" /><Skeleton className="h-4 w-24" /></CardContent></Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {presets.map((preset) => {
                const rules = Array.isArray(preset.rules) ? preset.rules : [];
                return (
                  <Card key={preset.slug} className="border-border bg-card hover:border-primary/30 transition-colors">
                    <CardContent className="p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{preset.icon}</span>
                          <span className="font-semibold text-sm">{preset.name}</span>
                        </div>
                        <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setConfirmPreset(preset)}>Apply</Button>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">{preset.description}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{rules.length} rules</span><span>·</span><span>{preset.sector}</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {rules.slice(0, 4).map((r) => (
                          <Badge key={r.entity_type} variant="secondary" className="text-[10px] px-1.5 py-0 font-mono">{r.entity_type}</Badge>
                        ))}
                        {rules.length > 4 && <Badge variant="secondary" className="text-[10px] px-1.5 py-0">+{rules.length - 4}</Badge>}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          <div className="flex justify-end">
            <Button onClick={() => setStep(2)} className="gap-2">
              {hasRules ? "Continue" : "Skip"} <ArrowRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Confirm preset dialog */}
          <AlertDialog open={!!confirmPreset} onOpenChange={(o) => !o && setConfirmPreset(null)}>
            <AlertDialogContent className="bg-card border-border">
              <AlertDialogHeader>
                <AlertDialogTitle>Apply {confirmPreset?.icon} {confirmPreset?.name}?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will replace all current policy rules with {Array.isArray(confirmPreset?.rules) ? confirmPreset!.rules.length : 0} rules. This cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={applyingPreset}>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleApplyPreset} disabled={applyingPreset}>
                  {applyingPreset && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
                  Apply Preset
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}

      {/* Step 2 — Pipeline */}
      {step === 2 && (
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-bold">Create your first AI pipeline</h2>
            <p className="text-sm text-muted-foreground mt-1">Connect Privaro to your LLM provider</p>
          </div>

          {existingPipeline ? (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/10 border border-primary/20">
              <Check className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Pipeline active: {existingPipeline.name}</span>
            </div>
          ) : (
            <Card className="border-border bg-card">
              <CardContent className="p-5 space-y-4">
                <div className="space-y-2">
                  <Label>Pipeline Name</Label>
                  <Input placeholder="My first pipeline" value={pipelineName} onChange={(e) => setPipelineName(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Sector</Label>
                    <Select value={pipelineSector} onValueChange={setPipelineSector}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {SECTORS.map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>LLM Provider</Label>
                    <Select value={pipelineProvider} onValueChange={setPipelineProvider}>
                      <SelectTrigger><SelectValue placeholder="Select provider" /></SelectTrigger>
                      <SelectContent>
                        {providers.length > 0 ? providers.map((p) => (
                          <SelectItem key={p.provider} value={p.provider}>{p.display_name || p.provider}</SelectItem>
                        )) : (
                          <SelectItem value="openai">OpenAI (default)</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>LLM Model</Label>
                  <Input placeholder="gpt-4o" value={pipelineModel} onChange={(e) => setPipelineModel(e.target.value)} />
                </div>
                <Button onClick={handleCreatePipeline} disabled={creatingPipeline || !pipelineName.trim()} className="w-full gap-2">
                  {creatingPipeline && <Loader2 className="w-4 h-4 animate-spin" />}
                  Create Pipeline
                </Button>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-between">
            <Button variant="ghost" onClick={() => setStep(1)}>Back</Button>
            <Button onClick={() => setStep(3)} className="gap-2">
              {existingPipeline ? "Continue" : "Skip"} <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 3 — Integration */}
      {step === 3 && (
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-bold">Integrate Privaro in your app</h2>
            <p className="text-sm text-muted-foreground mt-1">Use these code snippets to start protecting PII in your AI calls</p>
          </div>

          {apiKey && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary border border-border">
              <span className="text-xs text-muted-foreground">API Key:</span>
              <code className="text-xs font-mono text-foreground">{keyDisplay}</code>
            </div>
          )}

          <Tabs defaultValue="python">
            <TabsList>
              <TabsTrigger value="python">Python</TabsTrigger>
              <TabsTrigger value="javascript">JavaScript</TabsTrigger>
              <TabsTrigger value="curl">cURL</TabsTrigger>
            </TabsList>
            {[
              { value: "python", code: pythonCode },
              { value: "javascript", code: jsCode },
              { value: "curl", code: curlCode },
            ].map(({ value, code }) => (
              <TabsContent key={value} value={value}>
                <div className="relative">
                  <pre className="bg-secondary border border-border rounded-lg p-4 text-xs font-mono overflow-x-auto text-foreground whitespace-pre">{code}</pre>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="absolute top-2 right-2 h-7 gap-1 text-xs"
                    onClick={() => copyToClipboard(code, value)}
                  >
                    {copied === value ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copied === value ? "Copied" : "Copy"}
                  </Button>
                </div>
              </TabsContent>
            ))}
          </Tabs>

          <Card className="border-border bg-card">
            <CardContent className="p-4 space-y-3">
              <h3 className="text-sm font-semibold">Test Integration</h3>
              <p className="text-xs text-muted-foreground">Send a test request to verify your setup is working</p>
              <Button size="sm" onClick={handleTest} disabled={testing} className="gap-2">
                {testing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                Test Integration
              </Button>
              {testResult && (
                <pre className="bg-secondary border border-border rounded-lg p-3 text-xs font-mono overflow-x-auto text-foreground whitespace-pre max-h-48">{testResult}</pre>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-between items-center">
            <Button variant="ghost" onClick={() => setStep(2)}>Back</Button>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  localStorage.setItem("privaro-onboarding-done", "true");
                  navigate("/app/chat");
                }}
                className="text-muted-foreground"
              >
                Don't show again
              </Button>
              <Button onClick={handleFinish} size="lg" className="gap-2">
                Go to Dashboard <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Onboarding;
