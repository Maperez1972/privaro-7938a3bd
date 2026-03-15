import { useState, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X, FileText, Image as ImageIcon, Lock, AlertTriangle, Loader2 } from "lucide-react";
import { mockProxyDetect } from "@/lib/mock-data";
import * as pdfjsLib from "pdfjs-dist";
import mammoth from "mammoth";

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

export interface FileAttachment {
  file: File;
  content: string;
  detections: Array<{ type: string; value: string; start: number; end: number; severity: string; category: string }>;
  scanning: boolean;
  scanned: boolean;
}

const ACCEPTED_TYPES = ["text/plain","text/csv","application/pdf","application/json","text/markdown","application/vnd.openxmlformats-officedocument.wordprocessingml.document","image/png","image/jpeg","image/webp","image/gif"];
const ACCEPTED_EXTENSIONS = [".txt",".csv",".pdf",".json",".md",".docx",".png",".jpg",".jpeg",".webp",".gif"];
const IMAGE_TYPES = ["image/png","image/jpeg","image/webp","image/gif"];
const IMAGE_EXTENSIONS = [".png",".jpg",".jpeg",".webp",".gif"];
const MAX_SIZE = 10 * 1024 * 1024;

async function extractPdfText(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const pages: string[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const text = content.items.map((item: any) => item.str).join(" ");
    pages.push(text);
  }
  return pages.join("\n\n");
}

async function extractDocxText(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
}

async function readFileAsText(file: File): Promise<string> {
  const ext = "." + file.name.split(".").pop()?.toLowerCase();
  if (file.type === "application/pdf" || ext === ".pdf") return extractPdfText(file);
  if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || ext === ".docx") return extractDocxText(file);
  if (IMAGE_TYPES.includes(file.type) || IMAGE_EXTENSIONS.includes(ext)) return `[Image file: ${file.name} — ${(file.size / 1024).toFixed(1)} KB]`;
  return new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result as string); reader.onerror = reject; reader.readAsText(file); });
}

function isImageFile(file: File): boolean {
  const ext = "." + file.name.split(".").pop()?.toLowerCase();
  return IMAGE_TYPES.includes(file.type) || IMAGE_EXTENSIONS.includes(ext);
}

export function useFileAttachment() {
  const [attachment, setAttachment] = useState<FileAttachment | null>(null);
  const attachFile = useCallback(async (file: File) => {
    const ext = "." + file.name.split(".").pop()?.toLowerCase();
    if (!ACCEPTED_TYPES.includes(file.type) && !ACCEPTED_EXTENSIONS.includes(ext)) return "Unsupported file type. Supported: TXT, CSV, PDF, JSON, MD";
    if (file.size > MAX_SIZE) return "File too large. Maximum size is 10MB.";
    const att: FileAttachment = { file, content: "", detections: [], scanning: true, scanned: false };
    setAttachment(att);
    try {
      const content = await readFileAsText(file);
      const detections = mockProxyDetect(content);
      setAttachment({ file, content, detections, scanning: false, scanned: true });
      return null;
    } catch { setAttachment(null); return "Failed to read file."; }
  }, []);
  const removeAttachment = useCallback(() => { setAttachment(null); }, []);
  return { attachment, attachFile, removeAttachment };
}

interface FilePreviewProps { attachment: FileAttachment; onRemove: () => void; }

export function FilePreview({ attachment, onRemove }: FilePreviewProps) {
  const { file, detections, scanning, scanned } = attachment;
  const sizeStr = file.size < 1024 ? `${file.size} B` : file.size < 1024 * 1024 ? `${(file.size / 1024).toFixed(1)} KB` : `${(file.size / (1024 * 1024)).toFixed(1)} MB`;
  const isImage = isImageFile(file);
  const [thumbUrl] = useState(() => isImage ? URL.createObjectURL(file) : null);

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-secondary/80 border border-border rounded-lg text-sm">
      {isImage && thumbUrl ? <img src={thumbUrl} alt={file.name} className="w-10 h-10 rounded object-cover flex-shrink-0 border border-border" /> : <FileText className="w-4 h-4 text-primary flex-shrink-0" />}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium truncate">{file.name}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[10px] text-muted-foreground">{sizeStr}</span>
          {isImage && scanned && <Badge className="text-[9px] bg-muted text-muted-foreground border-border gap-1 px-1.5 py-0"><ImageIcon className="w-2 h-2" /> Image</Badge>}
          {!isImage && scanning && <span className="text-[10px] text-amber-400 flex items-center gap-1"><Loader2 className="w-2.5 h-2.5 animate-spin" /> Scanning for PII…</span>}
          {!isImage && scanned && detections.length > 0 && <Badge className="text-[9px] bg-amber-500/20 text-amber-400 border-amber-500/30 gap-1 px-1.5 py-0"><AlertTriangle className="w-2 h-2" /> {detections.length} PII found</Badge>}
          {!isImage && scanned && detections.length === 0 && <Badge className="text-[9px] bg-emerald-500/20 text-emerald-400 border-emerald-500/30 gap-1 px-1.5 py-0"><Lock className="w-2 h-2" /> Clean</Badge>}
        </div>
        {scanned && detections.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {Array.from(new Set(detections.map((d) => d.type))).map((type) => {
              const count = detections.filter((d) => d.type === type).length;
              return <span key={type} className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300">{type.replace("_", " ")} ×{count}</span>;
            })}
          </div>
        )}
      </div>
      <Button variant="ghost" size="icon" className="h-6 w-6 flex-shrink-0" onClick={onRemove}><X className="w-3 h-3" /></Button>
    </div>
  );
}
