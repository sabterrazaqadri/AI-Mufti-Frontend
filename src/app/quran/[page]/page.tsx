import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import SiteHeader from "../../components/SiteHeader";
import SiteFooter from "../../components/SiteFooter";
import { quranApi } from "../../lib/api";

export const revalidate = 3600;

type Params = Promise<{ page: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { page } = await params;
  const data = await quranApi.page(Number(page));
  if (!data) return { title: "Page not found" };

  const surah = data.surah ?? "Al-Qur'an";
  return {
    title: `${surah} — Safha ${data.page}`,
    description: `Page ${data.page} of the mushaf: ${surah}, ayat ${data.ayat[0]?.number ?? ""}–${data.ayat[data.ayat.length - 1]?.number ?? ""}.`,
    alternates: { canonical: `/quran/${data.page}` },
  };
}

export default async function QuranPageView({ params }: { params: Params }) {
  const { page } = await params;
  const n = Number(page);
  if (!Number.isInteger(n)) notFound();

  const data = await quranApi.page(n);
  if (!data) notFound();

  return (
    <>
      <SiteHeader />
      <main className="page page-reader">
        <nav className="crumbs" aria-label="Breadcrumb">
          <Link href="/quran">Al-Qur&apos;an</Link>
          <span aria-hidden="true">/</span>
          <span>Safha {data.page}</span>
        </nav>

        <article className="folio mushaf">
          <header className="folio-head">
            <p className="folio-book">صفحہ {data.page}</p>
            {data.surah && (
              <h1 className="folio-title urdu" dir="rtl" lang="ar">
                {data.surah}
              </h1>
            )}
          </header>

          {data.lead && (
            <p className="mushaf-lead" dir="rtl" lang="ar">
              {data.lead}
            </p>
          )}

          <div className="mushaf-body" dir="rtl" lang="ar">
            {data.ayat.map((a) => (
              <p key={a.number} className="ayah">
                <span className="ayah-text">{a.text}</span>
                {/* The ayah number sits in the traditional end-of-verse marker. */}
                <span className="ayah-num" aria-label={`Ayah ${a.number}`}>
                  {a.number}
                </span>
              </p>
            ))}
          </div>
        </article>

        <nav className="pager" aria-label="Page navigation">
          {data.prev !== null ? (
            <Link href={`/quran/${data.prev}`} className="btn btn-ghost" rel="prev">
              ← {data.prev}
            </Link>
          ) : (
            <span />
          )}
          <Link href="/quran" className="pager-status">
            Surah index
          </Link>
          {data.next !== null ? (
            <Link href={`/quran/${data.next}`} className="btn btn-ghost" rel="next">
              {data.next} →
            </Link>
          ) : (
            <span />
          )}
        </nav>

        <div className="page-cta">
          <p>
            Want the tafseer of these ayat from Sirat-ul-Jinan, or a ruling explained?
          </p>
          <div className="page-cta-actions">
            <Link
              href={`/search?q=${encodeURIComponent(data.surah ?? "")}`}
              className="btn btn-ghost"
            >
              Search the tafseer
            </Link>
            <Link href="/chat" className="btn btn-primary">
              Ask AI Mufti
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
