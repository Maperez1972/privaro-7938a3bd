import { useState, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  X, FileText, Image as ImageIcon, Lock, AlertTriangle, Loader2,
  ChevronDown, ChevronRight, FileSearch, Eye, EyeOff,
} from "lucide-react";
import { mockProxyDetect } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import mammoth from "mammoth";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

type Detection = { type: string; value: string; start: number; end: number; severity: string; category: string };

export interface PageAnalysis {
  page: number;
  label: string;
  content: string;
  detections: Detection[];
}

export interface FileAttachment {
  file: File;
  content: string;
  detections: Detection[];
  pages: PageAnalysis[];
  scanning: boolean;
  scanned: boolean;
}

const ACCEPTED_TYPES = ["text/plain","text/csv","application/pdf","application/json","text/markdown","application/vnd.openxmlformats-officedocument.wordprocessingml.document","image/png","image/jpeg","image/webp","image/gif"];
const ACCEPTED_EXTENSIONS = [".txt",".csv",".pdf",".json",".md",".docx",".png",".jpg",".jpeg",".webp",".gif"];
const IMAGE_TYPES = ["image/png","image/jpeg","image/webp","image/gif"];
const IMAGE_EXTENSIONS = [".png",".jpg",".jpeg",".webp",".gif"];
const MAX_SIZE = 10 * 1024 * 1024;

async function extractPdfPages(file: File): Promise<{ pages: string[]; full: string }> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const pages: string[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const text = content.items.map((item: any) => item.str).join(" ");
    pages.push(text);
  }
  return { pages, full: pages.join("\n\n") };
}

async function extractDocxPages(file: File): Promise<{ pages: string[]; full: string }> {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  const text = result.value;
  // Split by double newlines as "sections" since docx has no real pages
  const sections = text.split(/\n{2,}/).filter((s) => s.trim().length > 0);
  if (sections.length <= 1) return { pages: [text], full: text };
  return { pages: sections, full: text };
}

async function extractTextPages(file: File): Promise<{ pages: string[]; full: string }> {
  const text = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsText(file);
  });
  // For CSV/JSON/MD/TXT split by chunks of ~50 lines
  const lines = text.split("\n");
  const CHUNK = 50;
  const pages: string[] = [];
  for (let i = 0; i < lines.length; i += CHUNK) {
    pages.push(lines.slice(i, i + CHUNK).join("\n"));
  }
  if (pages.length === 0) pages.push(text);
  return { pages, full: text };
}

function isImageFile(file: File): boolean {
  const ext = "." + file.name.split(".").pop()?.toLowerCase();
  return IMAGE_TYPES.includes(file.type) || IMAGE_EXTENSIONS.includes(ext);
}

function getPageLabel(file: File): string {
  const ext = "." + file.name.split(".").pop()?.toLowerCase();
  if (file.type === "application/pdf" || ext === ".pdf") return "Page";
  if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || ext === ".docx") return "Section";
  return "Block";
}

async function extractFilePages(file: File): Promise<{ pages: string[]; full: string }> {
  const ext = "." + file.name.split(".").pop()?.toLowerCase();
  if (file.type === "application/pdf" || ext === ".pdf") return extractPdfPages(file);
  if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || ext === ".docx") return extractDocxPages(file);
  if (IMAGE_TYPES.includes(file.type) || IMAGE_EXTENSIONS.includes(ext)) {
    const label = `[Image file: ${file.name} — ${(file.size / 1024).toFixed(1)} KB]`;
    return { pages: [label], full: label };
  }
  return extractTextPages(file);
}

