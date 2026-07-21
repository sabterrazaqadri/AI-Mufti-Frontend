import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import SiteHeader from "../../../components/SiteHeader";
import SiteFooter from "../../../components/SiteFooter";
import { libraryApi } from "../../../lib/api";

export const revalidate = 3600;

// This static "category" segment sits alongside the dynamic /library/[slug], and
// Next resolves static segments first, so book slugs are unaffected.
type Params = Promise<{ category: string }>;

const nf = (n: number) => new Intl.NumberFormat("en-US").format(n);

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { category } = await params;
  const cat = await libraryApi.category(category);
  if (!cat) return { title: "Category not found" };

  return {
    title: `${cat.name} — Library`,
    description: `${cat.desc} ${cat.book_count} ${cat.book_count === 1 ? "book" : "books"}, ${nf(cat.passages)} passages, every page open to read.`,
    alternates: { canonical: `/library/category/${cat.slug}` },
  };
}

export default async function CategoryPage({ params }: { params: Params }) {
  const { category } = await params;
  const cat = await libraryApi.category(category);
  if (!cat) notFound();

  return (
    <>
      <SiteHeader />
      <main className="page">
        <nav className="crumbs" aria-label="Breadcrumb">
          <Link href="/library">Library</Link>
          <span aria-hidden="true">/</span>
          <span>{cat.name}</span>
        </nav>

        <div className="page-head">
          <span className="eyebrow" dir="rtl">
            {cat.urdu}
          </span>
          <h1>{cat.name}</h1>
          <p>
            {cat.desc} {cat.book_count} {cat.book_count === 1 ? "book" : "books"} ·{" "}
            {nf(cat.passages)} passages.
          </p>
        </div>

        <ul className="library-list">
          {cat.books.map((b) => (
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
      </main>
      <SiteFooter />
    </>
  );
}
