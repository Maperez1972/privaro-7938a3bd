import { useState, useRef, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Check, Zap, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { PolicySummaryBadge } from "@/components/app/pipeline/PolicySummaryBadge";
import { useLanguage } from "@/context/LanguageContext";

interface Pipeline { id: string; name: string; llm_provider: string; llm_model: string; }
interface CompressionStats { tokens_saved: number; compression_ratio: number }
interface Props {
  pipelines: Pipeline[];
  activePipelineId: string | null;
  onSelect: (id: string) => void;
  optimizeContext?: boolean;
  onToggleOptimize?: (v: boolean) => void;
  compressionStats?: CompressionStats | null;
}

export function PipelineSelector({ pipelines, activePipelineId, onSelect, optimizeContext, onToggleOptimize, compressionStats }: Props) {
  const { t } = useLanguage();
  const [showTopShadow, setShowTopShadow] = useState(false);
  const [showBottomShadow, setShowBottomShadow] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const update = () => {
      const { scrollTop, scrollHeight, clientHeight } = el;
      const hasOverflow = scrollHeight > clientHeight + 1;
      setShowTopShadow(hasOverflow && scrollTop > 2);
      setShowBottomShadow(hasOverflow && scrollTop + clientHeight < scrollHeight - 2);
    };
    update();
    requestAnimationFrame(update);
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => { el.removeEventListener("scroll", update); window.removeEventListener("resize", update); };
  }, [pipelines]);

  return (
    <div className="w-72 flex-shrink-0 border-l border-border flex-col bg-card/50 hidden lg:flex">
      <div className="p-3 border-b border-border"><h2 className="text-sm font-semibold">{t("app.chat.pipelineSelector.title")}</h2><p className="text-[10px] text-muted-foreground mt-0.5">{t("app.chat.pipelineSelector.subtitle")}</p></div>
      {onToggleOptimize && (
        <div className="p-3 border-b border-border">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <Sparkles className="w-3.5 h-3.5 text-primary flex-shrink-0" />
              <span className="text-xs font-medium truncate">{t("sandbox.compression.title")}</span>
            </div>
            <Switch checked={!!optimizeContext} onCheckedChange={onToggleOptimize} aria-label={t("sandbox.compression.title")} />
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">{t("app.chat.optimize.desc")}</p>
          {optimizeContext && compressionStats && compressionStats.compression_ratio > 0 && (
            <Badge variant="outline" className="mt-2 text-[10px] border-emerald-500/50 text-emerald-400">
              −{Math.round(compressionStats.compression_ratio * 100)}% tokens · {compressionStats.tokens_saved.toLocaleString()}
            </Badge>
          )}
        </div>
      )}
      <div className="relative flex-1 min-h-0">
        <div ref={listRef} className="h-full overflow-y-auto p-2 space-y-1.5">
          {pipelines.length === 0 ? <p className="text-xs text-muted-foreground text-center py-8">{t("app.chat.pipelineSelector.none")}</p> : pipelines.map((pipe) => {
            const isActive = pipe.id === activePipelineId;
            return (
              <div key={pipe.id}>
                <button onClick={() => onSelect(pipe.id)} className={cn("w-full text-left p-3 rounded-lg border transition-colors", isActive ? "border-primary bg-primary/10" : "border-border hover:border-primary/30 bg-transparent")}>
                  <div className="flex items-center justify-between"><div className="flex items-center gap-2"><Zap className="w-4 h-4 text-primary" /><span className="text-sm font-medium">{pipe.name}</span></div>{isActive && <Check className="w-4 h-4 text-primary" />}</div>
                  <div className="flex items-center gap-1.5 mt-2"><Badge variant="outline" className="text-[9px] border-emerald-500/50 text-emerald-400">{pipe.llm_provider}</Badge><Badge variant="outline" className="text-[9px] border-purple-500/50 text-purple-400">{pipe.llm_model}</Badge></div>
                  {isActive && <PolicySummaryBadge pipelineId={pipe.id} />}
                </button>
              </div>
            );
          })}
        </div>
        <div aria-hidden className={cn("pointer-events-none absolute inset-x-0 top-0 h-4 bg-gradient-to-b from-card/80 to-transparent transition-opacity duration-200", showTopShadow ? "opacity-100" : "opacity-0")} />
        <div aria-hidden className={cn("pointer-events-none absolute inset-x-0 bottom-0 h-4 bg-gradient-to-t from-card/80 to-transparent transition-opacity duration-200", showBottomShadow ? "opacity-100" : "opacity-0")} />
      </div>
    </div>
  );
}
