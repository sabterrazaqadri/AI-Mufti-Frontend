import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import SiteHeader from "../../components/SiteHeader";
import SiteFooter from "../../components/SiteFooter";
import { answersApi, sourceHref } from "../../lib/api";

export const revalidate = 3600;

type Params = Promise<{ slug: string }>;

const RTL = /[؀-ۿ]/;

function isRtl(text: string) {
  const rtl = (text.match(/[؀-ۿ]/g) || []).length;
  const ltr = (text.match(/[A-Za-z]/g) || []).length;
  return rtl > ltr;
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const a = await answersApi.get(decodeURIComponent(slug));
  if (!a) return { title: "Not found" };

  const summary = a.answer.replace(/[#*`>|_-]/g, " ").replace(/\s+/g, " ").trim().slice(0, 158);
  return {
    title: a.question.slice(0, 70),
    description: summary,
    alternates: { canonical: `/masla/${slug}` },
    openGraph: { title: a.question.slice(0, 70), description: summary, type: "article" },
  };
}

export default async function MaslaPage({ params }: { params: Params }) {
  const { slug } = await params;
  const a = await answersApi.get(decodeURIComponent(slug));
  if (!a) notFound();

  const rtl = isRtl(a.answer);

  // A published mas'ala is a real Q&A page — mark it up as one so it can appear
  // as a rich result rather than a wall of text.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "QAPage",
    mainEntity: {
      "@type": "Question",
      name: a.question,
      text: a.question,
      answerCount: 1,
      acceptedAnswer: {
        "@type": "Answer",
        text: a.answer,
        citation: a.sources.map((s) => s.reference || s.title).filter(Boolean),
      },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SiteHeader />

      <main className="page page-prose">
        <nav className="crumbs" aria-label="Breadcrumb">
          <Link href="/masla">Masail</Link>
          <span aria-hidden="true">/</span>
          <span>Answer</span>
        </nav>

        <article>
          <div className="page-head">
            <span className="eyebrow" dir="rtl">
              سوال
            </span>
            <h1 dir={RTL.test(a.question) ? "rtl" : "auto"} className="masla-question">
              {a.question}
            </h1>
          </div>

          <div className={`markdown masla-answer${rtl ? " rtl" : ""}`} dir={rtl ? "rtl" : "auto"}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{a.answer}</ReactMarkdown>
          </div>

          <section className="masla-sources">
            <h2>
              حوالہ جات
              <span>References</span>
            </h2>
            <ol className="sources-list">
              {a.sources.map((s, i) => {
                const href = sourceHref(s);
                return (
                  <li key={`${s.reference}-${i}`} className="source-item">
                    <p className="source-ref">{s.reference || s.title}</p>
                    <blockquote className="source-quote urdu" dir="rtl" lang="ur">
                      {s.content}
                    </blockquote>
                    {href && (
                      <Link href={href} className="source-link">
                        Read the original page
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M5 12h14M13 6l6 6-6 6" />
                        </svg>
                      </Link>
                    )}
                  </li>
                );
              })}
            </ol>
          </section>

          <p className="masla-disclaimer">
            This answer was produced by AI Mufti from the books cited above. It is a
            study aid, not a fatwa — for a binding ruling, confirm with a qualified
            mufti.
          </p>
        </article>

        <div className="page-cta">
          <p>Have a different question?</p>
          <Link href="/chat" className="btn btn-primary">
            Ask AI Mufti
          </Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
