import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import { answersApi } from "../lib/api";

export const revalidate = 600;

export const metadata: Metadata = {
  title: "Masail — Answered Questions with References",
  description:
    "Islamic questions answered from Bahar-e-Shariat, Fatawa Razawiyya, Miraat-ul-Manajeeh and other authentic Ahl-e-Sunnat works, each with the page it came from.",
  alternates: { canonical: "/masla" },
};

const RTL = /[؀-ۿ]/;

export default async function MasailPage() {
  const answers = await answersApi.list(60);

  return (
    <>
      <SiteHeader />
      <main className="page">
        <div className="page-head">
          <span className="eyebrow" dir="rtl">
            مسائل
          </span>
          <h1>Answered Masail</h1>
          <p>
            Questions people have asked, answered from the books — each one shown with
            the exact reference it rests on.
          </p>
        </div>

        {answers.length === 0 ? (
          <p className="empty-state">
            No masail have been published yet. Ask a question and publish the answer to
            be the first.
          </p>
        ) : (
          <ul className="library-list">
            {answers.map((a) => (
              <li key={a.slug}>
                <Link href={`/masla/${a.slug}`} className="library-row">
                  <span className="library-row-main">
                    <span
                      className="library-row-name masla-row-q"
                      dir={RTL.test(a.question) ? "rtl" : "auto"}
                    >
                      {a.question}
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
