import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageSquare, Lock, AlertTriangle, Send, Paperclip, FileText, Upload } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { FilePreview, FileAttachment } from "./FileAttachment";
import { useRef, useState, useCallback } from "react";
import ReactMarkdown from "react-markdown";

interface Message { id: string; role: "user" | "assistant"; content_protected: string; pii_detected: number; pii_protected: number; created_at: string; attachment_name?: string | null; attachment_type?: string | null; attachment_size?: number | null; }
interface Pipeline { id: string; name: string; llm_provider: string; llm_model: string; }
interface Props { messages: Message[]; sending: boolean; loading: boolean; activeConversationId: string | null; activePipeline?: Pipeline; isProxyActive: boolean; input: string; setInput: (v: string) => void; textareaRef: React.RefObject<HTMLTextAreaElement>; onSend: () => void; onKeyDown: (e: React.KeyboardEvent) => void; messagesEndRef: React.RefObject<HTMLDivElement>; attachment: FileAttachment | null; onAttachFile: (file: File) => Promise<string | null>; onRemoveAttachment: () => void; }

export function ChatArea({ messages, sending, loading, activeConversationId, activePipeline, isProxyActive, input, setInput, textareaRef, onSend, onKeyDown, messagesEndRef, attachment, onAttachFile, onRemoveAttachment }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragCounterRef = useRef(0);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => { const file = e.target.files?.[0]; if (!file) return; const error = await onAttachFile(file); if (error) alert(error); if (fileInputRef.current) fileInputRef.current.value = ""; };
  const handleDrop = useCallback(async (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); dragCounterRef.current = 0; const file = e.dataTransfer.files?.[0]; if (!file) return; const error = await onAttachFile(file); if (error) alert(error); }, [onAttachFile]);
  const handleDragEnter = useCallback((e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); dragCounterRef.current++; if (e.dataTransfer.types.includes("Files")) setIsDragging(true); }, []);
  const handleDragLeave = useCallback((e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); dragCounterRef.current--; if (dragCounterRef.current === 0) setIsDragging(false); }, []);
  const handleDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); }, []);

  return (
    <div className="flex-1 flex flex-col min-w-0 relative" onDragEnter={handleDragEnter} onDragLeave={handleDragLeave} onDragOver={handleDragOver} onDrop={handleDrop}>
      {isDragging && (<div className="absolute inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center border-2 border-dashed border-primary rounded-lg m-2"><div className="flex flex-col items-center gap-2 text-primary"><Upload className="w-10 h-10" /><p className="text-sm font-medium">Drop file to attach</p></div></div>)}
      <div className="h-14 border-b border-border flex items-center px-4 gap-3">
        <h2 className="text-sm font-semibold">{activeConversationId ? "Conversation" : "New Conversation"}</h2>
        {activePipeline && (<div className="flex items-center gap-2 ml-auto"><Badge variant="outline" className="text-[10px] border-emerald-500/50 text-emerald-400">{activePipeline.llm_provider}</Badge><Badge variant="outline" className="text-[10px] border-purple-500/50 text-purple-400">{activePipeline.llm_model}</Badge>{isProxyActive ? <Badge className="text-[10px] bg-emerald-500/20 text-emerald-400 border-emerald-500/30 gap-1"><Lock className="w-2.5 h-2.5" /> Protected</Badge> : <Badge className="text-[10px] bg-amber-500/20 text-amber-400 border-amber-500/30 gap-1"><AlertTriangle className="w-2.5 h-2.5" /> Mock</Badge>}</div>)}
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {loading ? <p className="text-center text-muted-foreground text-sm py-12">Loading messages…</p> : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-3"><div className="w-16 h-16 rounded-2xl border border-border/60 flex items-center justify-center"><MessageSquare className="w-7 h-7 opacity-50" /></div><p className="font-medium text-sm">Start a new conversation</p></div>
        ) : (
          <div className="space-y-4 max-w-3xl mx-auto">
            {messages.map((msg) => (
              <div key={msg.id} className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
                <div className={cn("max-w-[75%] rounded-xl px-4 py-3 text-sm", msg.role === "user" ? "bg-primary/20 text-foreground" : "bg-secondary text-foreground")}>
                  {msg.attachment_name && <div className="flex items-center gap-1.5 mb-2 pb-2 border-b border-border/40"><FileText className="w-3.5 h-3.5 text-primary" /><span className="text-[10px] font-medium text-primary">{msg.attachment_name}</span></div>}
                  {msg.role === "assistant" ? (
                    <div className="prose prose-sm prose-invert max-w-none [&_p]:my-1 [&_ul]:my-1 [&_ol]:my-1 [&_li]:my-0.5 [&_pre]:bg-background/50 [&_pre]:rounded-md [&_pre]:p-2 [&_code]:text-primary [&_h1]:text-base [&_h2]:text-sm [&_h3]:text-sm">
                      <ReactMarkdown>{msg.content_protected}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap">{msg.content_protected}</p>
                  )}
                  {msg.role === "user" && msg.pii_detected > 0 && <div className="flex items-center gap-1 mt-2"><Badge className="text-[9px] bg-emerald-500/20 text-emerald-400 border-emerald-500/30 gap-1 px-1.5 py-0"><Lock className="w-2 h-2" /> {msg.pii_protected} protected</Badge></div>}
                </div>
              </div>
            ))}
            {sending && <div className="flex justify-start"><div className="bg-secondary rounded-xl px-4 py-3"><div className="flex gap-1"><span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{animationDelay:"0ms"}} /><span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{animationDelay:"150ms"}} /><span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{animationDelay:"300ms"}} /></div></div></div>}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      <div className="border-t border-border p-3">
        <div className="max-w-3xl mx-auto space-y-2">
          {attachment && <FilePreview attachment={attachment} onRemove={onRemoveAttachment} />}
          <div className="flex items-end gap-2">
            <input ref={fileInputRef} type="file" accept=".txt,.csv,.pdf,.json,.md,.docx,.png,.jpg,.jpeg,.webp,.gif" className="hidden" onChange={handleFileChange} />
            <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-primary" onClick={() => fileInputRef.current?.click()} disabled={sending}><Paperclip className="w-4 h-4" /></Button></TooltipTrigger><TooltipContent>Attach file</TooltipContent></Tooltip>
            <textarea ref={textareaRef} value={input} onChange={(e) => { setInput(e.target.value); e.target.style.height = "auto"; e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px"; }} onKeyDown={onKeyDown} placeholder="Type your message here..." disabled={sending} rows={1} className="flex-1 resize-none bg-secondary border border-border rounded-lg px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50" />
            <Button size="icon" className="h-9 w-9" onClick={onSend} disabled={sending || (!input.trim() && !attachment)}><Send className="w-4 h-4" /></Button>
          </div>
        </div>
      </div>
    </div>
  );
}
