"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { useSession } from "../lib/auth-client";
import ChatMessage from "./ChatMessage";
import AuthModal from "./AuthModal";
import { chatApi, decodeSources, type ChatMessageDTO, type Source } from "../lib/api";

interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
}

interface ChatBoxProps {
  currentChatId: string | null;
  onChatIdChange: (chatId: string | null) => void;
}

const SUGGESTIONS = [
  "Wudu (ablution) ka sahih tareeqa kya hai?",
  "Namaz mein surah Fatiha ke baad Ameen kaise kahein?",
  "مسافر کے احکام کیا ہیں؟",
  "سجدۂ سہو کب واجب ہوتا ہے؟",
];

export default function ChatBox({ currentChatId, onChatIdChange }: ChatBoxProps) {
  const { data: session } = useSession();
  const isSignedIn = !!session?.user;
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const skipNextLoadRef = useRef(false);
  const abortRef = useRef<AbortController | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const pendingTextRef = useRef<string | null>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-grow the textarea
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, [input]);

  const loadChatMessages = useCallback(async (chatId: string) => {
    try {
      const res = await chatApi.messages(chatId);
      if (res.ok) {
        const data = await res.json();
        const msgs: ChatMessageDTO[] = data.messages || [];
        setMessages(msgs.map((m) => ({ role: m.role, content: m.content })));
      }
    } catch (err) {
      console.error("Failed to load messages:", err);
    }
  }, []);

  // Load chat messages when chat_id changes
  useEffect(() => {
    if (skipNextLoadRef.current) {
      skipNextLoadRef.current = false;
      return;
    }
    if (currentChatId) loadChatMessages(currentChatId);
    else setMessages([]);
  }, [currentChatId, loadChatMessages]);

  const streamReply = useCallback(
    async (text: string) => {
      setLoading(true);
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await chatApi.send(
          { content: text, chat_id: currentChatId },
          controller.signal
        );
        if (!res.ok) {
          // Surface a clear, status-specific message instead of throwing a bare
          // error (which only showed up as a noisy dev overlay).
          const msg =
            res.status === 429
              ? "بہت زیادہ درخواستیں۔ براہِ کرم ایک منٹ بعد دوبارہ کوشش کریں۔ / Too many requests — please wait a minute and try again."
              : res.status === 401
              ? "آپ کا سیشن ختم ہو گیا۔ براہِ کرم دوبارہ سائن اِن کریں۔ / Your session expired — please sign in again."
              : "معذرت، اس وقت جواب نہیں مل سکا۔ تھوڑی دیر بعد دوبارہ کوشش کریں۔ / Sorry, the server could not respond right now. Please try again.";
          setMessages((prev) => [...prev, { role: "assistant", content: msg }]);
          return;
        }

        const xChatId = res.headers.get("X-Chat-Id");
        if (xChatId && xChatId !== currentChatId) {
          skipNextLoadRef.current = true;
          onChatIdChange(xChatId);
        }

        const sources = decodeSources(res.headers.get("X-Sources"));
        setMessages((prev) => [...prev, { role: "assistant", content: "", sources }]);

        const reader = res.body?.getReader();
        if (!reader) throw new Error("No reader available");

        const decoder = new TextDecoder();
        let accumulated = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          accumulated += decoder.decode(value, { stream: true });
          setMessages((prev) => {
            const copy = [...prev];
            copy[copy.length - 1] = { role: "assistant", content: accumulated, sources };
            return copy;
          });
        }
      } catch (err) {
        if ((err as Error).name === "AbortError") return; // user stopped; keep partial text
        console.error(err);
        setMessages((prev) => {
          const copy = [...prev];
          const last = copy[copy.length - 1];
          if (last && last.role === "assistant" && !last.content) {
            copy[copy.length - 1] = {
              role: "assistant",
              content:
                "معذرت، بیک اینڈ تک رسائی نہ ہو سکی۔ / Could not reach the server. Please try again.",
            };
          }
          return copy;
        });
      } finally {
        setLoading(false);
        abortRef.current = null;
      }
    },
    [currentChatId, onChatIdChange]
  );

  const sendMessage = useCallback(() => {
    const text = input.trim();
    if (!text || loading) return;
    // Require sign-in before the first message can be sent. Keep the typed text,
    // open the auth modal, and send it automatically once the user is in.
    if (!isSignedIn) {
      pendingTextRef.current = text;
      setShowAuth(true);
      return;
    }
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setInput("");
    streamReply(text);
  }, [input, loading, isSignedIn, streamReply]);

  // After a successful sign in / sign up, send the message the guest was trying to send.
  const handleAuthSuccess = useCallback(() => {
    const pending = pendingTextRef.current;
    pendingTextRef.current = null;
    if (!pending) return;
    setMessages((prev) => [...prev, { role: "user", content: pending }]);
    setInput("");
    streamReply(pending);
  }, [streamReply]);

  const stopGenerating = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const regenerate = useCallback(() => {
    if (loading) return;
    // find the last user message
    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    if (!lastUser) return;
    setMessages((prev) => {
      const copy = [...prev];
      if (copy[copy.length - 1]?.role === "assistant") copy.pop();
      return copy;
    });
    streamReply(lastUser.content);
  }, [loading, messages, streamReply]);

  const showRegenerate =
    !loading && messages.length > 0 && messages[messages.length - 1].role === "assistant";

  return (
    <div className="chat-container">
      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="chat-empty">
            <div className="chat-empty-icon">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/AI-Mufti.png" alt="AI Mufti" width={48} height={48} />
            </div>
            <h3>Assalamu Alaikum 👋</h3>
            <p>
              Ask any Islamic question. AI Mufti answers according to the Sunni Hanafi
              Ahl-e-Sunnat wa Jama&apos;at school, with references to authentic sources such as
              Fatawa Razvia and Bahar-e-Shariat.
            </p>
            <div className="chat-suggestions">
              {SUGGESTIONS.map((s) => (
                <button key={s} type="button" onClick={() => setInput(s)} dir="auto">
                  {s}
                </button>
              ))}
            </div>
            <p className="chat-empty-note">
              AI Mufti is an assistant and can make mistakes. For important rulings, confirm
              with a qualified mufti or Dar al-Ifta.
            </p>
          </div>
        ) : (
          messages.map((m, i) => (
            <ChatMessage
              key={i}
              role={m.role}
              content={m.content}
              isStreaming={
                loading && i === messages.length - 1 && m.role === "assistant" && !m.content
              }
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-container">
        <div className="chat-input-actions">
          {loading && (
            <button type="button" className="pill-button" onClick={stopGenerating}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="6" width="12" height="12" rx="2" />
              </svg>
              Stop
            </button>
          )}
          {showRegenerate && (
            <button type="button" className="pill-button" onClick={regenerate}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 4v6h-6M1 20v-6h6" />
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
              </svg>
              Regenerate
            </button>
          )}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          className="chat-input-form"
        >
          <div className="chat-input-wrapper">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Message AI Mufti…"
              rows={1}
              className="chat-input"
              dir="auto"
              aria-label="Message AI Mufti"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="send-button"
              aria-label="Send message"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2.01 21L23 12L2.01 3L2 10L17 12L2 14L2.01 21Z" fill="currentColor" />
              </svg>
            </button>
          </div>
          <p className="input-footer">
            {isSignedIn
              ? "AI Mufti can make mistakes. Verify important rulings with a qualified mufti."
              : "Sign in to save your chats. AI Mufti can make mistakes — verify important rulings."}
          </p>
        </form>
      </div>

      <AuthModal
        open={showAuth}
        onClose={() => setShowAuth(false)}
        onSuccess={handleAuthSuccess}
        title="Sign in to send your message"
        description="Create a free account or sign in to chat with AI Mufti and keep your conversation history."
      />
    </div>
  );
}
