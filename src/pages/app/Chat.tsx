import { useState, useRef } from "react";
import { useChat } from "@/hooks/useChat";
import { useFileAttachment } from "@/components/app/chat/FileAttachment";
import { ConversationList } from "@/components/app/chat/ConversationList";
import { ChatArea } from "@/components/app/chat/ChatArea";
import { PipelineSelector } from "@/components/app/chat/PipelineSelector";

const Chat = () => {
  const chat = useChat();
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { attachment, attachFile, removeAttachment } = useFileAttachment();

  const handleSend = async () => {
    if (!input.trim() && !attachment) return;
    if (chat.sending) return;
    const text = input;
    const file = attachment;
    setInput("");
    removeAttachment();
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    await chat.sendMessage(text, file);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  return (
    <div className="flex h-[calc(100vh)] overflow-hidden">
      <ConversationList
        conversations={chat.conversations}
        activeId={chat.activeConversationId}
        onSelect={chat.setActiveConversationId}
        onNew={chat.createConversation}
        onArchive={chat.archiveConversation}
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
      <ChatArea messages={chat.messages} sending={chat.sending} loading={chat.loadingMessages} activeConversationId={chat.activeConversationId} activePipeline={chat.pipelines.find((p) => p.id === chat.activePipelineId)} isProxyActive={chat.isProxyActive} input={input} setInput={setInput} textareaRef={textareaRef} onSend={handleSend} onKeyDown={handleKeyDown} messagesEndRef={chat.messagesEndRef} attachment={attachment} onAttachFile={attachFile} onRemoveAttachment={removeAttachment} />
      <PipelineSelector pipelines={chat.pipelines} activePipelineId={chat.activePipelineId} onSelect={chat.setActivePipelineId} />
    </div>
  );
};

export default Chat;
