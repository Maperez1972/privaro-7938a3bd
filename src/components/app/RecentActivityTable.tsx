import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge, SeverityBadge } from "@/components/app/StatusBadge";
import { FileText } from "lucide-react";

interface LogRow { id: string; event_type: string; entity_type: string; action_taken: string; severity: string; ibs_status: string; created_at: string; }

export const RecentActivityTable = ({ logs, isLoading }: { logs: LogRow[]; isLoading: boolean }) => (
  <Card className="border-border bg-card">
    <CardHeader><CardTitle className="text-lg">Recent Activity</CardTitle></CardHeader>
    <CardContent>
      {isLoading ? <div className="space-y-3 p-4">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="flex gap-4"><Skeleton className="h-4 w-24" /><Skeleton className="h-4 w-20" /><Skeleton className="h-4 w-16" /></div>)}</div> : logs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center"><FileText className="w-10 h-10 text-muted-foreground/20 mb-3" /><p className="text-sm font-medium text-muted-foreground">No activity yet</p></div>
      ) : (
        <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="text-left text-muted-foreground border-b border-border"><th className="pb-3 font-medium">Event</th><th className="pb-3 font-medium">Entity</th><th className="pb-3 font-medium">Action</th><th className="pb-3 font-medium">Severity</th><th className="pb-3 font-medium">Blockchain</th><th className="pb-3 font-medium">Time</th></tr></thead><tbody>{logs.map((log) => (<tr key={log.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors"><td className="py-3 font-mono text-xs">{log.event_type}</td><td className="py-3"><span className="text-xs bg-secondary px-2 py-1 rounded">{log.entity_type}</span></td><td className="py-3 text-xs">{log.action_taken}</td><td className="py-3"><SeverityBadge severity={log.severity} /></td><td className="py-3"><StatusBadge status={log.ibs_status} /></td><td className="py-3 text-xs text-muted-foreground">{new Date(log.created_at).toLocaleTimeString()}</td></tr>))}</tbody></table></div>
      )}
    </CardContent>
  </Card>
);
