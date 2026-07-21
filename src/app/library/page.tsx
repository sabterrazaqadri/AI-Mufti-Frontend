import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import { libraryApi } from "../lib/api";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Library — Every Book AI Mufti Answers From",
  description:
    "Browse the full digitised library behind AI Mufti by subject: Qur'an & Tafseer, Hadith, Fiqh & Fatawa, Aqaid, Seerat, Tasawwuf and the darsi kutub — every page open to read.",
  alternates: { canonical: "/library" },
};

const nf = (n: number) => new Intl.NumberFormat("en-US").format(n);

export default async function LibraryPage() {
  const categories = await libraryApi.categories();
  const totalBooks = categories.reduce((s, c) => s + c.book_count, 0);
  const totalPassages = categories.reduce((s, c) => s + c.passages, 0);

  return (
    <>
      <SiteHeader />
      <main className="page">
        <div className="page-head">
          <span className="eyebrow" dir="rtl">
            کتب خانہ
          </span>
          <h1>The Library</h1>
          <p>
            {totalBooks
              ? `${totalBooks} books · ${nf(totalPassages)} passages`
              : "The library is loading"}
            . Every answer AI Mufti gives is taken from these pages — and you can read
            them yourself.
          </p>
        </div>

        {categories.length === 0 ? (
          <p className="empty-state">
            The library could not be reached right now. Please try again shortly.
          </p>
        ) : (
          <div className="cat-grid">
            {categories.map((c) => (
              <Link key={c.slug} href={`/library/category/${c.slug}`} className="cat-card">
                <span className="cat-head">
                  <span className="cat-urdu urdu" dir="rtl">
                    {c.urdu}
                  </span>
                  <span className="cat-name">{c.name}</span>
                </span>
                <span className="cat-desc">{c.desc}</span>
                <span className="cat-meta">
                  {c.book_count} {c.book_count === 1 ? "book" : "books"} ·{" "}
                  {nf(c.passages)} passages
                </span>
              </Link>
            ))}
          </div>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
