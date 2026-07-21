import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import SiteHeader from "../../components/SiteHeader";
import SiteFooter from "../../components/SiteFooter";
import { libraryApi } from "../../lib/api";

export const revalidate = 3600;

type Params = Promise<{ slug: string }>;

const nf = (n: number) => new Intl.NumberFormat("en-US").format(n);

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const book = await libraryApi.book(slug);
  if (!book) return { title: "Book not found" };

  const volumes = book.jilds.length > 1 ? `${book.jilds.length} volumes, ` : "";
  // Must match the on-page wording: books scraped by section have no printed
  // page numbers, and the description should not claim otherwise.
  const unit = book.has_safha ? "pages" : "sections";
  return {
    title: book.name,
    description: `Read ${book.name} in full — ${volumes}${nf(book.total_pages)} ${unit}, ${nf(book.total_passages)} passages. One of the authentic Ahl-e-Sunnat works AI Mufti answers from.`,
    alternates: { canonical: `/library/${slug}` },
  };
}

export default async function BookPage({ params }: { params: Params }) {
  const { slug } = await params;
  const book = await libraryApi.book(slug);
  if (!book) notFound();

  const unit = book.has_safha ? "pages" : "sections";

  return (
    <>
      <SiteHeader />
      <main className="page">
        <nav className="crumbs" aria-label="Breadcrumb">
          <Link href="/library">Library</Link>
          <span aria-hidden="true">/</span>
          <span>{book.name}</span>
        </nav>

        <div className="page-head">
          <h1>{book.name}</h1>
          <p>
            {book.jilds.length > 1 ? `${book.jilds.length} volumes · ` : ""}
            {nf(book.total_pages)} {unit} · {nf(book.total_passages)} passages
          </p>
        </div>

        <div className="jild-grid">
          {book.jilds.map((j) => (
            <Link key={j.jild} href={`/library/${slug}/${j.jild}`} className="jild-card">
              <span className="jild-label">
                Jild
                <span className="urdu" dir="rtl">
                  جلد
                </span>
              </span>
              <span className="jild-num">{j.jild}</span>
              <span className="jild-meta">
                {nf(j.pages)} {unit}
              </span>
            </Link>
          ))}
        </div>

        <div className="page-cta">
          <p>Have a question about what this book covers?</p>
          <Link href="/chat" className="btn btn-primary">
            Ask AI Mufti
          </Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
