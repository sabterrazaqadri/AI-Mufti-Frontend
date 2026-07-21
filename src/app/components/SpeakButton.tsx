"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Reads an answer aloud, for the same readers who dictate their question.
 *
 * Markdown is stripped first: a synthesiser otherwise pronounces the asterisks
 * and hashes, which is worse than not offering this at all.
 */
function plainText(md: string) {
  return md
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]*)`/g, "$1")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/^\s{0,3}#{1,6}\s+/gm, "")
    .replace(/^\s{0,3}>\s?/gm, "")
    .replace(/[*_~]{1,3}/g, "")
    .replace(/^\s*[-•]\s+/gm, "")
    .replace(/\|/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

const URDU_RE = /[؀-ۿ]/;

export default function SpeakButton({ text }: { text: string }) {
  const [supported, setSupported] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    setSupported(typeof window !== "undefined" && "speechSynthesis" in window);
    // A page navigation while speaking otherwise leaves the voice running.
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const toggle = useCallback(() => {
    const synth = window.speechSynthesis;
    if (speaking) {
      synth.cancel();
      setSpeaking(false);
      return;
    }
    const body = plainText(text);
    if (!body) return;

    const u = new SpeechSynthesisUtterance(body);
    u.lang = URDU_RE.test(body) ? "ur-PK" : "en-US";
    u.rate = 0.95; // Urdu voices run fast; this is closer to how it is recited
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);

    synth.cancel();
    synth.speak(u);
    setSpeaking(true);
  }, [speaking, text]);

  if (!supported || !text) return null;

  return (
    <button
      type="button"
      className="copy-button"
      onClick={toggle}
      aria-pressed={speaking}
      aria-label={speaking ? "Stop reading aloud" : "Read aloud"}
      title={speaking ? "Stop reading aloud" : "Read aloud"}
    >
      {speaking ? (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <rect x="6" y="6" width="12" height="12" rx="2" />
        </svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M11 5L6 9H3v6h3l5 4V5z" />
          <path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" />
        </svg>
      )}
    </button>
  );
}
