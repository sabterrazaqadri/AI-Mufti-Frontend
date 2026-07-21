"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Dictation for people who speak Urdu far more easily than they type it — which
 * is most of this audience, and nearly all of its elders.
 *
 * Uses the browser's own speech recognition, so there is no API cost and nothing
 * is sent to us until the user presses send. Chrome, Edge and Android Chrome
 * support it; Firefox does not, and the button hides itself there rather than
 * offering something that will not work.
 */

interface SpeechRecognitionLike extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: ((e: { error?: string }) => void) | null;
  onend: (() => void) | null;
}

type Ctor = new () => SpeechRecognitionLike;

function getRecognition(): Ctor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: Ctor;
    webkitSpeechRecognition?: Ctor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export default function VoiceInput({
  onTranscript,
  disabled,
}: {
  onTranscript: (text: string) => void;
  disabled?: boolean;
}) {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [error, setError] = useState("");
  const recRef = useRef<SpeechRecognitionLike | null>(null);

  useEffect(() => {
    setSupported(getRecognition() !== null);
    return () => recRef.current?.stop();
  }, []);

  const toggle = useCallback(() => {
    if (listening) {
      recRef.current?.stop();
      return;
    }
    const Ctor = getRecognition();
    if (!Ctor) return;

    const rec = new Ctor();
    // ur-PK is the right primary; browsers that lack an Urdu model fall back to
    // their default rather than failing, and Roman Urdu still transcribes usably.
    rec.lang = "ur-PK";
    rec.continuous = false;
    rec.interimResults = false;

    rec.onresult = (e) => {
      const text = Array.from({ length: e.results.length }, (_, i) => e.results[i][0].transcript)
        .join(" ")
        .trim();
      if (text) onTranscript(text);
    };
    rec.onerror = (e) => {
      setError(
        e.error === "not-allowed"
          ? "Microphone permission denied."
          : "Could not hear that — please try again."
      );
      setListening(false);
    };
    rec.onend = () => setListening(false);

    recRef.current = rec;
    setError("");
    setListening(true);
    try {
      rec.start();
    } catch {
      setListening(false);
    }
  }, [listening, onTranscript]);

  if (!supported) return null;

  return (
    <>
      <button
        type="button"
        className={`mic-button${listening ? " listening" : ""}`}
        onClick={toggle}
        disabled={disabled}
        aria-pressed={listening}
        aria-label={listening ? "Stop dictation" : "Ask by voice"}
        title={listening ? "Stop dictation" : "Ask by voice"}
      >
        {listening ? (
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <rect x="7" y="7" width="10" height="10" rx="2" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="9" y="2" width="6" height="12" rx="3" />
            <path d="M5 11a7 7 0 0 0 14 0M12 18v4" />
          </svg>
        )}
      </button>
      {error && (
        <span className="sr-only" role="status">
          {error}
        </span>
      )}
    </>
  );
}
