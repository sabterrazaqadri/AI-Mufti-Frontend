"use client";

import React, { useState } from "react";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  isLast?: boolean;
}

export default function ChatMessage({ role, content, isLast }: ChatMessageProps) {
  const [copied, setCopied] = useState(false);

  const isUser = role === "user";

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

  // Format content preserving line breaks and structure
  const formatContent = (text: string) => {
    if (!text) return null;

    // Split by double newlines to get paragraphs
    const paragraphs = text.split(/\n\n+/);

    return paragraphs.map((paragraph, pIndex) => {
      // Check if this is a numbered list (1., 2., etc.)
      const lines = paragraph.split("\n");
      const isNumberedList = lines.every(
        (line) => /^\d+[.)]\s/.test(line.trim()) || /^[\u06F0-\u06F9]\s/.test(line.trim())
      );

      // Check if this is a bullet list
      const isBulletList = lines.every(
        (line) =>
          /^[•\-\*]\s/.test(line.trim()) || /^[\u064B\u064C\u064D\u064E\u064F\u0650\u0651\u0652]\s/.test(line.trim())
      );

      if (isNumberedList || isBulletList) {
        return (
          <ul key={pIndex} className="message-list">
            {lines.map((line, i) => (
              <li key={i}>{line.replace(/^[•\-\*\d+.)\s]+/, "").trim()}</li>
            ))}
          </ul>
        );
      }

      // Regular paragraph with possible inline lists
      const formattedLines = lines.map((line, lineIndex) => {
        // Handle inline numbered points like "1. Text"
        const inlineNumbered = line.split(/(\d+[.)]\s)/);
        if (inlineNumbered.length > 1) {
          return (
            <span key={lineIndex}>
              {inlineNumbered.map((part, i) =>
                /^\d+[.)]\s/.test(part) ? (
                  <span key={i} className="inline-number">{part}</span>
                ) : (
                  <span key={i}>{part}</span>
                )
              )}
              <br />
            </span>
          );
        }
        return <span key={lineIndex}>{line}<br /></span>;
      });

      return <p key={pIndex}>{formattedLines}</p>;
    });
  };

  return (
    <div className={`chat-message ${isUser ? "user" : "assistant"}`}>
      {/* Avatar */}
      <div className="message-avatar">
        <div className={`avatar ${isUser ? "user" : "ai"}`}>
          {isUser ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="currentColor"/>
            </svg>
          ) : (
            "AI"
          )}
        </div>
      </div>

      {/* Message Bubble */}
      <div className="message-bubble">
        {/* Role Label & Copy Button for Assistant */}
        {!isUser && (
          <div className="message-header">
            <span className="role-label">AI Mufti</span>
            <button
              onClick={handleCopy}
              className="copy-button"
              title="Copy to clipboard"
              aria-label="Copy message"
            >
              {copied ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17Z" fill="currentColor"/>
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16 1H4C2.9 1 2 1.9 2 3v14h2V3h12V1zm3 4H8C6.9 5 6 5.9 6 7v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" fill="currentColor"/>
                </svg>
              )}
            </button>
          </div>
        )}

        {/* Message Content */}
        <div className="message-content">{formatContent(content)}</div>

        {/* Copy Feedback */}
        {copied && <span className="copy-feedback">Copied!</span>}
      </div>
    </div>
  );
}
