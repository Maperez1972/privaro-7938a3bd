import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageSquare, Lock, AlertTriangle, Send, Paperclip, FileText, Upload, Copy, Check, Pencil, ChevronDown, ChevronUp, ClipboardPaste } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { FilePreview, FileAttachment } from "./FileAttachment";
import { useRef, useState, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";

interface Message { id: string; role: "user" | "assistant"; content_protected: string; pii_detected: number; pii_protected: number; created_at: string; attachment_name?: string | null; attachment_type?: string | null; attachment_size?: number | null; }
interface Pipeline { id: string; name: string; llm_provider: string; llm_model: string; }

/** Threshold for treating user text as "pasted content" */
const PASTE_THRESHOLD = 500;
const PASTE_PREVIEW_LINES = 4;

interface PastedText {
  content: string;
  charCount: number;
}

interface Props {
  messages: Message[];
  sending: boolean;
  loading: boolean;
  activeConversationId: string | null;
  activePipeline?: Pipeline;
  isProxyActive: boolean;
  input: string;
  setInput: (v: string) => void;
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  onSend: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  attachment: FileAttachment | null;
  onAttachFile: (file: File) => Promise<string | null>;
  onRemoveAttachment: () => void;
  onEditMessage?: (messageId: string, newContent: string) => void;
  pastedText?: PastedText | null;
  onRemovePastedText?: () => void;
}

/** Collapsible block for long user messages */
function CollapsibleText({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  const lines = text.split("\n");
  const preview = lines.slice(0, PASTE_PREVIEW_LINES).join("\n");
  const hasMore = lines.length > PASTE_PREVIEW_LINES || text.length > PASTE_THRESHOLD;

  if (!hasMore) return <p className="whitespace-pre-wrap">{text}</p>;

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mb-1">
        <ClipboardPaste className="w-3 h-3" />
        <span>Pasted text · {text.length.toLocaleString()} chars</span>
      </div>
      <div className="relative">
        <pre className={cn(
          "whitespace-pre-wrap text-sm font-sans bg-background/30 rounded-md px-3 py-2 border border-border/30 overflow-hidden transition-all",
          !expanded && "max-h-[6rem]"
        )}>
          {expanded ? text : preview + (lines.length > PASTE_PREVIEW_LINES ? "\n…" : "")}
        </pre>
        {!expanded && (
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-primary/10 to-transparent rounded-b-md" />
        )}
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="h-5 text-[10px] px-1.5 text-muted-foreground hover:text-foreground gap-0.5"
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? <><ChevronUp className="w-3 h-3" /> Collapse</> : <><ChevronDown className="w-3 h-3" /> Show all</>}
      </Button>
    </div>
  );
}

/** Compact file chip shown in messages */
function FileChip({ name, size }: { name: string; size?: number | null }) {
  const sizeStr = size ? (size < 1024 ? `${size} B` : size < 1048576 ? `${(size / 1024).toFixed(1)} KB` : `${(size / 1048576).toFixed(1)} MB`) : null;
  return (
    <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-background/40 border border-border/40 mb-1.5">
      <FileText className="w-3 h-3 text-primary shrink-0" />
      <span className="text-[10px] font-medium text-primary truncate max-w-[180px]">{name}</span>
      {sizeStr && <span className="text-[9px] text-muted-foreground">({sizeStr})</span>}
    </div>
  );
}

/** Preview of pasted text in the input area (before sending) */
function PastedTextPreview({ pastedText, onRemove }: { pastedText: PastedText; onRemove: () => void }) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/50 border border-border/50">
      <ClipboardPaste className="w-3.5 h-3.5 text-primary shrink-0" />
      <span className="text-[11px] text-foreground truncate flex-1">
        Pasted text · {pastedText.charCount.toLocaleString()} chars
      </span>
      <Button variant="ghost" size="icon" className="h-5 w-5 text-muted-foreground hover:text-destructive" onClick={onRemove}>
        ✕
      </Button>
    </div>
  );
}

