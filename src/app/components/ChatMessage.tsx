"use client";

import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Source } from "../lib/api";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
  isStreaming?: boolean;
}

// Arabic / Urdu script range (global, for counting).
const RTL_CHARS = /[؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿]/g;
const LATIN_CHARS = /[A-Za-z]/g;

// A message is RTL only if Arabic/Urdu letters DOMINATE — so a Roman-Urdu answer
// that merely contains "وعلیکم السلام" stays left-to-right (numbers on the left).
const isRtl = (text: string) => {
  const rtl = (text.match(RTL_CHARS) || []).length;
  const ltr = (text.match(LATIN_CHARS) || []).length;
  return rtl > ltr;
};

// Render text as GitHub-flavoured Markdown so headings, bold, lists, tables and
// blockquotes show the way the model intends them. Links open safely and wide
// tables can scroll on small screens.
const MD_COMPONENTS = {
  a: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a {...props} target="_blank" rel="noopener noreferrer" />
  ),
  table: (props: React.TableHTMLAttributes<HTMLTableElement>) => (
    <div className="md-table-wrap">
      <table {...props} />
    </div>
  ),
};

export default function ChatMessage({ role, content, sources }: ChatMessageProps) {
  const [copied, setCopied] = useState(false);
  const isUser = role === "user";
  const rtl = isRtl(content);

  const handleCopy = async () => {
    if (!content) return;
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className={`chat-message ${isUser ? "user" : "assistant"}`}>
      <div className="message-avatar">
        <div className={`avatar ${isUser ? "user" : "ai"}`}>
          {isUser ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="currentColor" />
            </svg>
          ) : (
            "AI"
          )}
        </div>
      </div>

      <div className="message-bubble">
        {!isUser && (
          <div className="message-header">
            <span className="role-label">AI Mufti</span>
            <button
              onClick={handleCopy}
              className="copy-button"
              title="Copy to clipboard"
              aria-label={copied ? "Copied" : "Copy message"}
            >
              {copied ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17Z" fill="currentColor" />
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16 1H4C2.9 1 2 1.9 2 3v14h2V3h12V1zm3 4H8C6.9 5 6 5.9 6 7v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" fill="currentColor" />
                </svg>
              )}
            </button>
          </div>
        )}

        <div className={`message-content markdown ${rtl ? "rtl" : ""}`} dir={rtl ? "rtl" : "auto"}>
          {content ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={MD_COMPONENTS}>
              {content}
            </ReactMarkdown>
          ) : (
            <div className="typing-indicator" aria-label="AI Mufti is typing">
              <span></span>
              <span></span>
              <span></span>
            </div>
          )}
        </div>

        {!isUser && sources && sources.length > 0 && (
          <details className="sources-panel">
            <summary>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
              {sources.length} source{sources.length > 1 ? "s" : ""}
            </summary>
            <ol className="sources-list">
              {sources.map((s, i) => {
                const rtlSrc = isRtl(s.content);
                return (
                  <li key={i} className="source-card">
                    <div className="source-title">{s.title}</div>
                    {s.reference && <div className="source-ref">{s.reference}</div>}
                    <div
                      className={`source-content ${rtlSrc ? "rtl" : ""}`}
                      dir={rtlSrc ? "rtl" : "auto"}
                    >
                      {s.content}
                    </div>
                  </li>
                );
              })}
            </ol>
          </details>
        )}

        {copied && <span className="copy-feedback">Copied!</span>}
      </div>
    </div>
  );
}
