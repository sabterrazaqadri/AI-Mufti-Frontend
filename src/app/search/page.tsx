import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import { API_URL, sourceHref, type Source } from "../lib/api";

type Search = Promise<{ q?: string }>;

export const metadata: Metadata = {
  title: "Search the Library",
  description:
    "Search the full text of 26 authentic Ahl-e-Sunnat books — Bahar-e-Shariat, Fatawa Razawiyya, Miraat-ul-Manajeeh and more — and jump straight to the original page.",
  alternates: { canonical: "/search" },
};

async function runSearch(q: string): Promise<Source[]> {
  try {
    const res = await fetch(
      `${API_URL}/api/library/search?q=${encodeURIComponent(q)}&limit=25`,
      // Results are per-query and cheap to recompute; a short cache absorbs
      // repeat searches without ever serving a stale corpus.
      { next: { revalidate: 300 } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.results ?? [];
  } catch {
    return [];
  }
}

export default async function SearchPage({ searchParams }: { searchParams: Search }) {
  const q = ((await searchParams).q ?? "").trim();
  const results = q.length >= 2 ? await runSearch(q) : [];

  return (
    <>
      <SiteHeader />
      <main className="page">
        <div className="page-head">
          <span className="eyebrow" dir="rtl">
            تلاش
          </span>
          <h1>Search the Library</h1>
          <p>
            Search the actual text of every book AI Mufti answers from. Ask in Urdu,
            Roman Urdu or English — results link straight to the original page.
          </p>
        </div>

        <form className="search-form" action="/search" method="get" role="search">
          <label htmlFor="q" className="sr-only">
            Search the library
          </label>
          <input
            id="q"
            name="q"
            className="field"
            defaultValue={q}
            placeholder="e.g. سجدۂ سہو  ·  musafir ki namaz  ·  zakat on gold"
            dir="auto"
            autoComplete="off"
          />
          <button type="submit" className="btn btn-primary">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4.3-4.3" />
            </svg>
            Search
          </button>
        </form>

        {q.length >= 2 && (
          <p className="search-count" aria-live="polite">
            {results.length === 0
              ? "Nothing in the library matches that closely."
              : `${results.length} passage${results.length === 1 ? "" : "s"} found`}
          </p>
        )}

        {results.length > 0 && (
          <div className="search-results">
            {results.map((r, i) => {
              const href = sourceHref(r);
              return (
                <article key={`${r.reference}-${i}`} className="search-hit">
                  <p className="search-hit-ref">{r.reference || r.title}</p>
                  <p className="search-hit-text urdu" dir="rtl" lang="ur">
                    {r.content}
                  </p>
                  {href && (
                    <Link href={href} className="source-link">
                      Read the original page
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M5 12h14M13 6l6 6-6 6" />
                      </svg>
                    </Link>
                  )}
                </article>
              );
            })}
          </div>
        )}

        {q.length >= 2 && (
          <div className="page-cta">
            <p>Want the ruling explained rather than the raw passage?</p>
            <Link href="/chat" className="btn btn-primary">
              Ask AI Mufti
            </Link>
          </div>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
