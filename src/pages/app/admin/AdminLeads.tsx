import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Users, Mail, Eye, Inbox, Copy } from "lucide-react";
import { PaginationControls, paginate } from "@/components/app/PaginationControls";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { useLanguage } from "@/context/LanguageContext";

type Lead = {
  id: string;
  name: string;
  email: string;
  company: string | null;
  industry: string | null;
  role: string | null;
  concern: string | null;
  company_size: string | null;
  source: string | null;
  created_at: string;
};

const roleBadgeClass = (role: string | null) => {
  const r = (role || "").toLowerCase();
  if (r.includes("ciso")) return "bg-red-500/15 text-red-400 border-red-500/30";
  if (r.includes("cto")) return "bg-blue-500/15 text-blue-400 border-blue-500/30";
  if (r.includes("dpo")) return "bg-purple-500/15 text-purple-400 border-purple-500/30";
  if (r.includes("legal") || r.includes("compliance")) return "bg-yellow-500/15 text-yellow-400 border-yellow-500/30";
  return "bg-muted text-muted-foreground border-border";
};

const sourceMeta = (src: string | null, t: (k: string) => string) => {
  if (src === "risk_assessment") return { label: t("app.admin.leads.aiRiskAssessment"), cls: "bg-amber-500/15 text-amber-400 border-amber-500/30" };
  if (src === "beta") return { label: t("app.admin.leads.beta"), cls: "bg-green-500/15 text-green-400 border-green-500/30" };
  return { label: src || "—", cls: "bg-muted text-muted-foreground border-border" };
};

const formatExact = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleString(undefined, { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: false });
};

const AdminLeads = () => {
  useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const [selected, setSelected] = useState<Lead | null>(null);

  useEffect(() => {
    (supabase.from("demo_requests" as any).select("*").order("created_at", { ascending: false }) as any)
      .then(({ data, error }: any) => {
        if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
        setLeads((data as Lead[]) || []);
        setLoading(false);
      });
  }, [toast]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return leads.filter((l) => {
      if (sourceFilter !== "all" && l.source !== sourceFilter) return false;
      if (!q) return true;
      return (
        l.name?.toLowerCase().includes(q) ||
        l.email?.toLowerCase().includes(q) ||
        (l.company || "").toLowerCase().includes(q)
      );
    });
  }, [leads, search, sourceFilter]);

  const copyEmail = async (email: string) => {
    await navigator.clipboard.writeText(email);
    toast({ title: t("app.admin.leads.copied"), description: email });
  };

  if (loading) return <div className="p-8 text-muted-foreground">{t("app.admin.leads.loading")}</div>;

  const { paged } = paginate(filtered, page, pageSize);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Users className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">{t("app.admin.leads.title")}</h1>
            <Badge variant="outline">{leads.length}</Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">{t("app.admin.leads.subtitle")}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder={t("app.admin.leads.searchPlaceholder")}
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          className="max-w-xs"
        />
        <Select value={sourceFilter} onValueChange={(v) => { setSourceFilter(v); setPage(0); }}>
          <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("app.admin.leads.allSources")}</SelectItem>
            <SelectItem value="risk_assessment">{t("app.admin.leads.aiRiskAssessment")}</SelectItem>
            <SelectItem value="beta">{t("app.admin.leads.beta")}</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground ml-auto">{filtered.length} {t("app.admin.leads.leadsCount")}</span>
      </div>

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border">
              <TableHead>{t("app.admin.leads.date")}</TableHead>
              <TableHead>{t("app.admin.apiKeys.name")}</TableHead>
              <TableHead>{t("app.admin.leads.company")}</TableHead>
              <TableHead>{t("app.admin.leads.role")}</TableHead>
              <TableHead>{t("app.admin.leads.source")}</TableHead>
              <TableHead>{t("app.admin.leads.companySize")}</TableHead>
              <TableHead className="text-right">{t("app.admin.common.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-16">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Inbox className="h-10 w-10" />
                    <p className="font-medium text-foreground">{t("app.admin.leads.noLeads")}</p>
                    <p className="text-xs">{t("app.admin.leads.noLeadsDesc")}</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : paged.map((l) => {
              const sm = sourceMeta(l.source, t);
              return (
                <TableRow key={l.id} className="border-border">
                  <TableCell className="text-muted-foreground text-sm">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span>{formatDistanceToNow(new Date(l.created_at), { addSuffix: true })}</span>
                      </TooltipTrigger>
                      <TooltipContent>{formatExact(l.created_at)}</TooltipContent>
                    </Tooltip>
                  </TableCell>
                  <TableCell className="font-semibold">{l.name}</TableCell>
                  <TableCell>{l.company || "—"}</TableCell>
                  <TableCell>
                    {l.role ? <Badge variant="outline" className={roleBadgeClass(l.role)}>{l.role}</Badge> : "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={sm.cls}>{sm.label}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{l.company_size || "—"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button asChild variant="ghost" size="icon" title={t("app.admin.leads.sendEmail")}>
                        <a href={`mailto:${l.email}`}><Mail className="h-4 w-4" /></a>
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setSelected(l)} title={t("app.admin.leads.viewDetails")}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
      <PaginationControls
        page={page}
        totalPages={Math.max(1, Math.ceil(filtered.length / pageSize))}
        totalItems={filtered.length}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />

      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          {selected && (
            <>
              <SheetHeader>
                <SheetTitle>{selected.name}</SheetTitle>
                <SheetDescription>{selected.company || "—"}</SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-4 text-sm">
                {[
                  [t("app.admin.leads.email"), selected.email],
                  [t("app.admin.leads.company"), selected.company],
                  [t("app.admin.leads.industry"), selected.industry],
                  [t("app.admin.leads.role"), selected.role],
                  [t("app.admin.leads.companySize"), selected.company_size],
                  [t("app.admin.leads.source"), sourceMeta(selected.source, t).label],
                  [t("app.admin.leads.date"), formatExact(selected.created_at)],
                ].map(([label, value]) => (
                  <div key={label as string} className="grid grid-cols-3 gap-2">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="col-span-2 break-words">{(value as string) || "—"}</span>
                  </div>
                ))}
                <div>
                  <p className="text-muted-foreground mb-1">{t("app.admin.leads.messageAiTools")}</p>
                  <p className="whitespace-pre-wrap rounded-md border border-border bg-muted/30 p-3 text-foreground">
                    {selected.concern || "—"}
                  </p>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button asChild className="flex-1">
                    <a href={`mailto:${selected.email}`}><Mail className="h-4 w-4 mr-2" />{t("app.admin.leads.sendEmail")}</a>
                  </Button>
                  <Button variant="outline" onClick={() => copyEmail(selected.email)}>
                    <Copy className="h-4 w-4 mr-2" />{t("app.admin.leads.copyEmail")}
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default AdminLeads;
