import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import SiteHeader from "../../../../components/SiteHeader";
import SiteFooter from "../../../../components/SiteFooter";
import { libraryApi } from "../../../../lib/api";

export const revalidate = 3600;

type Params = Promise<{ slug: string; jild: string; page: string }>;

/** Strip the "[Book، جلد N — heading]" prefix the ingester prepends to each chunk. */
function cleanContent(text: string) {
  return text.replace(/^\[[^\]]*\]\s*/, "").trim();
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug, jild, page } = await params;
  const data = await libraryApi.page(slug, Number(jild), Number(page));
  if (!data) return { title: "Page not found" };

  // A real excerpt makes a far better search snippet than a generated sentence.
  const excerpt = cleanContent(data.passages[0]?.content ?? "").slice(0, 155);
  return {
    title: `${data.name} — Jild ${data.jild}, ${data.page}${data.heading ? ` · ${data.heading}` : ""}`,
    description:
      excerpt || `${data.name}, volume ${data.jild}, page ${data.page} — original text.`,
    alternates: { canonical: `/library/${slug}/${data.jild}/${data.page}` },
  };
}

export default async function OriginalPage({ params }: { params: Params }) {
  const { slug, jild, page } = await params;
  const jildNum = Number(jild);
  const pageNum = Number(page);
  if (!Number.isInteger(jildNum) || !Number.isInteger(pageNum)) notFound();

  const data = await libraryApi.page(slug, jildNum, pageNum);
  if (!data) notFound();

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Library", item: "/library" },
      { "@type": "ListItem", position: 2, name: data.name, item: `/library/${slug}` },
      {
        "@type": "ListItem",
        position: 3,
        name: `Jild ${data.jild}`,
        item: `/library/${slug}/${data.jild}`,
      },
      { "@type": "ListItem", position: 4, name: `${data.page}` },
    ],
  };

  let lastRef: string | null = null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <SiteHeader />

      <main className="page page-reader">
        <nav className="crumbs" aria-label="Breadcrumb">
          <Link href="/library">Library</Link>
          <span aria-hidden="true">/</span>
          <Link href={`/library/${slug}`}>{data.name}</Link>
          <span aria-hidden="true">/</span>
          <Link href={`/library/${slug}/${data.jild}`}>Jild {data.jild}</Link>
          <span aria-hidden="true">/</span>
          <span>{data.page}</span>
        </nav>

        {/* The page itself, set to be read rather than scanned. */}
        <article className="folio">
          <header className="folio-head">
            <p className="folio-book">
              {data.name} · جلد {data.jild} · {data.page}
            </p>
            {data.heading && (
              <h1 className="folio-title urdu" dir="rtl" lang="ur">
                {data.heading}
              </h1>
            )}
          </header>

          <div className="folio-body urdu" dir="rtl" lang="ur">
            {data.passages.map((p, i) => {
              const ref = p.reference ?? null;
              const showRef = ref !== null && ref !== lastRef;
              lastRef = ref;
              return (
                <section key={i} className="folio-block">
                  {showRef && (
                    <p className="folio-ref" dir="ltr">
                      {ref}
                    </p>
                  )}
                  <p className="folio-text">{cleanContent(p.content)}</p>
                </section>
              );
            })}
          </div>
        </article>

        <nav className="pager" aria-label="Page navigation">
          {data.prev !== null ? (
            <Link
              href={`/library/${slug}/${data.jild}/${data.prev}`}
              className="btn btn-ghost"
              rel="prev"
            >
              ← {data.prev}
            </Link>
          ) : (
            <span />
          )}
          <Link href={`/library/${slug}/${data.jild}`} className="pager-status">
            Jild {data.jild} index
          </Link>
          {data.next !== null ? (
            <Link
              href={`/library/${slug}/${data.jild}/${data.next}`}
              className="btn btn-ghost"
              rel="next"
            >
              {data.next} →
            </Link>
          ) : (
            <span />
          )}
        </nav>

        <div className="page-cta">
          <p>Have a question about this passage?</p>
          <Link href="/chat" className="btn btn-primary">
            Ask AI Mufti
          </Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
