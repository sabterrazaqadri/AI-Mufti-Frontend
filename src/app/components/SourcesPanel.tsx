"use client";

import Link from "next/link";
import type { Source } from "../lib/api";

/**
 * The citations behind an answer. This is the product's central claim made
 * visible: every ruling names the book, volume and page it came from, and each
 * one opens to that book in the library so the reader can check it.
 *
 * Collapsed by default — the answer is the thing being read; the evidence is
 * one tap away for anyone who wants it.
 */
export default function SourcesPanel({ sources }: { sources?: Source[] }) {
  if (!sources || sources.length === 0) return null;

  return (
    <details className="sources">
      <summary>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
        <span>
          {sources.length} {sources.length === 1 ? "reference" : "references"}
          <span className="urdu" dir="rtl">
            حوالہ جات
          </span>
        </span>
        <svg className="sources-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </summary>

      <ol className="sources-list">
        {sources.map((s, i) => (
          <li key={`${s.reference ?? s.title}-${i}`} className="source-item">
            <p className="source-ref">{s.reference || s.title}</p>
            <blockquote className="source-quote urdu" dir="rtl" lang="ur">
              {s.content}
            </blockquote>
            {s.slug && (
              <Link href={`/library/${s.slug}`} className="source-link">
                Open {s.title || "this book"} in the library
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </Link>
            )}
          </li>
        ))}
      </ol>
    </details>
  );
}
