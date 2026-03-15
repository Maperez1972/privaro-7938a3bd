import { Button } from "@/components/ui/button";
import { Plus, MessageSquare, MoreHorizontal, Archive } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface Conversation { id: string; title: string; last_message_at: string | null; created_at: string; total_messages: number; }
interface Props { conversations: Conversation[]; activeId: string | null; onSelect: (id: string) => void; onNew: () => void; onArchive: (id: string) => void; loading: boolean; }

export function ConversationList({ conversations, activeId, onSelect, onNew, onArchive, loading }: Props) {
  return (
    <div className="w-60 flex-shrink-0 border-r border-border flex flex-col bg-card/50">
      <div className="p-3 border-b border-border flex items-center justify-between">
        <h2 className="text-sm font-semibold">Conversations</h2>
        <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={onNew}><Plus className="w-3 h-3" /> New</Button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {loading ? <p className="text-xs text-muted-foreground text-center py-8">Loading…</p> : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2"><MessageSquare className="w-8 h-8 opacity-40" /><p className="text-xs">No conversations yet</p></div>
        ) : conversations.map((conv) => (
          <div key={conv.id} onClick={() => onSelect(conv.id)} className={cn("flex items-start gap-2 px-3 py-2.5 cursor-pointer transition-colors border-l-2", activeId === conv.id ? "bg-primary/10 border-l-primary" : "border-l-transparent hover:bg-secondary/50")}>
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5"><MessageSquare className="w-3.5 h-3.5 text-primary" /></div>
            <div className="flex-1 min-w-0"><p className="text-xs font-medium truncate">{conv.title}</p><p className="text-[10px] text-muted-foreground">{conv.last_message_at ? formatDistanceToNow(new Date(conv.last_message_at), { addSuffix: true }) : formatDistanceToNow(new Date(conv.created_at), { addSuffix: true })}</p></div>
            <DropdownMenu><DropdownMenuTrigger asChild><button className="p-1 rounded hover:bg-secondary text-muted-foreground" onClick={(e) => e.stopPropagation()}><MoreHorizontal className="w-3.5 h-3.5" /></button></DropdownMenuTrigger><DropdownMenuContent align="end" className="w-36"><DropdownMenuItem onClick={() => onArchive(conv.id)}><Archive className="w-3.5 h-3.5 mr-2" /> Archive</DropdownMenuItem></DropdownMenuContent></DropdownMenu>
          </div>
        ))}
      </div>
    </div>
  );
}
