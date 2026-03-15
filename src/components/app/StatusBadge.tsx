import { cn } from "@/lib/utils";
import { CheckCircle2, Clock, XCircle, Loader2, Link2 } from "lucide-react";

interface StatusBadgeProps { status: string; className?: string; }

const statusConfig: Record<string, { label: string; className: string; icon: typeof Clock }> = {
  pending: { label: "Certifying…", className: "bg-warning/15 text-warning border-warning/30", icon: Loader2 },
  certified: { label: "Certified ⛓️", className: "bg-success/15 text-success border-success/30", icon: Link2 },
  failed: { label: "Failed", className: "bg-destructive/15 text-destructive border-destructive/30", icon: XCircle },
  active: { label: "Active", className: "bg-success/15 text-success border-success/30", icon: CheckCircle2 },
  paused: { label: "Paused", className: "bg-warning/15 text-warning border-warning/30", icon: Clock },
  draft: { label: "Draft", className: "bg-muted text-muted-foreground border-border", icon: Clock },
  archived: { label: "Archived", className: "bg-muted text-muted-foreground border-border", icon: XCircle },
};

const severityConfig: Record<string, string> = {
  critical: "bg-destructive/15 text-destructive border-destructive/30",
  high: "bg-warning/15 text-warning border-warning/30",
  medium: "bg-info/15 text-info border-info/30",
  low: "bg-muted text-muted-foreground border-border",
};

export const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  const config = statusConfig[status];
  if (!config) return <span className="text-xs text-muted-foreground">{status}</span>;
  const Icon = config.icon;
  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border", config.className, status === "pending" && "animate-pulse", className)}>
      <Icon className={cn("w-3 h-3", status === "pending" && "animate-spin")} />
      {config.label}
    </span>
  );
};

export const SeverityBadge = ({ severity, className }: { severity: string; className?: string }) => (
  <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border capitalize", severityConfig[severity] ?? severityConfig.low, className)}>
    {severity}
  </span>
);
