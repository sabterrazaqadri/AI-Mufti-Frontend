import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import { quranApi } from "../lib/api";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Al-Qur'an al-Kareem — Read the Mushaf",
  description:
    "Read the Qur'an al-Kareem page by page as it appears in the mushaf, with every surah indexed to the page it begins on.",
  alternates: { canonical: "/quran" },
};

export default async function QuranIndexPage() {
  const data = await quranApi.index();

  return (
    <>
      <SiteHeader />
      <main className="page">
        <div className="page-head">
          <span className="eyebrow" dir="rtl">
            القرآن الکریم
          </span>
          <h1>Al-Qur&apos;an al-Kareem</h1>
          <p>
            {data ? `${data.total} pages of the mushaf` : "Loading"}, read as they are
            printed. Pick a surah to open the page it begins on.
          </p>
        </div>

        {!data ? (
          <p className="empty-state">
            The Qur&apos;an could not be loaded right now. Please try again shortly.
          </p>
        ) : (
          <>
            <div className="surah-grid">
              {data.surahs.map((s) => (
                <Link key={s.surah} href={`/quran/${s.page}`} className="surah-card">
                  <span className="surah-name urdu" dir="rtl">
                    {s.surah}
                  </span>
                  <span className="surah-page">صفحہ {s.page}</span>
                </Link>
              ))}
            </div>

            <p className="tool-note">
              Surahs are indexed by the page each one is printed as beginning on. A few
              short surahs share a page with the one before them and so are not listed
              separately — open the neighbouring page to find them.
            </p>
          </>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
