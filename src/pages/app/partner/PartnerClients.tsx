import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { es as esLocale, enUS } from "date-fns/locale";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Building2, Plus, Users, Copy, AlertTriangle, Check, Inbox } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Seo from "@/components/Seo";
import { useLanguage } from "@/context/LanguageContext";
import {
  usePartnerData,
  useCreateSubAccount,
  type NewSubAccountResult,
} from "@/hooks/usePartnerData";

const SECTORS = [
  { value: "fintech", label: "Fintech" },
  { value: "legaltech", label: "Legaltech" },
  { value: "healthtech", label: "Healthtech" },
  { value: "banca", label: "Banca" },
  { value: "seguros", label: "Seguros" },
  { value: "rrhh", label: "RRHH" },
  { value: "otro", label: "Otro" },
];

const PROVIDERS: Record<string, { value: string; label: string }[]> = {
  openai: [
    { value: "gpt-4o", label: "gpt-4o" },
    { value: "gpt-4o-mini", label: "gpt-4o-mini" },
  ],
  anthropic: [
    { value: "claude-sonnet-4-6", label: "claude-sonnet-4-6" },
    { value: "claude-haiku-4-5", label: "claude-haiku-4-5" },
  ],
  azure_openai: [
    { value: "gpt-4o", label: "gpt-4o" },
    { value: "gpt-4o-mini", label: "gpt-4o-mini" },
  ],
  mistral: [
    { value: "mistral-large-latest", label: "mistral-large-latest" },
    { value: "mistral-small-latest", label: "mistral-small-latest" },
  ],
};

const PROVIDER_LABELS: Record<string, string> = {
  openai: "OpenAI",
  anthropic: "Anthropic",
  azure_openai: "Azure OpenAI",
  mistral: "Mistral",
};

