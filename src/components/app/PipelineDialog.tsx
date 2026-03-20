import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, AlertTriangle } from "lucide-react";

export interface PipelineFormData {
  name: string;
  sector: string;
  llm_provider: string;
  llm_model: string;
  llm_endpoint_url: string;
  policy_set_id: string | null;
}

interface PipelineDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: PipelineFormData) => void;
  loading?: boolean;
  initialData?: PipelineFormData | null;
}

const SECTORS = ["legal", "healthcare", "fintech", "general"];
const PROVIDERS = ["openai", "anthropic", "google", "azure", "deepseek", "custom"];
const MODELS: Record<string, string[]> = {
  openai: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo"],
  anthropic: ["claude-opus-4-5", "claude-sonnet-4-5", "claude-haiku-4-5-20251001"],
  google: ["gemini-1.5-pro", "gemini-1.5-flash", "gemini-2.0-flash"],
  azure: ["gpt-4o", "gpt-4-turbo"],
  deepseek: ["deepseek-chat", "deepseek-reasoner"],
  custom: ["custom-model"],
};

const PipelineDialog = ({ open, onOpenChange, onSubmit, loading, initialData }: PipelineDialogProps) => {
  const [form, setForm] = useState<PipelineFormData>({
    name: "",
    sector: "general",
    llm_provider: "openai",
    llm_model: "gpt-4o",
    llm_endpoint_url: "",
    policy_set_id: null,
  });

  useEffect(() => {
    if (initialData) {
      setForm(initialData);
    } else {
      setForm({
        name: "",
        sector: "general",
        llm_provider: "openai",
        llm_model: "gpt-4o",
        llm_endpoint_url: "",
        policy_set_id: null,
      });
    }
  }, [initialData, open]);

  const availableModels = MODELS[form.llm_provider] ?? ["custom-model"];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Pipeline" : "New Pipeline"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Legal Document Review" />
          </div>
          <div className="space-y-2">
            <Label>Sector</Label>
            <Select value={form.sector} onValueChange={(v) => setForm({ ...form, sector: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {SECTORS.map((s) => (
                  <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>LLM Provider</Label>
            <Select value={form.llm_provider} onValueChange={(v) => setForm({ ...form, llm_provider: v, llm_model: MODELS[v]?.[0] ?? "custom-model" })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {PROVIDERS.map((p) => (
                  <SelectItem key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Model</Label>
            <Select value={form.llm_model} onValueChange={(v) => setForm({ ...form, llm_model: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {availableModels.map((m) => (
                  <SelectItem key={m} value={m}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Endpoint URL (optional)</Label>
            <Input value={form.llm_endpoint_url} onChange={(e) => setForm({ ...form, llm_endpoint_url: e.target.value })} placeholder="https://api.example.com/v1" />
          </div>
        </div>
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => onSubmit(form)} disabled={loading || !form.name}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            {initialData ? "Save" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PipelineDialog;
