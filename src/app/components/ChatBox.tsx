"use client";

import React, { useEffect, useRef, useState } from "react";
import ChatMessage from "./ChatMessage";
import { useUser } from "@clerk/nextjs";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatBoxProps {
  currentChatId: string | null;
  onChatIdChange: (chatId: string | null) => void;
}

export default function ChatBox({ currentChatId, onChatIdChange }: ChatBoxProps) {
  const { user } = useUser();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://digital-mufti-backend.onrender.com";
  const userId = user?.id || "guest";

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load chat messages when chat_id changes
  useEffect(() => {
    if (currentChatId) {
      loadChatMessages(currentChatId);
    } else {
      setMessages([]);
    }
  }, [currentChatId]);

  const loadChatMessages = async (chatId: string) => {
    try {
      const res = await fetch(`${API_URL}/api/chats/${chatId}/messages?user_id=${userId}`);
      if (res.ok) {
        const data = await res.json();
        const msgs = data.messages || [];
        setMessages(msgs.map((m: any) => ({
          role: m.role as "user" | "assistant",
          content: m.content
        })));
      }
    } catch (err) {
      console.error("Failed to load messages:", err);
    }
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text) return;

    const userMessage: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/chat${currentChatId ? `/${currentChatId}` : ""}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, content: text }),
      });

      if (!res.ok) throw new Error(res.statusText);

      // Check for new chat_id in headers
      const xChatId = res.headers.get("X-Chat-Id");
      if (xChatId && xChatId !== currentChatId) {
        onChatIdChange(xChatId);
      }

      // Create empty assistant message placeholder
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      const reader = res.body?.getReader();
      if (!reader) {
        throw new Error("No reader available");
      }

      const decoder = new TextDecoder();
      let accumulated = "";

      // Read stream chunk by chunk
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        accumulated += chunk;

        // Update the last message (assistant) with accumulated text
        setMessages((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = { role: "assistant", content: accumulated };
          return copy;
        });
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => {
        const copy = [...prev];
        copy[copy.length - 1] = { role: "assistant", content: "Could not reach backend. Please try again." };
        return copy;
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-container">
      {/* Chat Messages Area */}
      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="chat-empty">
            <div className="chat-empty-icon">
              <img
                src="/AI-Mufti.png"
                alt="AI Mufti"
                width={48}
                height={48}
                className="w-12 h-12"
              />
            </div>
            <h3>How can I help you today?</h3>
            <p>Ask any Islamic question and AI Mufti will provide guidance based on the Hanafi school of thought.</p>
            <div className="chat-suggestions">
              <button onClick={() => setInput("What are the five pillars of Islam?")}>What are the five pillars of Islam?</button>
              <button onClick={() => setInput("Is Zakat obligatory?")}>Is Zakat obligatory?</button>
              <button onClick={() => setInput("Can I pray Salat al-Janazah alone?")}>Can I pray Salat al-Janazah alone?</button>
            </div>
          </div>
        ) : (
          messages.map((m, i) => (
            <ChatMessage
              key={i}
              role={m.role}
              content={m.content}
              isStreaming={loading && i === messages.length - 1 && m.role === "assistant" && !m.content}
            />
          ))
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Sticky Input Area */}
      <div className="chat-input-container">
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
              placeholder="Message AI Mufti..."
              rows={1}
              className="chat-input"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="send-button"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2.01 21L23 12L2.01 3L2 10L17 12L2 14L2.01 21Z" fill="currentColor"/>
              </svg>
            </button>
          </div>
          <p className="input-footer">AI Mufti can make mistakes. Verify important information.</p>
        </form>
      </div>
    </div>
  );
}
