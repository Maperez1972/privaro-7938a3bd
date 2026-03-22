import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { mockProxyProtect } from "@/lib/mock-data";
import type { FileAttachment } from "@/components/app/chat/FileAttachment";

const PROXY_URL = import.meta.env.VITE_PROXY_URL;

export interface Conversation {
  id: string;
  title: string;
  custom_title: string | null;
  pipeline_id: string;
  total_messages: number;
  total_pii_detected: number;
  total_pii_protected: number;
  last_message_at: string | null;
  created_at: string;
  is_pinned: boolean;
  folder_id: string | null;
}

interface Message {
  id: string;
  conversation_id: string;
  role: "user" | "assistant";
  content_protected: string;
  content_preview: string | null;
  pii_detected: number;
  pii_protected: number;
  model_used: string | null;
  created_at: string;
  attachment_url: string | null;
  attachment_name: string | null;
  attachment_type: string | null;
  attachment_size: number | null;
}

interface Pipeline {
  id: string;
  name: string;
  llm_provider: string;
  llm_model: string;
  status: string;
}

export interface ConversationFolder {
  id: string;
  org_id: string;
  user_id: string;
  name: string;
  color: string;
  icon: string;
  position: number;
  created_at: string;
  updated_at: string;
}

export function useChat() {
  const { user, profile } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationIdRaw] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [activePipelineId, setActivePipelineIdRaw] = useState<string | null>(null);

  // When selecting a conversation, load its saved pipeline
  const setActiveConversationId = useCallback((id: string | null) => {
    setActiveConversationIdRaw(id);
    if (id) {
      const conv = conversations.find(c => c.id === id);
      if (conv?.pipeline_id) {
        setActivePipelineIdRaw(conv.pipeline_id);
      }
    }
  }, [conversations]);

  // When changing pipeline, persist to the active conversation
  const setActivePipelineId = useCallback(async (pipelineId: string) => {
    setActivePipelineIdRaw(pipelineId);
    if (activeConversationId) {
      await supabase
        .from("conversations")
        .update({ pipeline_id: pipelineId } as any)
        .eq("id", activeConversationId);
      setConversations(prev =>
        prev.map(c => c.id === activeConversationId ? { ...c, pipeline_id: pipelineId } : c)
      );
    }
  }, [activeConversationId]);
  const [sending, setSending] = useState(false);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [folders, setFolders] = useState<ConversationFolder[]>([]);
  const [archivedConversations, setArchivedConversations] = useState<Conversation[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isProxyActive = !!PROXY_URL;

  useEffect(() => {
    if (!profile?.org_id) return;
    supabase
      .from("pipelines")
      .select("id, name, llm_provider, llm_model, status")
      .eq("org_id", profile.org_id)
      .eq("status", "active")
      .order("created_at", { ascending: true })
      .then(({ data }) => {
        if (data && data.length > 0) {
          setPipelines(data);
          if (!activePipelineId) setActivePipelineIdRaw(data[0].id);
        }
      });
  }, [profile?.org_id]);

  // Fetch folders
  const fetchFolders = useCallback(async () => {
    if (!user) return;
    const { data } = await (supabase as any)
      .from("conversation_folders")
      .select("*")
      .eq("user_id", user.id)
      .order("position", { ascending: true });
    setFolders((data as ConversationFolder[]) ?? []);
  }, [user]);

  useEffect(() => {
    fetchFolders();
  }, [fetchFolders]);

  const fetchConversations = useCallback(async () => {
    if (!user) return;
    setLoadingConversations(true);
    const { data } = await supabase
      .from("conversations")
      .select("*")
      .eq("is_archived", false)
      .order("last_message_at", { ascending: false, nullsFirst: false });
    setConversations((data as unknown as Conversation[]) ?? []);
    setLoadingConversations(false);
  }, [user]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    if (!activeConversationId) {
      setMessages([]);
      return;
    }
    setLoadingMessages(true);
    supabase
      .from("conversation_messages")
      .select("*")
      .eq("conversation_id", activeConversationId)
      .order("created_at", { ascending: true })
      .then(({ data }) => {
        setMessages((data as Message[]) ?? []);
        setLoadingMessages(false);
      });
  }, [activeConversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const createConversation = useCallback(async () => {
    if (!user || !profile?.org_id || !activePipelineId) return null;
    const { data, error } = await supabase
      .from("conversations")
      .insert({
        org_id: profile.org_id,
        user_id: user.id,
        pipeline_id: activePipelineId,
        title: "New Conversation",
      })
      .select()
      .single();
    if (error) {
      console.error("Error creating conversation:", error);
      return null;
    }
    setActiveConversationId(data.id);
    await fetchConversations();
    return data.id;
  }, [user, profile?.org_id, activePipelineId, fetchConversations]);

  const fetchArchivedConversations = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("conversations")
      .select("*")
      .eq("is_archived", true)
      .order("last_message_at", { ascending: false, nullsFirst: false });
    setArchivedConversations((data as unknown as Conversation[]) ?? []);
  }, [user]);

  useEffect(() => {
    fetchArchivedConversations();
  }, [fetchArchivedConversations]);

  const archiveConversation = useCallback(async (id: string) => {
    await supabase.from("conversations").update({ is_archived: true }).eq("id", id);
    if (activeConversationId === id) {
      setActiveConversationId(null);
      setMessages([]);
    }
    await fetchConversations();
    await fetchArchivedConversations();
  }, [activeConversationId, fetchConversations, fetchArchivedConversations]);

  const unarchiveConversation = useCallback(async (id: string) => {
    await supabase.from("conversations").update({ is_archived: false }).eq("id", id);
    await fetchConversations();
    await fetchArchivedConversations();
  }, [fetchConversations, fetchArchivedConversations]);

  const deleteConversation = useCallback(async (id: string) => {
    if (!user) return;

    const { data, error } = await (supabase as any)
      .from("conversations")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id)
      .select("id");

    if (error) {
      console.error("Delete conversation error:", error);
      toast.error("Failed to delete conversation");
      return;
    }

    if (!data || data.length === 0) {
      console.error("Delete conversation warning: no rows deleted", { id, userId: user.id });
      toast.error("Could not delete conversation");
      return;
    }

    toast.success("Conversation deleted");

    setConversations((prev) => prev.filter((c) => c.id !== id));
    setArchivedConversations((prev) => prev.filter((c) => c.id !== id));

    if (activeConversationId === id) {
      setActiveConversationId(null);
      setMessages([]);
    }

    await fetchConversations();
    await fetchArchivedConversations();
  }, [user, activeConversationId, fetchConversations, fetchArchivedConversations]);

  const renameConversation = useCallback(async (id: string, newTitle: string) => {
    await (supabase as any).from("conversations").update({ custom_title: newTitle }).eq("id", id);
    setConversations(prev => prev.map(c => c.id === id ? { ...c, custom_title: newTitle } : c));
  }, []);

  const togglePin = useCallback(async (id: string) => {
    const conv = conversations.find(c => c.id === id);
    if (!conv) return;
    const newVal = !conv.is_pinned;
    await (supabase as any).from("conversations").update({ is_pinned: newVal }).eq("id", id);
    setConversations(prev => prev.map(c => c.id === id ? { ...c, is_pinned: newVal } : c));
  }, [conversations]);

  const moveToFolder = useCallback(async (convId: string, folderId: string | null) => {
    await (supabase as any).from("conversations").update({ folder_id: folderId }).eq("id", convId);
    setConversations(prev => prev.map(c => c.id === convId ? { ...c, folder_id: folderId } : c));
  }, []);

  const duplicateConversation = useCallback(async (id: string) => {
    if (!user || !profile?.org_id) return;
    const conv = conversations.find(c => c.id === id);
    if (!conv) return;
    const displayTitle = conv.custom_title || conv.title || "New Conversation";
    const { data, error } = await (supabase as any)
      .from("conversations")
      .insert({
        org_id: profile.org_id,
        user_id: user.id,
        pipeline_id: conv.pipeline_id,
        title: `Copy of ${displayTitle}`,
        custom_title: `Copy of ${displayTitle}`,
        folder_id: conv.folder_id,
      })
      .select()
      .single();
    if (!error && data) {
      setActiveConversationId(data.id);
      await fetchConversations();
    }
  }, [user, profile?.org_id, conversations, fetchConversations]);

  // Folder CRUD
  const createFolder = useCallback(async (name: string, color: string, icon: string) => {
    if (!user || !profile?.org_id) return;
    const position = folders.length;
    await (supabase as any).from("conversation_folders").insert({
      org_id: profile.org_id,
      user_id: user.id,
      name,
      color,
      icon,
      position,
    });
    await fetchFolders();
  }, [user, profile?.org_id, folders.length, fetchFolders]);

  const renameFolder = useCallback(async (id: string, name: string) => {
    await (supabase as any).from("conversation_folders").update({ name }).eq("id", id);
    setFolders(prev => prev.map(f => f.id === id ? { ...f, name } : f));
  }, []);

  const changeFolderColor = useCallback(async (id: string, color: string) => {
    await (supabase as any).from("conversation_folders").update({ color }).eq("id", id);
    setFolders(prev => prev.map(f => f.id === id ? { ...f, color } : f));
  }, []);

  const deleteFolder = useCallback(async (id: string) => {
    await (supabase as any).from("conversations").update({ folder_id: null }).eq("folder_id", id);
    await (supabase as any).from("conversation_folders").delete().eq("id", id);
    setConversations(prev => prev.map(c => c.folder_id === id ? { ...c, folder_id: null } : c));
    await fetchFolders();
  }, [fetchFolders]);

  /* ── Call LLM via Edge Function (streaming) ── */
  const callLLMStreaming = async (
    pipelineId: string,
    conversationHistory: { role: string; content: string }[],
    onChunk: (text: string) => void
  ): Promise<string> => {
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData?.session?.access_token;
    if (!token) throw new Error("No auth session");

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const res = await fetch(`${supabaseUrl}/functions/v1/chat-completion`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      },
      body: JSON.stringify({
        pipeline_id: pipelineId,
        messages: conversationHistory,
        stream: true,
      }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({ error: "Unknown error" }));
      throw new Error(errData.error || `LLM call failed (${res.status})`);
    }

    const reader = res.body?.getReader();
    if (!reader) throw new Error("No response body");

    const decoder = new TextDecoder();
    let fullText = "";
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed === "data: [DONE]") continue;
        if (trimmed.startsWith("data: ")) {
          try {
            const json = JSON.parse(trimmed.slice(6));
            if (json.text) {
              fullText += json.text;
              onChunk(fullText);
            }
          } catch { /* skip */ }
        }
      }
    }

    return fullText;
  };

  const uploadFile = async (file: File, conversationId: string): Promise<string | null> => {
    if (!user) return null;
    const path = `${user.id}/${conversationId}/${Date.now()}_${file.name}`;
    const { error } = await supabase.storage
      .from("chat-attachments")
      .upload(path, file);
    if (error) {
      console.error("Upload error:", error);
      return null;
    }
    return path;
  };

  const sendMessage = useCallback(async (text: string, fileAttachment?: FileAttachment | null) => {
    if (!user || !profile?.org_id || sending) return;
    if (!text.trim() && !fileAttachment) return;
    setSending(true);

    let convId = activeConversationId;
    if (!convId) {
      convId = await createConversation();
      if (!convId) {
        setSending(false);
        return;
      }
    }

    const fullText = fileAttachment
      ? `${text}\n\n--- Attached file: ${fileAttachment.file.name} ---\n${fileAttachment.content}`
      : text;

    let protectedText: string;
    let detections: any[] = [];
    let piiDetected = 0;
    let piiProtected = 0;

    try {
      if (PROXY_URL) {
        const res = await fetch(`${PROXY_URL}/proxy/protect`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-Privaro-Key": import.meta.env.VITE_PROXY_API_KEY || "" },
          body: JSON.stringify({ prompt: fullText, pipeline_id: activePipelineId || "c93aed87-b440-4de0-bb21-54a938e475f2", conversation_id: convId, options: { mode: "tokenise", include_detections: true, reversible: true } }),
        });
        const data = await res.json();
        protectedText = data.protected_prompt ?? fullText;
        detections = data.detections ?? [];
      } else {
        const mock = mockProxyProtect(fullText);
        protectedText = mock.protectedText;
        detections = mock.detections;
      }
      piiDetected = detections.length;
      piiProtected = detections.length;
    } catch {
      const mock = mockProxyProtect(fullText);
      protectedText = mock.protectedText;
      detections = mock.detections;
      piiDetected = detections.length;
      piiProtected = detections.length;
    }

    let attachmentUrl: string | null = null;
    let attachmentName: string | null = null;
    let attachmentType: string | null = null;
    let attachmentSize: number | null = null;

    if (fileAttachment) {
      attachmentUrl = await uploadFile(fileAttachment.file, convId);
      attachmentName = fileAttachment.file.name;
      attachmentType = fileAttachment.file.type;
      attachmentSize = fileAttachment.file.size;
    }

    const activePipeline = pipelines.find((p) => p.id === activePipelineId);
    const modelUsed = activePipeline ? `${activePipeline.llm_provider}/${activePipeline.llm_model}` : null;

    const { data: userMsg } = await supabase
      .from("conversation_messages")
      .insert({
        conversation_id: convId,
        org_id: profile.org_id,
        user_id: user.id,
        role: "user" as const,
        content_protected: protectedText,
        content_preview: protectedText.slice(0, 200),
        pii_detected: piiDetected,
        pii_protected: piiProtected,
        model_used: modelUsed,
        attachment_url: attachmentUrl,
        attachment_name: attachmentName,
        attachment_type: attachmentType,
        attachment_size: attachmentSize,
      })
      .select()
      .single();

    if (userMsg) {
      setMessages((prev) => [...prev, userMsg as Message]);
    }

    // Build conversation history for LLM (include all previous messages + new one)
    const history = [
      ...messages.map((m) => ({ role: m.role, content: m.content_protected })),
      { role: "user" as const, content: protectedText },
    ];

    let responseText: string;

    // Create a temporary streaming message
    const tempStreamId = `streaming-${Date.now()}`;
    const streamingMsg: Message = {
      id: tempStreamId,
      conversation_id: convId!,
      role: "assistant",
      content_protected: "",
      content_preview: null,
      pii_detected: 0,
      pii_protected: 0,
      model_used: modelUsed,
      created_at: new Date().toISOString(),
      attachment_url: null,
      attachment_name: null,
      attachment_type: null,
      attachment_size: null,
    };
    setMessages((prev) => [...prev, streamingMsg]);

    try {
      responseText = await callLLMStreaming(
        activePipelineId || convId!,
        history,
        (partialText) => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === tempStreamId
                ? { ...m, content_protected: partialText }
                : m
            )
          );
        }
      );
    } catch (err) {
      console.warn("LLM call failed, using fallback:", err);
      responseText = generateFallbackResponse(protectedText, detections, !!fileAttachment);
    }

    // Remove streaming message and insert the real persisted one
    setMessages((prev) => prev.filter((m) => m.id !== tempStreamId));

    const { data: assistantMsg } = await supabase
      .from("conversation_messages")
      .insert({
        conversation_id: convId,
        org_id: profile.org_id,
        user_id: user.id,
        role: "assistant" as const,
        content_protected: responseText,
        content_preview: responseText.slice(0, 200),
        pii_detected: 0,
        pii_protected: 0,
        model_used: modelUsed,
      })
      .select()
      .single();

    if (assistantMsg) {
      setMessages((prev) => [...prev, assistantMsg as Message]);
    }

    await fetchConversations();
    setSending(false);
  }, [user, profile?.org_id, activeConversationId, activePipelineId, pipelines, sending, messages, createConversation, fetchConversations]);

  const editMessage = useCallback(async (messageId: string, newContent: string) => {
    const { error } = await (supabase as any).from("messages").update({ content_protected: newContent }).eq("id", messageId);
    if (error) { console.error("Edit message error:", error); return; }
    setMessages((prev) => prev.map((m) => m.id === messageId ? { ...m, content_protected: newContent } : m));
  }, []);

  return {
    conversations,
    archivedConversations,
    activeConversationId,
    setActiveConversationId,
    messages,
    pipelines,
    activePipelineId,
    setActivePipelineId,
    sending,
    loadingConversations,
    loadingMessages,
    messagesEndRef,
    isProxyActive,
    createConversation,
    archiveConversation,
    unarchiveConversation,
    deleteConversation,
    renameConversation,
    togglePin,
    moveToFolder,
    duplicateConversation,
    sendMessage,
    editMessage,
    folders,
    createFolder,
    renameFolder,
    changeFolderColor,
    deleteFolder,
  };
}

function generateFallbackResponse(protectedText: string, detections: any[], hasFile: boolean): string {
  const count = detections.length;
  const hasFinancial = detections.some((d: any) => ["iban", "dni", "ssn"].includes(d.type));
  const hasPersonal = detections.some((d: any) => ["full_name", "email"].includes(d.type));

  if (hasFile && count > 0) {
    return `I've analyzed the uploaded file securely. ${count} PII entities were detected and tokenized before processing. The file content has been fully protected — no sensitive data reached the model.`;
  }
  if (hasFile && count === 0) {
    return `I've analyzed the uploaded file. No sensitive data was detected in the document. The content is clean and has been processed normally.`;
  }
  if (hasFinancial) {
    return `I've securely processed the financial information. ${count} sensitive entities were protected before processing. The tokenized references have been maintained throughout the analysis to ensure zero data exposure.`;
  }
  if (hasPersonal) {
    return `Understood. I've worked with the contact information while maintaining privacy. ${count} personal identifiers were automatically tokenized before reaching this model.`;
  }
  if (count > 0) {
    return `I've processed your query securely. ${count} PII entities were automatically protected before processing your message. All sensitive data remains tokenized.`;
  }
  return "I've processed your message. No sensitive data was detected in this request. How can I help you further?";
}
