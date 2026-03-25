import { useState, useRef, useCallback } from "react";
import { useChat } from "@/hooks/useChat";
import { useFileAttachment } from "@/components/app/chat/FileAttachment";
import { ConversationList } from "@/components/app/chat/ConversationList";
import { ChatArea } from "@/components/app/chat/ChatArea";
import { PipelineSelector } from "@/components/app/chat/PipelineSelector";

const PASTE_THRESHOLD = 500;

interface PastedText {
  content: string;
  charCount: number;
}

const Chat = () => {
  const chat = useChat();
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { attachment, attachFile, removeAttachment } = useFileAttachment();
  const [pastedText, setPastedText] = useState<PastedText | null>(null);

  const handleSend = async () => {
    if (!input.trim() && !attachment && !pastedText) return;
    if (chat.sending) return;
    // Combine typed input + pasted text
    const parts: string[] = [];
    if (pastedText) parts.push(pastedText.content);
    if (input.trim()) parts.push(input.trim());
    const text = parts.join("\n\n");
    const file = attachment;
    setInput("");
    setPastedText(null);
    removeAttachment();
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    await chat.sendMessage(text, file);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  /** Intercept paste: if pasted content is long, convert to "pasted text" attachment */
  const handleSetInput = useCallback((value: string) => {
    // Check if this looks like a paste (large jump in content length)
    const lengthDiff = value.length - input.length;
    if (lengthDiff >= PASTE_THRESHOLD) {
      // Extract the pasted portion
      const pasted = value.slice(input.length);
      setPastedText(prev => ({
        content: prev ? prev.content + "\n\n" + pasted : pasted,
        charCount: (prev ? prev.charCount : 0) + pasted.length,
      }));
      // Don't update the textarea with the pasted text
      return;
    }
    setInput(value);
  }, [input]);

  return (
    <div className="flex h-[calc(100vh)] overflow-hidden">
      <ConversationList
        conversations={chat.conversations}
        archivedConversations={chat.archivedConversations}
        activeId={chat.activeConversationId}
        onSelect={chat.setActiveConversationId}
        onNew={chat.createConversation}
        onArchive={chat.archiveConversation}
        onUnarchive={chat.unarchiveConversation}
        onDelete={chat.deleteConversation}
        onRename={chat.renameConversation}
        onTogglePin={chat.togglePin}
        onMoveToFolder={chat.moveToFolder}
        onDuplicate={chat.duplicateConversation}
        loading={chat.loadingConversations}
        folders={chat.folders}
        onCreateFolder={chat.createFolder}
        onRenameFolder={chat.renameFolder}
        onChangeFolderColor={chat.changeFolderColor}
        onDeleteFolder={chat.deleteFolder}
      />
      <ChatArea
        messages={chat.messages}
        sending={chat.sending}
        loading={chat.loadingMessages}
        activeConversationId={chat.activeConversationId}
        activePipeline={chat.pipelines.find((p) => p.id === chat.activePipelineId)}
        isProxyActive={chat.isProxyActive}
        input={input}
        setInput={handleSetInput}
        textareaRef={textareaRef}
        onSend={handleSend}
        onKeyDown={handleKeyDown}
        messagesEndRef={chat.messagesEndRef}
        attachment={attachment}
        onAttachFile={attachFile}
        onRemoveAttachment={removeAttachment}
        onEditMessage={chat.editMessage}
        pastedText={pastedText}
        onRemovePastedText={() => setPastedText(null)}
      />
      <PipelineSelector pipelines={chat.pipelines} activePipelineId={chat.activePipelineId} onSelect={chat.setActivePipelineId} />
    </div>
  );
};

export default Chat;