const PartnerClients = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t, lang } = useLanguage();
  const { data, isLoading, isError, error } = usePartnerData();
  const createMutation = useCreateSubAccount();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ name: "", sector: "", llm_provider: "", llm_model: "" });
  const [formError, setFormError] = useState<string | null>(null);
  const [created, setCreated] = useState<NewSubAccountResult | null>(null);
  const [copied, setCopied] = useState(false);

  const models = form.llm_provider ? PROVIDERS[form.llm_provider] ?? [] : [];

  const usage = data?.billing;
  const pct = useMemo(() => {
    if (!usage || !usage.requests_limit) return 0;
    return Math.min(100, (usage.requests_used / usage.requests_limit) * 100);
  }, [usage]);
  const usageTone = pct >= 100 ? "danger" : pct >= 80 ? "warn" : "ok";

  if (isLoading) {
    return <div className="p-8 text-muted-foreground">{t("app.partner.loading")}</div>;
  }

  if (isError) {
    return (
      <div className="p-6">
        <Seo title="Mis clientes — Privaro Partners" description="Gestiona los clientes finales de tu integración partner con Privaro." path="/app/partner/clients" noindex />
        <Card className="p-8 text-center space-y-3">
          <AlertTriangle className="h-10 w-10 text-destructive mx-auto" />
          <h1 className="text-xl font-semibold">{t("app.partner.error.title")}</h1>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            {t("app.partner.error.description")}
          </p>
          <p className="text-xs text-muted-foreground">
            {error?.message ? `${t("app.partner.error.detail")}: ${error.message}` : null}
          </p>
          <Button variant="outline" onClick={() => navigate("/app")}>{t("app.partner.backToDashboard")}</Button>
        </Card>
      </div>
    );
  }

  // Not a partner org — show friendly empty state
  if (!data) {
    return (
      <div className="p-6">
        <Seo title="Mis clientes — Privaro Partners" description="Gestiona los clientes finales de tu integración partner con Privaro." path="/app/partner/clients" noindex />
        <Card className="p-8 text-center space-y-3">
          <Building2 className="h-10 w-10 text-muted-foreground mx-auto" />
          <h1 className="text-xl font-semibold">{t("app.partner.notPartner.title")}</h1>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            {t("app.partner.notPartner.description")}
          </p>
          <Button variant="outline" onClick={() => navigate("/app")}>{t("app.partner.backToDashboard")}</Button>
        </Card>
      </div>
    );
  }

  const resetForm = () => {
    setForm({ name: "", sector: "", llm_provider: "", llm_model: "" });
    setFormError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!form.name.trim() || !form.sector || !form.llm_provider || !form.llm_model) {
      setFormError(t("app.partner.form.errorRequired"));
      return;
    }
    try {
      const result = await createMutation.mutateAsync({
        name: form.name.trim(),
        sector: form.sector,
        llm_provider: form.llm_provider,
        llm_model: form.llm_model,
      });
      setDialogOpen(false);
      resetForm();
      setCreated(result);
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : t("app.partner.form.errorCreate"));
    }
  };

  const copyKey = async () => {
    if (!created?.api_key) return;
    await navigator.clipboard.writeText(created.api_key);
    setCopied(true);
    toast({ title: t("app.partner.toast.copiedTitle"), description: t("app.partner.toast.copiedDescription") });
    setTimeout(() => setCopied(false), 2000);
  };

  const barColor =
    usageTone === "danger" ? "[&>div]:bg-destructive"
    : usageTone === "warn" ? "[&>div]:bg-amber-500"
    : "[&>div]:bg-primary";

  return (
    <div className="p-6 space-y-6">
      <Seo title="Mis clientes — Privaro Partners" description="Gestiona los clientes finales de tu integración partner con Privaro." path="/app/partner/clients" noindex />

      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <Building2 className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">{t("app.partner.title")}</h1>
          <Badge variant="outline">{data.sub_accounts.length}</Badge>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          {t("app.partner.label")}: <span className="text-foreground font-medium">{data.partner.name}</span>
        </p>
      </div>

      {/* Usage card */}
      <Card className="p-5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Badge className="uppercase">{usage!.plan}</Badge>
            <Badge variant="outline" className="capitalize">
              {t("app.partner.usage.phase")}: {usage!.discount_phase.replace("_", " ")}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {t("app.partner.usage.cycleSince")} {new Date(usage!.billing_cycle_start).toLocaleDateString()}
            </span>
          </div>
          <span className="text-sm font-medium">
            {usage!.requests_used.toLocaleString()} / {usage!.requests_limit.toLocaleString()} {t("app.partner.usage.requestsThisCycle")}
          </span>
        </div>
        <Progress value={pct} className={barColor} />
        {usageTone !== "ok" && (
          <p className={usageTone === "danger" ? "text-xs text-destructive" : "text-xs text-amber-500"}>
            {usageTone === "danger"
              ? t("app.partner.usage.overLimit")
              : t("app.partner.usage.nearLimit")}
          </p>
        )}
      </Card>

      {/* Clients table */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">{t("app.partner.finalClients")}</h2>
        </div>
        <Button onClick={() => { resetForm(); setDialogOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" /> {t("app.partner.addClient")}
        </Button>
      </div>

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border">
              <TableHead>{t("app.partner.table.name")}</TableHead>
              <TableHead>Consumo este mes</TableHead>
              <TableHead>{t("app.partner.table.createdAt")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.sub_accounts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-16">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Inbox className="h-10 w-10" />
                    <p className="font-medium text-foreground">{t("app.partner.empty.title")}</p>
                    <p className="text-xs">{t("app.partner.empty.description")}</p>
                    <Button size="sm" className="mt-2" onClick={() => { resetForm(); setDialogOpen(true); }}>
                      <Plus className="h-4 w-4 mr-2" /> {t("app.partner.addClient")}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              data.sub_accounts.map((s) => (
                <TableRow key={s.id} className="border-border">
                  <TableCell className="font-semibold">{s.name}</TableCell>
                  <TableCell className="text-sm tabular-nums">{(s.requests_used_this_month ?? 0).toLocaleString()}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {formatDistanceToNow(new Date(s.created_at), { addSuffix: true, locale: lang === "es" ? esLocale : enUS })}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Create dialog */}
      <Dialog open={dialogOpen} onOpenChange={(o) => { if (!createMutation.isPending) { setDialogOpen(o); if (!o) resetForm(); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("app.partner.addClient")}</DialogTitle>
            <DialogDescription>
              {t("app.partner.dialog.description")}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="client-name">{t("app.partner.form.clientName")}</Label>
              <Input id="client-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder={t("app.partner.form.clientNamePlaceholder")} maxLength={120} required />
            </div>
            <div className="space-y-2">
              <Label>{t("app.partner.form.sector")}</Label>
              <Select value={form.sector} onValueChange={(v) => setForm({ ...form, sector: v })}>
                <SelectTrigger><SelectValue placeholder={t("app.partner.form.selectSector")} /></SelectTrigger>
                <SelectContent>
                  {SECTORS.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>{t("app.partner.form.llmProvider")}</Label>
                <Select
                  value={form.llm_provider}
                  onValueChange={(v) => setForm({ ...form, llm_provider: v, llm_model: "" })}
                >
                  <SelectTrigger><SelectValue placeholder={t("app.partner.form.provider")} /></SelectTrigger>
                  <SelectContent>
                    {Object.keys(PROVIDERS).map((p) => (
                      <SelectItem key={p} value={p}>{PROVIDER_LABELS[p]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t("app.partner.form.model")}</Label>
                <Select value={form.llm_model} onValueChange={(v) => setForm({ ...form, llm_model: v })} disabled={!form.llm_provider}>
                  <SelectTrigger><SelectValue placeholder={form.llm_provider ? t("app.partner.form.model") : t("app.partner.form.chooseProviderFirst")} /></SelectTrigger>
                  <SelectContent>
                    {models.map((m) => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {formError && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} disabled={createMutation.isPending}>
                {t("app.partner.form.cancel")}
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? t("app.partner.form.creating") : t("app.partner.form.createClient")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* API key modal */}
      <Dialog open={!!created} onOpenChange={() => { /* require explicit confirmation */ }}>
        <DialogContent onInteractOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>{t("app.partner.created.title")}</DialogTitle>
            <DialogDescription>
              {t("app.partner.created.description")}
            </DialogDescription>
          </DialogHeader>

          <Alert className="border-amber-500/40 bg-amber-500/10 text-amber-100">
            <AlertTriangle className="h-4 w-4 text-amber-400" />
            <AlertTitle className="text-amber-300">{t("app.partner.created.warningTitle")}</AlertTitle>
            <AlertDescription className="text-amber-100/90">
              {t("app.partner.created.warningDescription")}
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label>{t("app.partner.created.apiKey")}</Label>
            <div className="flex gap-2">
              <Input readOnly value={created?.api_key ?? ""} className="font-mono text-xs" />
              <Button type="button" variant="outline" onClick={copyKey}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {created?.warning && (
            <p className="text-xs text-muted-foreground">{created.warning}</p>
          )}

          <DialogFooter>
            <Button
              onClick={() => { setCreated(null); setCopied(false); }}
            >
              {t("app.partner.created.confirmSaved")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PartnerClients;
