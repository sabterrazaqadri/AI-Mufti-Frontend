"use client";

import { useCallback, useState } from "react";
import { answersApi, type Source } from "../lib/api";
import { useToast } from "./ToastProvider";

/**
 * Publishes an exchange to a permanent public page at /masla/<slug>.
 *
 * Only ever offered for answers that carry citations — the backend enforces the
 * same rule, but the button should not appear for an answer that cannot be
 * published. Publishing is explicit and irreversible from here, so it asks first.
 */
export default function PublishButton({
  question,
  answer,
  sources,
}: {
  question: string;
  answer: string;
  sources?: Source[];
}) {
  const [busy, setBusy] = useState(false);
  const [url, setUrl] = useState<string | null>(null);
  const { addToast } = useToast();

  const publish = useCallback(async () => {
    if (busy) return;
    const ok = window.confirm(
      "Publish this question and answer to a public page?\n\n" +
        "It will be readable by anyone and can appear in search results. " +
        "Do not publish anything personal."
    );
    if (!ok) return;

    setBusy(true);
    try {
      const res = await answersApi.publish(question, answer, sources ?? []);
      if (!res.ok) {
        addToast({ title: "Could not publish this answer.", type: "error" });
        return;
      }
      const data = await res.json();
      const full = `${window.location.origin}${data.url}`;
      setUrl(full);
      try {
        await navigator.clipboard.writeText(full);
        addToast({ title: "Published", description: "Link copied to clipboard.", type: "success" });
      } catch {
        addToast({ title: "Published", type: "success" });
      }
    } catch {
      addToast({ title: "Could not publish this answer.", type: "error" });
    } finally {
      setBusy(false);
    }
  }, [busy, question, answer, sources, addToast]);

  if (!sources || sources.length === 0) return null;

  if (url) {
    return (
      <a className="publish-link" href={url} target="_blank" rel="noopener noreferrer">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
        </svg>
        View published page
      </a>
    );
  }

  return (
    <button type="button" className="publish-button" onClick={publish} disabled={busy}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7" />
        <path d="M12 3v13M8 7l4-4 4 4" />
      </svg>
      {busy ? "Publishing…" : "Publish & share"}
    </button>
  );
}
