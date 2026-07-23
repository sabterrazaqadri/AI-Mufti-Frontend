"use client";

import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import SourcesPanel from "./SourcesPanel";
import type { Source } from "../lib/api";
import { buildVerifyUrl, verifyEnabled } from "../lib/verify";
import SpeakButton from "./SpeakButton";
import PublishButton from "./PublishButton";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
  /** The question this answer replies to — needed to send it on for verification. */
  question?: string;
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

export default function ChatMessage({
  role,
  content,
  sources,
  question,
}: ChatMessageProps) {
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
            <SpeakButton text={content} />
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

        {/* Only once the answer has actually streamed in — citations appearing
            above an empty bubble reads as if they are the reply. */}
        {!isUser && content && <SourcesPanel sources={sources} />}

        {/* Both post-answer actions share one row of quiet pills, so on a narrow
            screen they wrap together instead of one becoming a heavy full-width bar.
            Verify is hidden entirely when no Dar al-Ifta number is configured. */}
        {!isUser && content && question && (verifyEnabled() || (sources && sources.length > 0)) && (
          <div className="answer-actions">
            <PublishButton question={question} answer={content} sources={sources} />
            {verifyEnabled() && (
              <a
                className="verify-button"
                href={buildVerifyUrl(question, content, sources)}
                target="_blank"
                rel="noopener noreferrer"
                title="Send this question, answer and its references to a mufti on WhatsApp"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12.04 2a9.9 9.9 0 0 0-8.5 14.96L2 22l5.2-1.5A9.9 9.9 0 1 0 12.04 2zm0 1.9a8 8 0 1 1-4.07 14.9l-.29-.17-3.08.89.9-3-.19-.3A8 8 0 0 1 12.04 3.9zm4.6 10.1c-.25-.13-1.47-.72-1.7-.8-.23-.09-.4-.13-.56.12s-.64.8-.79.97-.29.18-.54.06a6.5 6.5 0 0 1-1.92-1.19 7.3 7.3 0 0 1-1.33-1.65c-.14-.25-.01-.38.11-.5l.37-.44c.12-.14.16-.24.24-.4a.45.45 0 0 0-.02-.43c-.07-.13-.56-1.35-.77-1.85s-.41-.42-.56-.43h-.48a.92.92 0 0 0-.67.31 2.8 2.8 0 0 0-.87 2.08 4.85 4.85 0 0 0 1.02 2.58c.12.17 1.75 2.67 4.24 3.74a14.3 14.3 0 0 0 1.42.53 3.4 3.4 0 0 0 1.56.1 2.56 2.56 0 0 0 1.68-1.19 2.07 2.07 0 0 0 .15-1.18c-.06-.11-.23-.18-.48-.3z" />
                </svg>
                Verify with a mufti
              </a>
            )}
          </div>
        )}

        {copied && <span className="copy-feedback">Copied!</span>}
      </div>
    </div>
  );
}
