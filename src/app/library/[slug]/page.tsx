import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import SiteHeader from "../../components/SiteHeader";
import SiteFooter from "../../components/SiteFooter";
import { libraryApi } from "../../lib/api";

export const revalidate = 3600;

type Params = Promise<{ slug: string }>;
type Search = Promise<{ page?: string }>;

function pageNum(v?: string) {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 1;
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: Search;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = pageNum((await searchParams).page);
  const book = await libraryApi.book(slug, page);
  if (!book) return { title: "Book not found" };

  const suffix = page > 1 ? ` — Page ${page}` : "";
  return {
    title: `${book.name}${suffix}`,
    description: `Read ${book.name} passage by passage — ${book.total} excerpts with volume and page references, as used by AI Mufti to answer Hanafi Ahl-e-Sunnat masail.`,
    alternates: { canonical: `/library/${slug}${page > 1 ? `?page=${page}` : ""}` },
  };
}

/** Strip the "[Book، جلد N — heading]" prefix the ingester prepends to each chunk. */
function cleanContent(text: string) {
  return text.replace(/^\[[^\]]*\]\s*/, "").trim();
}

export default async function BookPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: Search;
}) {
  const { slug } = await params;
  const page = pageNum((await searchParams).page);
  const book = await libraryApi.book(slug, page);
  if (!book) notFound();

  const prev = page > 1 ? page - 1 : null;
  const next = page < book.pages ? page + 1 : null;

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
            {new Intl.NumberFormat("en-US").format(book.total)} passages · page {page} of{" "}
            {book.pages}
          </p>
        </div>

        <div className="passages">
          {book.passages.map((p, i) => (
            <article key={`${p.reference}-${i}`} className="passage">
              {p.reference && <p className="passage-ref">{p.reference}</p>}
              {p.title && (
                <h2 className="passage-title" dir="auto">
                  {p.title}
                </h2>
              )}
              <div className="passage-body urdu" dir="rtl" lang="ur">
                {cleanContent(p.content)}
              </div>
            </article>
          ))}
        </div>

        <nav className="pager" aria-label="Pagination">
          {prev ? (
            <Link href={`/library/${slug}?page=${prev}`} className="btn btn-ghost" rel="prev">
              ← Previous
            </Link>
          ) : (
            <span />
          )}
          <span className="pager-status">
            {page} / {book.pages}
          </span>
          {next ? (
            <Link href={`/library/${slug}?page=${next}`} className="btn btn-ghost" rel="next">
              Next →
            </Link>
          ) : (
            <span />
          )}
        </nav>

        <div className="page-cta">
          <p>Have a question about what you just read?</p>
          <Link href="/chat" className="btn btn-primary">
            Ask AI Mufti
          </Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
