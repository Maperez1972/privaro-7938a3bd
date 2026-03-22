import { Badge } from "@/components/ui/badge";
import { Check, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { PolicySummaryBadge } from "@/components/app/pipeline/PolicySummaryBadge";

interface Pipeline { id: string; name: string; llm_provider: string; llm_model: string; }
interface Props { pipelines: Pipeline[]; activePipelineId: string | null; onSelect: (id: string) => void; }

export function PipelineSelector({ pipelines, activePipelineId, onSelect }: Props) {
  return (
    <div className="w-72 flex-shrink-0 border-l border-border flex-col bg-card/50 hidden lg:flex">
      <div className="p-3 border-b border-border"><h2 className="text-sm font-semibold">Active Pipeline</h2><p className="text-[10px] text-muted-foreground mt-0.5">Select the AI model for this chat</p></div>
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
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
    </div>
  );
}
