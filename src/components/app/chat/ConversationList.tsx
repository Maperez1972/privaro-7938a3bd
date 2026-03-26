import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Plus, MessageSquare, MoreHorizontal, Archive, Pin, PinOff,
  Pencil, FolderPlus, Folder, Copy, Trash2, ChevronRight,
  Briefcase, Heart, Star, Code, Shield, Palette, Check,
  ArchiveRestore
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubTrigger,
  DropdownMenuSubContent, DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import type { Conversation, ConversationFolder } from "@/hooks/useChat";

const FOLDER_COLORS = [
  "#3B82F6", "#10B981", "#F59E0B", "#EF4444",
  "#8B5CF6", "#06B6D4", "#F97316", "#6B7280",
];

const FOLDER_ICONS: { value: string; icon: React.ReactNode }[] = [
  { value: "folder", icon: <Folder className="w-4 h-4" /> },
  { value: "briefcase", icon: <Briefcase className="w-4 h-4" /> },
  { value: "heart", icon: <Heart className="w-4 h-4" /> },
  { value: "star", icon: <Star className="w-4 h-4" /> },
  { value: "code", icon: <Code className="w-4 h-4" /> },
  { value: "shield", icon: <Shield className="w-4 h-4" /> },
];

function getFolderIcon(iconName: string, color: string) {
  const cls = "w-4 h-4";
  const style = { color };
  switch (iconName) {
    case "briefcase": return <Briefcase className={cls} style={style} />;
    case "heart": return <Heart className={cls} style={style} />;
    case "star": return <Star className={cls} style={style} />;
    case "code": return <Code className={cls} style={style} />;
    case "shield": return <Shield className={cls} style={style} />;
    default: return <Folder className={cls} style={style} />;
  }
}

function getDisplayTitle(conv: Conversation) {
  return conv.custom_title || conv.title || "New Conversation";
}

interface Props {
  conversations: Conversation[];
  archivedConversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onArchive: (id: string) => void;
  onUnarchive: (id: string) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, title: string) => void;
  onTogglePin: (id: string) => void;
  onMoveToFolder: (convId: string, folderId: string | null) => void;
  onDuplicate: (id: string) => void;
  loading: boolean;
  folders: ConversationFolder[];
  onCreateFolder: (name: string, color: string, icon: string) => void;
  onRenameFolder: (id: string, name: string) => void;
  onChangeFolderColor: (id: string, color: string) => void;
  onDeleteFolder: (id: string) => void;
}

// Inline rename input
function InlineRename({ value, onSave, onCancel }: { value: string; onSave: (v: string) => void; onCancel: () => void }) {
  const [text, setText] = useState(value);
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => { ref.current?.focus(); ref.current?.select(); }, []);

  const save = () => {
    const trimmed = text.trim();
    if (trimmed && trimmed !== value) onSave(trimmed);
    else onCancel();
  };

  return (
    <input
      ref={ref}
      value={text}
      onChange={(e) => setText(e.target.value.slice(0, 60))}
      onBlur={save}
      onKeyDown={(e) => {
        if (e.key === "Enter") save();
        if (e.key === "Escape") onCancel();
      }}
      className="text-xs font-medium bg-transparent border-b border-primary outline-none w-full py-0.5"
      onClick={(e) => e.stopPropagation()}
    />
  );
}