export function ChatArea({ messages, sending, loading, activeConversationId, activePipeline, isProxyActive, input, setInput, textareaRef, onSend, onKeyDown, messagesEndRef, attachment, onAttachFile, onRemoveAttachment, onEditMessage, pastedText, onRemovePastedText }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragCounterRef = useRef(0);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  const handleCopy = (msg: Message) => {
    navigator.clipboard.writeText(msg.content_protected);
    setCopiedId(msg.id);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleStartEdit = (msg: Message) => {
    setEditingId(msg.id);
    setEditText(msg.content_protected);
  };

  const handleSaveEdit = (msgId: string) => {
    if (editText.trim() && onEditMessage) {
      onEditMessage(msgId, editText.trim());
    }
    setEditingId(null);
    setEditText("");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditText("");
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => { const file = e.target.files?.[0]; if (!file) return; const error = await onAttachFile(file); if (error) alert(error); if (fileInputRef.current) fileInputRef.current.value = ""; };
  const handleDrop = useCallback(async (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); dragCounterRef.current = 0; const file = e.dataTransfer.files?.[0]; if (!file) return; const error = await onAttachFile(file); if (error) alert(error); }, [onAttachFile]);
  const handleDragEnter = useCallback((e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); dragCounterRef.current++; if (e.dataTransfer.types.includes("Files")) setIsDragging(true); }, []);
  const handleDragLeave = useCallback((e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); dragCounterRef.current--; if (dragCounterRef.current === 0) setIsDragging(false); }, []);
  const handleDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); }, []);

  /** Detect if user message is long enough to be treated as "pasted" */
  const isLongUserMessage = (msg: Message) => msg.role === "user" && msg.content_protected.length > PASTE_THRESHOLD;

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
              <div key={msg.id} className={cn("group flex", msg.role === "user" ? "justify-end" : "justify-start")}>
                <div className="flex flex-col gap-1 max-w-[75%]">
                  <div className={cn("rounded-xl px-4 py-3 text-sm", msg.role === "user" ? "bg-primary/20 text-foreground" : "bg-secondary text-foreground")}>
                    {msg.attachment_name && <FileChip name={msg.attachment_name} size={msg.attachment_size} />}
                    {editingId === msg.id ? (
                      <div className="space-y-2">
                        <textarea value={editText} onChange={(e) => setEditText(e.target.value)} className="w-full resize-none bg-background/50 border border-border rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary" rows={3} autoFocus />
                        <div className="flex gap-1.5 justify-end">
                          <Button variant="ghost" size="sm" className="h-6 text-[11px] px-2" onClick={handleCancelEdit}>Cancel</Button>
                          <Button size="sm" className="h-6 text-[11px] px-2" onClick={() => handleSaveEdit(msg.id)} disabled={!editText.trim()}>Save</Button>
                        </div>
                      </div>
                    ) : msg.role === "assistant" ? (
                      <div className="prose prose-sm prose-invert max-w-none [&_p]:my-1 [&_ul]:my-1 [&_ol]:my-1 [&_li]:my-0.5 [&_pre]:bg-background/50 [&_pre]:rounded-md [&_pre]:p-2 [&_code]:text-primary [&_h1]:text-base [&_h2]:text-sm [&_h3]:text-sm">
                        <ReactMarkdown>{msg.content_protected}</ReactMarkdown>
                      </div>
                    ) : isLongUserMessage(msg) ? (
                      <CollapsibleText text={msg.content_protected} />
                    ) : (
                      <p className="whitespace-pre-wrap">{msg.content_protected}</p>
                    )}
                    {msg.role === "user" && msg.pii_detected > 0 && editingId !== msg.id && <div className="flex items-center gap-1 mt-2"><Badge className="text-[9px] bg-emerald-500/20 text-emerald-400 border-emerald-500/30 gap-1 px-1.5 py-0"><Lock className="w-2 h-2" /> {msg.pii_protected} protected</Badge></div>}
                  </div>
                  {editingId !== msg.id && (
                    <div className={cn("flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity", msg.role === "user" ? "justify-end" : "justify-start")}>
                      <Tooltip><TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground" onClick={() => handleCopy(msg)}>
                          {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        </Button>
                      </TooltipTrigger><TooltipContent side="bottom" className="text-[11px]">Copy</TooltipContent></Tooltip>
                      {msg.role === "user" && onEditMessage && (
                        <Tooltip><TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground" onClick={() => handleStartEdit(msg)}>
                            <Pencil className="w-3 h-3" />
                          </Button>
                        </TooltipTrigger><TooltipContent side="bottom" className="text-[11px]">Edit</TooltipContent></Tooltip>
                      )}
                    </div>
                  )}
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
          {pastedText && onRemovePastedText && <PastedTextPreview pastedText={pastedText} onRemove={onRemovePastedText} />}
          <div className="flex items-end gap-2">
            <input ref={fileInputRef} type="file" accept=".txt,.csv,.pdf,.json,.md,.docx,.xlsx,.xls,.pptx,.ppt,.png,.jpg,.jpeg,.webp,.gif" className="hidden" onChange={handleFileChange} />
            <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-primary" onClick={() => fileInputRef.current?.click()} disabled={sending}><Paperclip className="w-4 h-4" /></Button></TooltipTrigger><TooltipContent>Attach file</TooltipContent></Tooltip>
            <textarea ref={textareaRef} value={input} onChange={(e) => { setInput(e.target.value); e.target.style.height = "auto"; e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px"; }} onKeyDown={onKeyDown} placeholder="Type your message here..." disabled={sending} rows={1} className="flex-1 resize-none bg-secondary border border-border rounded-lg px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50" />
            <Button size="icon" className="h-9 w-9" onClick={onSend} disabled={sending || (!input.trim() && !attachment && !pastedText)}><Send className="w-4 h-4" /></Button>
          </div>
        </div>
      </div>
    </div>
  );
}
