import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import { libraryApi } from "../lib/api";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Library — Every Book AI Mufti Answers From",
  description:
    "Browse the full digitised library behind AI Mufti: Bahar-e-Shariat, Fatawa Razawiyya, Miraat-ul-Manajeeh, Sirat-ul-Jinan, Ja Al-Haq and more — every page open to read.",
  alternates: { canonical: "/library" },
};

function nf(n: number) {
  return new Intl.NumberFormat("en-US").format(n);
}

export default async function LibraryPage() {
  const books = await libraryApi.books();
  const total = books.reduce((s, b) => s + Number(b.passages || 0), 0);

  return (
    <>
      <SiteHeader />
      <main className="page">
        <div className="page-head">
          <span className="eyebrow">کتب خانہ</span>
          <h1>The Library</h1>
          <p>
            {books.length
              ? `${books.length} books · ${nf(total)} passages`
              : "The library is loading"}
            . Every answer AI Mufti gives is taken from these pages — and you can read
            them yourself.
          </p>
        </div>

        {books.length === 0 ? (
          <p className="empty-state">
            The library could not be reached right now. Please try again shortly.
          </p>
        ) : (
          <ul className="library-list">
            {books.map((b) => (
              <li key={b.slug}>
                <Link href={`/library/${b.slug}`} className="library-row">
                  <span className="library-row-main">
                    <span className="library-row-name">{b.name}</span>
                    <span className="library-row-meta">
                      {nf(Number(b.passages))} passages
                    </span>
                  </span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M9 6l6 6-6 6" />
                  </svg>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
