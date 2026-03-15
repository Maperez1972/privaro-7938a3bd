import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TechBriefDialogProps { open: boolean; onClose: () => void; }

const TechBriefDialog = ({ open, onClose }: TechBriefDialogProps) => {
  const { t } = useLanguage();
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [role, setRole] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSending(true);
    setError("");
    const form = e.currentTarget;
    const formData = new FormData(form);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("send-techbrief-request", {
        body: { name: formData.get("name"), company: formData.get("company"), industry: formData.get("industry"), role, email: formData.get("email"), concern: formData.get("concern") },
      });
      if (fnError) throw fnError;
      if (data && !data.success) throw new Error(data.error);
      setSubmitted(true);
    } catch (err) {
      console.error("Error sending tech brief request:", err);
      setError(t("techbrief.dialog.error"));
    } finally {
      setSending(false);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) { onClose(); setTimeout(() => { setSubmitted(false); setError(""); setRole(""); }, 300); }
  };

  const textFields = [
    { name: "name", labelKey: "beta.form.name", type: "text" },
    { name: "company", labelKey: "beta.form.company", type: "text" },
    { name: "industry", labelKey: "beta.form.industry", type: "text" },
  ];
  const roleOptions = ["beta.form.role.ciso", "beta.form.role.cto", "beta.form.role.dpo", "beta.form.role.legal", "beta.form.role.other"];

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto bg-card border-border">
        {submitted ? (
          <div className="text-center py-8"><h3 className="text-2xl font-bold mb-3 text-foreground">{t("beta.thanks.title")}</h3><p className="text-muted-foreground">{t("techbrief.dialog.thanks")}</p></div>
        ) : (
          <>
            <DialogHeader><DialogTitle className="text-xl font-semibold text-foreground">{t("techbrief.dialog.title")}</DialogTitle><DialogDescription className="text-sm text-muted-foreground">{t("techbrief.dialog.subtitle")}</DialogDescription></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-5">
              {textFields.map((field) => (<div key={field.name}><label className="block text-sm text-muted-foreground mb-1.5">{t(field.labelKey)}</label><input name={field.name} type={field.type} required className="w-full px-4 py-2.5 rounded-md bg-surface border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow" /></div>))}
              <div><label className="block text-sm text-muted-foreground mb-1.5">{t("beta.form.role")}</label><Select required value={role} onValueChange={setRole}><SelectTrigger className="w-full bg-surface border-border text-foreground"><SelectValue placeholder={t("beta.form.role")} /></SelectTrigger><SelectContent className="z-[200]">{roleOptions.map((key) => (<SelectItem key={key} value={t(key)}>{t(key)}</SelectItem>))}</SelectContent></Select></div>
              <div><label className="block text-sm text-muted-foreground mb-1.5">{t("beta.form.email")}</label><input name="email" type="email" required className="w-full px-4 py-2.5 rounded-md bg-surface border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow" /></div>
              <div><label className="block text-sm text-muted-foreground mb-1.5">{t("beta.form.aiQuestion")}</label><textarea name="concern" rows={3} className="w-full px-4 py-2.5 rounded-md bg-surface border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow resize-none" /></div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <button type="submit" disabled={sending} className="w-full py-3 rounded-md bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity disabled:opacity-50">{sending ? t("techbrief.dialog.sending") : t("techbrief.dialog.submit")}</button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TechBriefDialog;
