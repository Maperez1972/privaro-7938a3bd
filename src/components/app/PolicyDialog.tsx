import { useState, useEffect } from "react";
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
import { Loader2 } from "lucide-react";

export interface PolicyFormData {
  entity_type: string;
  category: string;
  action: string;
  regulation_ref: string;
  priority: number;
  custom_pattern: string;
}

export const SECTOR_PRESETS: Record<string, Omit<PolicyFormData, "custom_pattern">[]> = {
  legal: [
    { entity_type: "full_name", category: "personal", action: "tokenise", regulation_ref: "GDPR Art.5", priority: 10 },
    { entity_type: "dni", category: "personal", action: "tokenise", regulation_ref: "GDPR Art.9", priority: 5 },
    { entity_type: "iban", category: "financial", action: "tokenise", regulation_ref: "PSD2", priority: 5 },
    { entity_type: "email", category: "personal", action: "pseudonymise", regulation_ref: "GDPR Art.5", priority: 15 },
    { entity_type: "phone", category: "personal", action: "pseudonymise", regulation_ref: "GDPR Art.5", priority: 15 },
    { entity_type: "address", category: "personal", action: "anonymise", regulation_ref: "GDPR Art.5", priority: 20 },
  ],
  healthcare: [
    { entity_type: "full_name", category: "personal", action: "tokenise", regulation_ref: "HIPAA §164.502", priority: 5 },
    { entity_type: "medical_record", category: "special", action: "block", regulation_ref: "GDPR Art.9", priority: 1 },
    { entity_type: "diagnosis", category: "special", action: "anonymise", regulation_ref: "GDPR Art.9", priority: 3 },
    { entity_type: "ssn", category: "personal", action: "tokenise", regulation_ref: "HIPAA", priority: 5 },
    { entity_type: "email", category: "personal", action: "pseudonymise", regulation_ref: "GDPR Art.5", priority: 15 },
  ],
  fintech: [
    { entity_type: "iban", category: "financial", action: "tokenise", regulation_ref: "PSD2 Art.94", priority: 1 },
    { entity_type: "credit_card", category: "financial", action: "tokenise", regulation_ref: "PCI-DSS", priority: 1 },
    { entity_type: "full_name", category: "personal", action: "pseudonymise", regulation_ref: "GDPR Art.5", priority: 10 },
    { entity_type: "dni", category: "personal", action: "tokenise", regulation_ref: "AML Directive", priority: 5 },
    { entity_type: "email", category: "personal", action: "pseudonymise", regulation_ref: "GDPR Art.5", priority: 15 },
    { entity_type: "phone", category: "personal", action: "pseudonymise", regulation_ref: "GDPR Art.5", priority: 15 },
  ],
};

const ENTITY_TYPES = ["full_name", "email", "phone", "dni", "ssn", "iban", "credit_card", "address", "medical_record", "diagnosis", "ip_address", "custom"];
const CATEGORIES = ["personal", "financial", "special", "business"];
const ACTIONS = ["tokenise", "pseudonymise", "anonymise", "block"];

interface PolicyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: PolicyFormData) => void;
  loading?: boolean;
  initialData?: PolicyFormData | null;
}

const PolicyDialog = ({ open, onOpenChange, onSubmit, loading, initialData }: PolicyDialogProps) => {
  const [form, setForm] = useState<PolicyFormData>({
    entity_type: "full_name",
    category: "personal",
    action: "tokenise",
    regulation_ref: "",
    priority: 10,
    custom_pattern: "",
  });

  useEffect(() => {
    if (initialData) {
      setForm(initialData);
    } else {
      setForm({
        entity_type: "full_name",
        category: "personal",
        action: "tokenise",
        regulation_ref: "",
        priority: 10,
        custom_pattern: "",
      });
    }
  }, [initialData, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Rule" : "New Rule"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label>Entity Type</Label>
            <Select value={form.entity_type} onValueChange={(v) => setForm({ ...form, entity_type: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {ENTITY_TYPES.map((e) => (
                  <SelectItem key={e} value={e}>{e}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Action</Label>
            <Select value={form.action} onValueChange={(v) => setForm({ ...form, action: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {ACTIONS.map((a) => (
                  <SelectItem key={a} value={a}>{a.charAt(0).toUpperCase() + a.slice(1)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Regulation Reference</Label>
            <Input value={form.regulation_ref} onChange={(e) => setForm({ ...form, regulation_ref: e.target.value })} placeholder="e.g. GDPR Art.5" />
          </div>
          <div className="space-y-2">
            <Label>Priority</Label>
            <Input type="number" value={form.priority} onChange={(e) => setForm({ ...form, priority: parseInt(e.target.value) || 10 })} />
          </div>
          {form.entity_type === "custom" && (
            <div className="space-y-2">
              <Label>Custom Pattern (regex)</Label>
              <Input value={form.custom_pattern} onChange={(e) => setForm({ ...form, custom_pattern: e.target.value })} placeholder="\\b\\d{3}-\\d{2}-\\d{4}\\b" />
            </div>
          )}
        </div>
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => onSubmit(form)} disabled={loading || !form.entity_type}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            {initialData ? "Save" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PolicyDialog;
