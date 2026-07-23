import { useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, ShieldCheck, ArrowUpDown } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import Seo from "@/components/Seo";

type PlatformOrg = {
  id: string;
  name: string;
  org_type: "partner" | "sub_account" | "direct" | string;
  parent_org_id: string | null;
  created_at: string;
  plan: string | null;
  discount_phase: string | null;
  requests_used_this_org: number;
  billing_requests_used_aggregate: number | null;
  requests_limit: number | null;
  billing_cycle_start: string | null;
};

type Overview = { organizations: PlatformOrg[]; count: number };

type SortKey = "name" | "org_type" | "plan" | "requests_used_this_org" | "requests_limit" | "pct";

const typeBadge = (t: string) => {
  if (t === "partner") return "bg-purple-500/15 text-purple-300 border-purple-500/30";
  if (t === "sub_account") return "bg-blue-500/15 text-blue-300 border-blue-500/30";
  return "bg-slate-500/15 text-slate-300 border-slate-500/30";
};

const PlatformAdmin = () => {
  const { session, profile, loading, rolesLoaded } = useAuth();
  const isPlatformAdmin = !!profile?.is_platform_admin;

  const { data, isLoading, isError, error } = useQuery<Overview, Error>({
    queryKey: ["platform-admin-overview"],
    enabled: !!session && isPlatformAdmin,
    queryFn: async () => {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/platform-admin-overview`;
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${session!.access_token}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return (await res.json()) as Overview;
    },
    staleTime: 30_000,
  });

  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("requests_used_this_org");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const orgsById = useMemo(() => {
    const map = new Map<string, PlatformOrg>();
    (data?.organizations ?? []).forEach((o) => map.set(o.id, o));
    return map;
  }, [data]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = (data?.organizations ?? []).filter((o) =>
      !q ? true : o.name?.toLowerCase().includes(q)
    );
    const sorted = [...list].sort((a, b) => {
      const pctA = a.requests_limit ? a.requests_used_this_org / a.requests_limit : 0;
      const pctB = b.requests_limit ? b.requests_used_this_org / b.requests_limit : 0;
      let va: number | string = 0;
      let vb: number | string = 0;
      switch (sortKey) {
        case "name": va = a.name ?? ""; vb = b.name ?? ""; break;
        case "org_type": va = a.org_type ?? ""; vb = b.org_type ?? ""; break;
        case "plan": va = a.plan ?? ""; vb = b.plan ?? ""; break;
        case "requests_used_this_org": va = a.requests_used_this_org; vb = b.requests_used_this_org; break;
        case "requests_limit": va = a.requests_limit ?? 0; vb = b.requests_limit ?? 0; break;
        case "pct": va = pctA; vb = pctB; break;
      }
      if (typeof va === "string" && typeof vb === "string") {
        return sortDir === "asc" ? va.localeCompare(vb) : vb.localeCompare(va);
      }
      return sortDir === "asc" ? Number(va) - Number(vb) : Number(vb) - Number(va);
    });
    return sorted;
  }, [data, query, sortKey, sortDir]);

  if (loading || !rolesLoaded) return null;
  if (!isPlatformAdmin) return <Navigate to="/app" replace />;

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir(key === "name" || key === "org_type" || key === "plan" ? "asc" : "desc"); }
  };

  const SortHead = ({ k, children }: { k: SortKey; children: React.ReactNode }) => (
    <TableHead>
      <button className="inline-flex items-center gap-1 hover:text-foreground" onClick={() => toggleSort(k)}>
        {children}
        <ArrowUpDown className="h-3 w-3 opacity-50" />
      </button>
    </TableHead>
  );

  return (
    <div className="p-6 space-y-6">
      <Seo title="Platform admin — Privaro" description="Vista de superadmin de la plataforma Privaro." path="/app/platform-admin" noindex />

      <div>
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Platform Admin</h1>
          {typeof data?.count === "number" && <Badge variant="outline">{data.count}</Badge>}
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Vista global de todas las organizaciones y su consumo actual.
        </p>
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">Organizaciones</CardTitle>
          <Input
            placeholder="Buscar por nombre…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="max-w-xs"
          />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
          ) : isError ? (
            <p className="text-sm text-destructive">Error: {error?.message}</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border">
                    <SortHead k="name">Nombre</SortHead>
                    <SortHead k="org_type">Tipo</SortHead>
                    <TableHead>Partner padre</TableHead>
                    <SortHead k="plan">Plan</SortHead>
                    <SortHead k="requests_used_this_org">Consumo propio</SortHead>
                    <SortHead k="requests_limit">Límite</SortHead>
                    <SortHead k="pct">% del límite</SortHead>
                    <TableHead>Fase descuento</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((o) => {
                    const pct = o.requests_limit ? Math.min(100, Math.round((o.requests_used_this_org / o.requests_limit) * 100)) : 0;
                    const parent = o.parent_org_id ? orgsById.get(o.parent_org_id) : null;
                    return (
                      <TableRow key={o.id} className="border-border">
                        <TableCell className="font-semibold">{o.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={typeBadge(o.org_type)}>{o.org_type}</Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {parent ? parent.name : o.parent_org_id ? o.parent_org_id.slice(0, 8) : "—"}
                        </TableCell>
                        <TableCell className="uppercase text-xs">{o.plan ?? "—"}</TableCell>
                        <TableCell className="tabular-nums">{o.requests_used_this_org.toLocaleString()}</TableCell>
                        <TableCell className="tabular-nums">{o.requests_limit?.toLocaleString() ?? "—"}</TableCell>
                        <TableCell className="min-w-[140px]">
                          {o.requests_limit ? (
                            <div className="flex items-center gap-2">
                              <Progress value={pct} className="h-2 flex-1" />
                              <span className="text-xs tabular-nums w-9 text-right">{pct}%</span>
                            </div>
                          ) : "—"}
                        </TableCell>
                        <TableCell className="text-xs capitalize">{o.discount_phase?.replace("_", " ") ?? "—"}</TableCell>
                      </TableRow>
                    );
                  })}
                  {filtered.length === 0 && (
                    <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">Sin resultados</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PlatformAdmin;
