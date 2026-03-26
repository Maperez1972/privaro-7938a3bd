import { useState, useRef, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Check, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { PolicySummaryBadge } from "@/components/app/pipeline/PolicySummaryBadge";

interface Pipeline { id: string; name: string; llm_provider: string; llm_model: string; }
interface Props { pipelines: Pipeline[]; activePipelineId: string | null; onSelect: (id: string) => void; }

export function PipelineSelector({ pipelines, activePipelineId, onSelect }: Props) {
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
      <div className="p-3 border-b border-border"><h2 className="text-sm font-semibold">Active Pipeline</h2><p className="text-[10px] text-muted-foreground mt-0.5">Select the AI model for this chat</p></div>
      <div className="relative flex-1 min-h-0">
        <div ref={listRef} className="h-full overflow-y-auto p-2 space-y-1.5">
          {pipelines.length === 0 ? <p className="text-xs text-muted-foreground text-center py-8">No active pipelines</p> : pipelines.map((pipe) => {
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