export function useFileAttachment() {
  const [attachment, setAttachment] = useState<FileAttachment | null>(null);

  const attachFile = useCallback(async (file: File) => {
    const ext = "." + file.name.split(".").pop()?.toLowerCase();
    if (!ACCEPTED_TYPES.includes(file.type) && !ACCEPTED_EXTENSIONS.includes(ext)) return "Unsupported file type. Supported: TXT, CSV, PDF, JSON, MD, DOCX";
    if (file.size > MAX_SIZE) return "File too large. Maximum size is 10MB.";

    const att: FileAttachment = { file, content: "", detections: [], pages: [], scanning: true, scanned: false };
    setAttachment(att);

    try {
      const { pages: pageTexts, full } = await extractFilePages(file);
      const allDetections = mockProxyDetect(full);
      const pageLabel = getPageLabel(file);

      const pageAnalyses: PageAnalysis[] = pageTexts.map((text, idx) => {
        const pageDetections = mockProxyDetect(text);
        return {
          page: idx + 1,
          label: `${pageLabel} ${idx + 1}`,
          content: text,
          detections: pageDetections,
        };
      });

      setAttachment({
        file,
        content: full,
        detections: allDetections,
        pages: pageAnalyses,
        scanning: false,
        scanned: true,
      });
      return null;
    } catch {
      setAttachment(null);
      return "Failed to read file.";
    }
  }, []);

  const removeAttachment = useCallback(() => { setAttachment(null); }, []);
  return { attachment, attachFile, removeAttachment };
}