// Conversation item
function ConvItem({
  conv, activeId, onSelect, onArchive, onDelete, onRename, onTogglePin,
  onMoveToFolder, onDuplicate, folders,
}: {
  conv: Conversation;
  activeId: string | null;
  onSelect: (id: string) => void;
  onArchive: (id: string) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, title: string) => void;
  onTogglePin: (id: string) => void;
  onMoveToFolder: (convId: string, folderId: string | null) => void;
  onDuplicate: (id: string) => void;
  folders: ConversationFolder[];
}) {
  const [renaming, setRenaming] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <>
      <div
        draggable
        onDragStart={(e) => {
          e.dataTransfer.setData("conv-id", conv.id);
          e.dataTransfer.effectAllowed = "move";
        }}
        onClick={() => onSelect(conv.id)}
        className={cn(
          "flex items-start gap-2 px-3 py-2.5 cursor-pointer transition-colors border-l-2 group",
          activeId === conv.id ? "bg-primary/10 border-l-primary" : "border-l-transparent hover:bg-secondary/50"
        )}
      >
        <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
          <MessageSquare className="w-3 h-3 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          {renaming ? (
            <InlineRename
              value={getDisplayTitle(conv)}
              onSave={(v) => { onRename(conv.id, v); setRenaming(false); }}
              onCancel={() => setRenaming(false)}
            />
          ) : (
            <div className="flex items-center gap-1">
              <p className="text-xs font-medium truncate">{getDisplayTitle(conv)}</p>
              {conv.is_pinned && <Pin className="w-2.5 h-2.5 text-muted-foreground/50 flex-shrink-0" />}
            </div>
          )}
          <p className="text-[10px] text-muted-foreground">
            {conv.last_message_at
              ? formatDistanceToNow(new Date(conv.last_message_at), { addSuffix: true })
              : formatDistanceToNow(new Date(conv.created_at), { addSuffix: true })}
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="p-1 rounded hover:bg-secondary text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="w-3.5 h-3.5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem onClick={() => setRenaming(true)}>
              <Pencil className="w-3.5 h-3.5 mr-2" /> Rename
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onTogglePin(conv.id)}>
              {conv.is_pinned
                ? <><PinOff className="w-3.5 h-3.5 mr-2" /> Unpin</>
                : <><Pin className="w-3.5 h-3.5 mr-2" /> Pin</>
              }
            </DropdownMenuItem>
            {folders.length > 0 && (
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <Folder className="w-3.5 h-3.5 mr-2" /> Move to folder
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  {folders.map(f => (
                    <DropdownMenuItem key={f.id} onClick={() => onMoveToFolder(conv.id, f.id)}>
                      {getFolderIcon(f.icon, f.color)}
                      <span className="ml-2">{f.name}</span>
                    </DropdownMenuItem>
                  ))}
                  {conv.folder_id && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => onMoveToFolder(conv.id, null)}>
                        Remove from folder
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            )}
            <DropdownMenuItem onClick={() => onDuplicate(conv.id)}>
              <Copy className="w-3.5 h-3.5 mr-2" /> Duplicate
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onArchive(conv.id)}>
              <Archive className="w-3.5 h-3.5 mr-2" /> Archive
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive" onClick={() => setDeleteOpen(true)}>
              <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete conversation?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this conversation and all its messages.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => onDelete(conv.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// Folder section
function FolderSection({
  folder, conversations, activeId, onSelect, onArchive, onDelete,
  onRename, onTogglePin, onMoveToFolder, onDuplicate, folders,
  onRenameFolder, onChangeFolderColor, onDeleteFolder,
}: {
  folder: ConversationFolder;
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onArchive: (id: string) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, title: string) => void;
  onTogglePin: (id: string) => void;
  onMoveToFolder: (convId: string, folderId: string | null) => void;
  onDuplicate: (id: string) => void;
  folders: ConversationFolder[];
  onRenameFolder: (id: string, name: string) => void;
  onChangeFolderColor: (id: string, color: string) => void;
  onDeleteFolder: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [renamingFolder, setRenamingFolder] = useState(false);
  const [deleteFolderOpen, setDeleteFolderOpen] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const folderConvs = conversations.filter(c => c.folder_id === folder.id);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const convId = e.dataTransfer.getData("conv-id");
    if (convId) onMoveToFolder(convId, folder.id);
  };

  return (
    <div>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={cn(
          "flex items-center gap-1 px-3 py-1.5 transition-colors group",
          dragOver ? "bg-primary/20 ring-1 ring-primary/40 rounded" : "hover:bg-secondary/30"
        )}
      >
        <button onClick={() => setExpanded(!expanded)} className="flex items-center gap-2 flex-1 min-w-0">
          <ChevronRight className={cn("w-3 h-3 text-muted-foreground transition-transform", expanded && "rotate-90")} />
          {getFolderIcon(folder.icon, folder.color)}
          {renamingFolder ? (
            <InlineRename
              value={folder.name}
              onSave={(v) => { onRenameFolder(folder.id, v); setRenamingFolder(false); }}
              onCancel={() => setRenamingFolder(false)}
            />
          ) : (
            <span className="text-xs font-medium truncate">{folder.name}</span>
          )}
          <span className="text-[10px] text-muted-foreground ml-auto">{folderConvs.length}</span>
        </button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-0.5 rounded hover:bg-secondary text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
              <MoreHorizontal className="w-3 h-3" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={() => setRenamingFolder(true)}>
              <Pencil className="w-3.5 h-3.5 mr-2" /> Rename
            </DropdownMenuItem>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Palette className="w-3.5 h-3.5 mr-2" /> Color
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="p-2">
                <div className="grid grid-cols-4 gap-1.5">
                  {FOLDER_COLORS.map(c => (
                    <button
                      key={c}
                      className="w-5 h-5 rounded-full flex items-center justify-center border border-border hover:scale-110 transition-transform"
                      style={{ background: c }}
                      onClick={() => onChangeFolderColor(folder.id, c)}
                    >
                      {folder.color === c && <Check className="w-3 h-3 text-white" />}
                    </button>
                  ))}
                </div>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive" onClick={() => setDeleteFolderOpen(true)}>
              <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {expanded && folderConvs.map(conv => (
        <div key={conv.id} className="pl-4">
          <ConvItem
            conv={conv} activeId={activeId} onSelect={onSelect}
            onArchive={onArchive} onDelete={onDelete} onRename={onRename}
            onTogglePin={onTogglePin} onMoveToFolder={onMoveToFolder}
            onDuplicate={onDuplicate} folders={folders}
          />
        </div>
      ))}

      <AlertDialog open={deleteFolderOpen} onOpenChange={setDeleteFolderOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete folder "{folder.name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              Conversations inside will be moved to "All Conversations".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => onDeleteFolder(folder.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// New Folder modal
function NewFolderDialog({ open, onOpenChange, onCreate }: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreate: (name: string, color: string, icon: string) => void;
}) {
  const [name, setName] = useState("");
  const [color, setColor] = useState(FOLDER_COLORS[0]);
  const [icon, setIcon] = useState("folder");

  const handleCreate = () => {
    if (!name.trim()) return;
    onCreate(name.trim(), color, icon);
    setName("");
    setColor(FOLDER_COLORS[0]);
    setIcon("folder");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm bg-card border-border">
        <DialogHeader>
          <DialogTitle>New Folder</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value.slice(0, 40))}
              placeholder="Folder name"
              className="h-8 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-2">Color</label>
            <div className="flex gap-2">
              {FOLDER_COLORS.map(c => (
                <button
                  key={c}
                  className="w-5 h-5 rounded-full flex items-center justify-center border border-border hover:scale-110 transition-transform"
                  style={{ background: c }}
                  onClick={() => setColor(c)}
                >
                  {color === c && <Check className="w-3 h-3 text-white" />}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-2">Icon</label>
            <div className="flex gap-2">
              {FOLDER_ICONS.map(i => (
                <button
                  key={i.value}
                  onClick={() => setIcon(i.value)}
                  className={cn(
                    "w-8 h-8 rounded flex items-center justify-center border transition-colors",
                    icon === i.value ? "border-primary bg-primary/20 text-primary" : "border-border text-muted-foreground hover:bg-secondary"
                  )}
                >
                  {i.icon}
                </button>
              ))}
            </div>
          </div>
          <Button className="w-full" size="sm" onClick={handleCreate} disabled={!name.trim()}>
            Create Folder
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Main component
export function ConversationList({
  conversations, archivedConversations, activeId, onSelect, onNew, onArchive, onUnarchive, onDelete,
  onRename, onTogglePin, onMoveToFolder, onDuplicate, loading,
  folders, onCreateFolder, onRenameFolder, onChangeFolderColor, onDeleteFolder,
}: Props) {
  const [folderDialogOpen, setFolderDialogOpen] = useState(false);
  const [showArchived, setShowArchived] = useState(
    () => localStorage.getItem("privaro-archived-expanded") === "true"
  );
  const [dragOverAll, setDragOverAll] = useState(false);
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
  }, [conversations, archivedConversations, folders, showArchived]);

  const pinned = conversations.filter(c => c.is_pinned && !c.folder_id);
  const unfolderedUnpinned = conversations.filter(c => !c.is_pinned && !c.folder_id);
  const hasFolders = folders.length > 0;

  const handleDropAll = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverAll(false);
    const convId = e.dataTransfer.getData("conv-id");
    if (convId) onMoveToFolder(convId, null);
  };

  return (
    <div className="w-60 flex-shrink-0 border-r border-border flex flex-col bg-card/50">
      <div className="p-3 border-b border-border flex items-center justify-between">
        <h2 className="text-sm font-semibold">Conversations</h2>
        <div className="flex gap-1">
          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setFolderDialogOpen(true)} title="New folder">
            <FolderPlus className="w-3.5 h-3.5" />
          </Button>
          <Button size="icon" variant="outline" className="h-7 w-7" onClick={onNew} title="New conversation">
            <Plus className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      <div className="relative flex-1 min-h-0">
        <div ref={listRef} className="h-full overflow-y-auto">
        {loading ? (
          <p className="text-xs text-muted-foreground text-center py-8">Loading…</p>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
            <MessageSquare className="w-8 h-8 opacity-40" />
            <p className="text-xs">No conversations yet</p>
          </div>
        ) : (
          <>
            {/* Pinned */}
            {pinned.length > 0 && (
              <div>
                <p className="text-[10px] uppercase font-semibold text-muted-foreground px-3 pt-3 pb-1 tracking-wider">
                  Pinned
                </p>
                {pinned.map(conv => (
                  <ConvItem
                    key={conv.id} conv={conv} activeId={activeId} onSelect={onSelect}
                    onArchive={onArchive} onDelete={onDelete} onRename={onRename}
                    onTogglePin={onTogglePin} onMoveToFolder={onMoveToFolder}
                    onDuplicate={onDuplicate} folders={folders}
                  />
                ))}
              </div>
            )}

            {/* Folders */}
            {hasFolders && (
              <div>
                <p className="text-[10px] uppercase font-semibold text-muted-foreground px-3 pt-3 pb-1 tracking-wider">
                  Folders
                </p>
                {folders.map(folder => (
                  <FolderSection
                    key={folder.id} folder={folder}
                    conversations={conversations} activeId={activeId}
                    onSelect={onSelect} onArchive={onArchive} onDelete={onDelete}
                    onRename={onRename} onTogglePin={onTogglePin}
                    onMoveToFolder={onMoveToFolder} onDuplicate={onDuplicate}
                    folders={folders} onRenameFolder={onRenameFolder}
                    onChangeFolderColor={onChangeFolderColor} onDeleteFolder={onDeleteFolder}
                  />
                ))}
              </div>
            )}

            {/* All / Unfoldered — drop target to remove from folder */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOverAll(true); }}
              onDragLeave={() => setDragOverAll(false)}
              onDrop={handleDropAll}
              className={cn(dragOverAll && "bg-primary/10 rounded")}
            >
              <p className="text-[10px] uppercase font-semibold text-muted-foreground px-3 pt-3 pb-1 tracking-wider">
                {hasFolders || pinned.length > 0 ? "All" : "Recent"}
              </p>
              {unfolderedUnpinned.map(conv => (
                <ConvItem
                  key={conv.id} conv={conv} activeId={activeId} onSelect={onSelect}
                  onArchive={onArchive} onDelete={onDelete} onRename={onRename}
                  onTogglePin={onTogglePin} onMoveToFolder={onMoveToFolder}
                  onDuplicate={onDuplicate} folders={folders}
                />
              ))}
            </div>

            {/* Archived section */}
            {archivedConversations.length > 0 && (
              <div>
                <button
                  onClick={() => setShowArchived(!showArchived)}
                  className="flex items-center gap-2 w-full px-3 pt-3 pb-1 hover:bg-secondary/30 transition-colors"
                >
                  <ChevronRight className={cn("w-3 h-3 text-muted-foreground transition-transform", showArchived && "rotate-90")} />
                  <Archive className="w-3 h-3 text-muted-foreground" />
                  <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">
                    Archived
                  </span>
                  <span className="text-[10px] text-muted-foreground ml-auto">{archivedConversations.length}</span>
                </button>
                {showArchived && archivedConversations.map(conv => (
                  <div
                    key={conv.id}
                    onClick={() => onSelect(conv.id)}
                    className={cn(
                      "flex items-start gap-2 px-3 py-2.5 cursor-pointer transition-colors border-l-2 group opacity-60 hover:opacity-100",
                      activeId === conv.id ? "bg-primary/10 border-l-primary" : "border-l-transparent hover:bg-secondary/50"
                    )}
                  >
                    <div className="w-7 h-7 rounded-full bg-muted/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Archive className="w-3 h-3 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{getDisplayTitle(conv)}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {conv.last_message_at
                          ? formatDistanceToNow(new Date(conv.last_message_at), { addSuffix: true })
                          : formatDistanceToNow(new Date(conv.created_at), { addSuffix: true })}
                      </p>
                    </div>
                    <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        className="p-1 rounded hover:bg-secondary text-muted-foreground"
                        onClick={(e) => { e.stopPropagation(); onUnarchive(conv.id); }}
                        title="Unarchive"
                      >
                        <ArchiveRestore className="w-3.5 h-3.5" />
                      </button>
                      <button
                        className="p-1 rounded hover:bg-secondary text-destructive"
                        onClick={(e) => { e.stopPropagation(); onDelete(conv.id); }}
                        title="Delete permanently"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
        </div>
        <div aria-hidden className={cn("pointer-events-none absolute inset-x-0 top-0 h-4 bg-gradient-to-b from-card/80 to-transparent transition-opacity duration-200", showTopShadow ? "opacity-100" : "opacity-0")} />
        <div aria-hidden className={cn("pointer-events-none absolute inset-x-0 bottom-0 h-4 bg-gradient-to-t from-card/80 to-transparent transition-opacity duration-200", showBottomShadow ? "opacity-100" : "opacity-0")} />
      </div>

      <NewFolderDialog
        open={folderDialogOpen}
        onOpenChange={setFolderDialogOpen}
        onCreate={onCreateFolder}
      />
    </div>
  );
}
