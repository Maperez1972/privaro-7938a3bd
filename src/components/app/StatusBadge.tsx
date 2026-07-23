import { cn } from "@/lib/utils";
import { CheckCircle2, Clock, XCircle, Loader2, Link2 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface StatusBadgeProps { status: string; className?: string; }

const statusConfig: Record<string, { labelKey: string; className: string; icon: typeof Clock }> = {
  pending: { labelKey: "app.common.status.certifying", className: "bg-warning/15 text-warning border-warning/30", icon: Loader2 },
  certified: { labelKey: "app.common.status.certified", className: "bg-success/15 text-success border-success/30", icon: Link2 },
  failed: { labelKey: "app.common.status.failed", className: "bg-destructive/15 text-destructive border-destructive/30", icon: XCircle },
  active: { labelKey: "app.common.status.active", className: "bg-success/15 text-success border-success/30", icon: CheckCircle2 },
  paused: { labelKey: "app.common.status.paused", className: "bg-warning/15 text-warning border-warning/30", icon: Clock },
  draft: { labelKey: "app.common.status.draft", className: "bg-muted text-muted-foreground border-border", icon: Clock },
  archived: { labelKey: "app.common.status.archived", className: "bg-muted text-muted-foreground border-border", icon: XCircle },
};

const severityConfig: Record<string, string> = {
  critical: "bg-destructive/15 text-destructive border-destructive/30",
  high: "bg-warning/15 text-warning border-warning/30",
  medium: "bg-info/15 text-info border-info/30",
  low: "bg-muted text-muted-foreground border-border",
};

export const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  const { t } = useLanguage();
  const config = statusConfig[status];
  if (!config) return <span className="text-xs text-muted-foreground">{status}</span>;
  const Icon = config.icon;
  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border", config.className, status === "pending" && "animate-pulse", className)}>
      <Icon className={cn("w-3 h-3", status === "pending" && "animate-spin")} />
      {t(config.labelKey)}
    </span>
  );
};

const severityLabelKeys: Record<string, string> = {
  critical: "app.common.severity.critical",
  high: "app.common.severity.high",
  medium: "app.common.severity.medium",
  low: "app.common.severity.low",
};

export const SeverityBadge = ({ severity, className }: { severity: string; className?: string }) => {
  const { t } = useLanguage();
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border capitalize", severityConfig[severity] ?? severityConfig.low, className)}>
      {t(severityLabelKeys[severity] ?? severityLabelKeys.low)}
    </span>
  );
};