/* ── Per-page detail row ── */
function PageRow({ page }: { page: PageAnalysis }) {
  const [open, setOpen] = useState(false);
  const hasDetections = page.detections.length > 0;
  const typeGroups = Array.from(new Set(page.detections.map((d) => d.type)));

  return (
    <div className="border border-border/50 rounded-md overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "w-full flex items-center gap-2 px-2.5 py-1.5 text-left text-[11px] transition-colors",
          "hover:bg-muted/50",
          hasDetections ? "text-foreground" : "text-muted-foreground"
        )}
      >
        {open ? <ChevronDown className="w-3 h-3 flex-shrink-0" /> : <ChevronRight className="w-3 h-3 flex-shrink-0" />}
        <span className="font-medium flex-1">{page.label}</span>
        {hasDetections ? (
          <Badge className="text-[9px] bg-amber-500/20 text-amber-400 border-amber-500/30 gap-1 px-1.5 py-0">
            <AlertTriangle className="w-2 h-2" /> {page.detections.length}
          </Badge>
        ) : (
          <Badge className="text-[9px] bg-emerald-500/20 text-emerald-400 border-emerald-500/30 gap-1 px-1.5 py-0">
            <Lock className="w-2 h-2" /> Clean
          </Badge>
        )}
      </button>
      {open && (
        <div className="px-2.5 pb-2 space-y-1.5 border-t border-border/30">
          {hasDetections ? (
            <>
              <div className="flex flex-wrap gap-1 pt-1.5">
                {typeGroups.map((type) => {
                  const count = page.detections.filter((d) => d.type === type).length;
                  return (
                    <span key={type} className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300">
                      {type.replace("_", " ")} ×{count}
                    </span>
                  );
                })}
              </div>
              <div className="space-y-0.5">
                {page.detections.map((d, i) => (
                  <div key={i} className="flex items-center gap-2 text-[10px]">
                    <span className={cn(
                      "px-1 py-0.5 rounded font-mono",
                      d.severity === "high" ? "bg-destructive/20 text-destructive" : "bg-amber-500/10 text-amber-400"
                    )}>
                      {d.type.replace("_", " ")}
                    </span>
                    <code className="text-muted-foreground truncate max-w-[180px]">{d.value}</code>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-[10px] text-muted-foreground pt-1.5">No sensitive data detected in this {page.label.toLowerCase()}.</p>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Main File Preview ── */
interface FilePreviewProps { attachment: FileAttachment; onRemove: () => void; }

export function FilePreview({ attachment, onRemove }: FilePreviewProps) {
  const { file, content, detections, pages, scanning, scanned } = attachment;
  const [showDetail, setShowDetail] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const sizeStr = file.size < 1024 ? `${file.size} B` : file.size < 1024 * 1024 ? `${(file.size / 1024).toFixed(1)} KB` : `${(file.size / (1024 * 1024)).toFixed(1)} MB`;
  const isImage = isImageFile(file);
  const [thumbUrl] = useState(() => isImage ? URL.createObjectURL(file) : null);
  const pagesWithPii = pages.filter((p) => p.detections.length > 0).length;

  return (
    <div className="space-y-2">
      {/* Summary bar */}
      <div className="flex items-center gap-2 px-3 py-2 bg-secondary/80 border border-border rounded-lg text-sm">
        {isImage && thumbUrl
          ? <img src={thumbUrl} alt={file.name} className="w-10 h-10 rounded object-cover flex-shrink-0 border border-border" />
          : <FileText className="w-4 h-4 text-primary flex-shrink-0" />}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium truncate">{file.name}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[10px] text-muted-foreground">{sizeStr}</span>
            {isImage && scanned && (
              <Badge className="text-[9px] bg-muted text-muted-foreground border-border gap-1 px-1.5 py-0">
                <ImageIcon className="w-2 h-2" /> Image
              </Badge>
            )}
            {!isImage && scanning && (
              <span className="text-[10px] text-amber-400 flex items-center gap-1">
                <Loader2 className="w-2.5 h-2.5 animate-spin" /> Scanning for PII…
              </span>
            )}
            {!isImage && scanned && detections.length > 0 && (
              <Badge className="text-[9px] bg-amber-500/20 text-amber-400 border-amber-500/30 gap-1 px-1.5 py-0">
                <AlertTriangle className="w-2 h-2" /> {detections.length} PII found
              </Badge>
            )}
            {!isImage && scanned && detections.length === 0 && (
              <Badge className="text-[9px] bg-emerald-500/20 text-emerald-400 border-emerald-500/30 gap-1 px-1.5 py-0">
                <Lock className="w-2 h-2" /> Clean
              </Badge>
            )}
            {!isImage && scanned && pages.length > 1 && (
              <span className="text-[10px] text-muted-foreground">
                {pages.length} {pages[0]?.label.split(" ")[0].toLowerCase()}s
                {pagesWithPii > 0 && ` · ${pagesWithPii} with PII`}
              </span>
            )}
          </div>
        </div>
        {/* Content preview toggle */}
        {!isImage && scanned && content && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 flex-shrink-0 text-muted-foreground hover:text-primary"
            onClick={() => setShowContent(!showContent)}
            title="Preview file content"
          >
            {showContent ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          </Button>
        )}
        {!isImage && scanned && pages.length > 0 && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 flex-shrink-0 text-muted-foreground hover:text-primary"
            onClick={() => setShowDetail(!showDetail)}
            title="Toggle per-page analysis"
          >
            <FileSearch className="w-3.5 h-3.5" />
          </Button>
        )}
        <Button variant="ghost" size="icon" className="h-6 w-6 flex-shrink-0" onClick={onRemove}>
          <X className="w-3 h-3" />
        </Button>
      </div>

      {/* Content preview panel */}
      {showContent && content && (
        <div className="ml-2 mr-2 p-3 bg-secondary/40 border border-border/60 rounded-lg max-h-60 overflow-y-auto">
          <div className="flex items-center gap-1.5 px-1 pb-2 border-b border-border/30 mb-2">
            <Eye className="w-3 h-3 text-primary" />
            <span className="text-[11px] font-semibold text-foreground">Content Preview</span>
            <span className="text-[10px] text-muted-foreground ml-auto">
              {content.length.toLocaleString()} chars
            </span>
          </div>
          <pre className="text-[11px] text-muted-foreground whitespace-pre-wrap font-mono leading-relaxed break-words">
            {content.length > 5000 ? content.slice(0, 5000) + "\n\n… [truncated]" : content}
          </pre>
        </div>
      )}

      {/* Per-page detail panel */}
      {showDetail && pages.length > 0 && (
        <div className="ml-2 mr-2 p-2 bg-secondary/40 border border-border/60 rounded-lg space-y-1.5 max-h-52 overflow-y-auto">
          <div className="flex items-center gap-1.5 px-1 pb-1 border-b border-border/30">
            <FileSearch className="w-3 h-3 text-primary" />
            <span className="text-[11px] font-semibold text-foreground">PII Analysis by {pages[0]?.label.split(" ")[0]}</span>
          </div>
          {pages.map((page) => (
            <PageRow key={page.page} page={page} />
          ))}
        </div>
      )}
    </div>
  );
}
