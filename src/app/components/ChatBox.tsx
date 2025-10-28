"use client";

import React, { useEffect, useRef, useState } from "react";
import ChatMessage from "./ChatMessage";
import TypingIndicator from "./TypingIndicator";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function ChatBox() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://digital-mufti-backend.onrender.com";

  useEffect(() => {
    // Auto-scroll on new messages
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text) return;

    const userMessage: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      // Start streaming request to backend which returns a streaming text response.
      const res = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: "web_user_001", content: text }),
      });

      if (!res.ok) throw new Error(res.statusText);

      // Prepare a placeholder assistant message and then stream into it.
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      const reader = res.body?.getReader();
      if (!reader) {
        // Some backends return full JSON body instead of stream
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

      // The backend might stream plain text, or NDJSON/JSON chunks like {"reply":"..."}
      const buffer = [] as string[];

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          buffer.push(chunk);

          // Try to parse recent buffer as JSON objects (NDJSON) and extract `reply` if present
          const joined = buffer.join("");

          // Fast path: if chunk looks like JSON object or NDJSON, attempt parsing of last JSON
          try {
            // If backend sends NDJSON, split by newline and parse last full line
            const lines = joined.split(/\r?\n/).filter(Boolean);
            const lastLine = lines[lines.length - 1];
            if (lastLine && lastLine.trim().startsWith("{")) {
              const parsed = JSON.parse(lastLine);
              const replyPart = parsed?.reply;
              if (typeof replyPart === "string") {
                // replace accumulated with only the extracted reply
                accumulated = replyPart;
                setMessages((prev) => {
                  const copy = [...prev];
                  copy[copy.length - 1] = { role: "assistant", content: accumulated };
                  return copy;
                });
                continue;
              }
            }
          } catch (e) {
            // not valid JSON yet, fall back to treating as text
          }

          // Fallback: treat chunk as plain text and append
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
      setMessages((prev) => [...prev, { role: "assistant", content: "⚠️ Could not reach backend." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
  <div className="flex flex-col w-full max-w-full md:max-w-3xl mx-auto h-[60vh] sm:h-[66vh] md:h-[72vh]">
      <div className="flex items-center justify-between mb-3">
        {/* <div>
          <h4 className="text-lg font-semibold">AI Mufti</h4>
          <p className="text-xs text-muted-foreground">Live Q&A — Sunni Hanafi perspective</p>
        </div> */}

        <div className="text-xs text-muted-foreground">Status: {loading ? "Thinking…" : "Ready"}</div>
      </div>

  <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 glass-card rounded-lg">
        {messages.length === 0 && (
          <div className="text-center text-sm text-muted-foreground p-8">
            Ask your first question — AI Mufti will reply thoughtfully and respectfully.
          </div>
        )}

        {messages.map((m, i) => (
          <ChatMessage key={i} sender={m.role === "user" ? "user" : "ai"} message={m.content} />
        ))}

          {loading && <TypingIndicator />}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage();
        }}
        className="mt-3 flex flex-col sm:flex-row items-center gap-3"
        aria-label="Send a question"
      >
        <label htmlFor="chat-input" className="sr-only">Type your question</label>
        <textarea
          id="chat-input"
          aria-label="Type your question"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
            // Enter to send, Shift+Enter for newline
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
          rows={1}
          className="w-full min-h-11 max-h-40 px-4 py-2 rounded-2xl border focus:outline-none focus:ring-2 focus:ring-green-300 resize-none text-sm"
          placeholder="Type your question... "
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-full disabled:opacity-60"
        >
          {loading ? "Thinking…" : "Ask AI Mufti"}
        </button>
      </form>
    </div>
  );
}
