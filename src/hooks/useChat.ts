import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { mockProxyProtect } from "@/lib/mock-data";
import type { FileAttachment } from "@/components/app/chat/FileAttachment";

const PROXY_URL = import.meta.env.VITE_PROXY_URL;

interface Conversation {
  id: string;
  title: string;
  pipeline_id: string;
  total_messages: number;
  total_pii_detected: number;
  total_pii_protected: number;
  last_message_at: string | null;
  created_at: string;
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

export function useChat() {
  const { user, profile } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [activePipelineId, setActivePipelineId] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
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
          if (!activePipelineId) setActivePipelineId(data[0].id);
        }
      });
  }, [profile?.org_id]);

  const fetchConversations = useCallback(async () => {
    if (!user) return;
    setLoadingConversations(true);
    const { data } = await supabase
      .from("conversations")
      .select("*")
      .eq("is_archived", false)
      .order("last_message_at", { ascending: false, nullsFirst: false });
    setConversations((data as Conversation[]) ?? []);
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

  const archiveConversation = useCallback(async (id: string) => {
    await supabase.from("conversations").update({ is_archived: true }).eq("id", id);
    if (activeConversationId === id) {
      setActiveConversationId(null);
      setMessages([]);
    }
    await fetchConversations();
  }, [activeConversationId, fetchConversations]);

  const generateMockResponse = (protectedText: string, detections: any[], hasFile: boolean): string => {
    const hasFinancial = detections.some((d: any) => ["iban", "dni", "ssn"].includes(d.type));
    const hasPersonal = detections.some((d: any) => ["full_name", "email"].includes(d.type));
    const count = detections.length;

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
          body: JSON.stringify({ prompt: fullText, pipeline_id: activePipelineId, options: { mode: "tokenise", include_detections: true, reversible: true } }),
        });
        const data = await res.json();
        protectedText = data.protected_prompt;
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

    await new Promise((r) => setTimeout(r, 1000 + Math.random() * 1500));
    const responseText = generateMockResponse(protectedText, detections, !!fileAttachment);

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
  }, [user, profile?.org_id, activeConversationId, activePipelineId, pipelines, sending, createConversation, fetchConversations]);

  return {
    conversations,
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
    sendMessage,
  };
}
