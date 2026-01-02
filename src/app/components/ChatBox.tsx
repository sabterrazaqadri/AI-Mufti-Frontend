"use client";

import React, { useEffect, useRef, useState } from "react";
import ChatMessage from "./ChatMessage";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function ChatBox() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://digital-mufti-backend.onrender.com";

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text) return;

    const userMessage: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: "web_user_001", content: text }),
      });

      if (!res.ok) throw new Error(res.statusText);

      // Create placeholder for assistant message
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      const reader = res.body?.getReader();
      if (!reader) {
        // Fallback: non-streaming response
        const data = await res.json();
        const replyText = typeof data === "string" ? data : data?.reply || JSON.stringify(data);
        setMessages((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = { role: "assistant", content: replyText };
          return copy;
        });
        return;
      }

      const decoder = new TextDecoder();
      let done = false;
      let accumulated = "";

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });

          // Try to parse as JSON first
          try {
            if (chunk.trim().startsWith("{")) {
              const parsed = JSON.parse(chunk);
              if (parsed?.reply) {
                accumulated = parsed.reply;
                setMessages((prev) => {
                  const copy = [...prev];
                  copy[copy.length - 1] = { role: "assistant", content: accumulated };
                  return copy;
                });
                continue;
              }
            }
          } catch (e) {
            // Not JSON, treat as plain text
          }

          // Plain text streaming
          accumulated += chunk;
          setMessages((prev) => {
            const copy = [...prev];
            copy[copy.length - 1] = { role: "assistant", content: accumulated };
            return copy;
          });
        }
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => [...prev, { role: "assistant", content: "Could not reach backend. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-container ">
      {/* Chat Messages Area */}
      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="chat-empty">
            <div className="chat-empty-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 5C13.66 5 15 6.34 15 8C15 9.66 13.66 11 12 11C10.34 11 9 9.66 9 8C9 6.34 10.34 5 12 5ZM12 19.2C9.5 19.2 7.29 17.92 6 15.98C6.03 13.99 10 12.9 12 12.9C13.99 12.9 17.97 13.99 18 15.98C16.71 17.92 14.5 19.2 12 19.2Z" fill="currentColor"/>
              </svg>
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
              isLast={i === messages.length - 1}
            />
          ))
        )}

        {/* Typing Indicator */}
        {loading && (
          <div className="chat-message assistant">
            <div className="message-avatar">
              <div className="avatar ai">AI</div>
            </div>
            <div className="message-bubble">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
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
