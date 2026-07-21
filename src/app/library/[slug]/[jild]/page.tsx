import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import SiteHeader from "../../../components/SiteHeader";
import SiteFooter from "../../../components/SiteFooter";
import { libraryApi } from "../../../lib/api";

export const revalidate = 3600;

type Params = Promise<{ slug: string; jild: string }>;

const nf = (n: number) => new Intl.NumberFormat("en-US").format(n);

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug, jild } = await params;
  const data = await libraryApi.jild(slug, Number(jild));
  if (!data) return { title: "Volume not found" };

  const unit = data.has_safha ? "pages" : "sections";
  return {
    title: `${data.name} — Jild ${data.jild}`,
    description: `${data.name}, volume ${data.jild} — ${nf(data.pages.length)} ${unit} open to read, each with the passages AI Mufti cites from it.`,
    alternates: { canonical: `/library/${slug}/${data.jild}` },
  };
}

export default async function JildPage({ params }: { params: Params }) {
  const { slug, jild } = await params;
  const jildNum = Number(jild);
  if (!Number.isInteger(jildNum) || jildNum < 1) notFound();

  const data = await libraryApi.jild(slug, jildNum);
  if (!data) notFound();

  const unit = data.has_safha ? "Safha" : "Section";

  return (
    <>
      <SiteHeader />
      <main className="page">
        <nav className="crumbs" aria-label="Breadcrumb">
          <Link href="/library">Library</Link>
          <span aria-hidden="true">/</span>
          <Link href={`/library/${slug}`}>{data.name}</Link>
          <span aria-hidden="true">/</span>
          <span>Jild {data.jild}</span>
        </nav>

        <div className="page-head">
          <h1>
            {data.name} · Jild {data.jild}
          </h1>
          <p>
            {nf(data.pages.length)} {data.has_safha ? "pages" : "sections"}. Open any one
            to read its original text.
          </p>
        </div>

        <ul className="page-index">
          {data.pages.map((p) => (
            <li key={p.page}>
              <Link href={`/library/${slug}/${data.jild}/${p.page}`} className="page-index-row">
                <span className="page-index-num">
                  <small>{unit}</small>
                  {p.page}
                </span>
                <span className="page-index-heading urdu" dir="rtl" lang="ur">
                  {p.heading || "—"}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </main>
      <SiteFooter />
    </>
  );
}
