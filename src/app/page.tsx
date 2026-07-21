import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "./components/SiteHeader";
import SiteFooter from "./components/SiteFooter";
import { libraryApi } from "./lib/api";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "AI Mufti — Islamic AI Answers from the Qur'an and Hadith",
  description:
    "Ask any Islamic question and get an answer grounded in the Qur'an al-Kareem and the Hadith of the Prophet ﷺ, explained through the classical books of the ulama and shown with the exact page. Hanafi, Ahl-e-Sunnat wa Jama'at. Urdu, Roman Urdu and English — free, no account needed.",
  alternates: { canonical: "/" },
};

const FAQS = [
  {
    q: "What is AI Mufti?",
    a: "AI Mufti is an Islamic question-and-answer assistant for the Sunni Hanafi, Ahl-e-Sunnat wa Jama'at (Razvi) school. Every answer is drawn from a digitised library of authentic Urdu and Arabic works rather than from the model's own memory, and each ruling is quoted with its book, volume and page number.",
  },
  {
    q: "Which books does it answer from?",
    a: "Bahar-e-Shariat, Fatawa Razawiyya, Miraat-ul-Manajeeh (sharh of Mishkat), Sirat-ul-Jinan, Ja Al-Haq, Qanoon-e-Shariat, Anwaar-ul-Hadees, Ihya-ul-Uloom and more — the full list, with every page browsable, is on the Library page.",
  },
  {
    q: "What happens if there is no reference for my question?",
    a: "It refuses. If no passage in the library supports an answer, AI Mufti says it has no mustanad reference instead of guessing. This is enforced in the retrieval layer, not merely requested in a prompt — an unsupported ruling is never generated in the first place.",
  },
  {
    q: "Can I ask in Roman Urdu?",
    a: "Yes. Write \"namaz e janaza ka tareeqa\" or \"سجدۂ سہو کب واجب ہے؟\" or plain English — AI Mufti replies in the same language and script you used, and keeps Qur'anic and hadith text in Arabic script.",
  },
  {
    q: "Do I need an account?",
    a: "No. Asking questions is free and requires no sign-up. An account only saves your chat history so you can return to it from another device.",
  },
  {
    q: "How is this different from ChatGPT?",
    a: "A general assistant answers Islamic questions from whatever it absorbed while training, and will confidently invent a page number. AI Mufti can only repeat what is actually printed in the books it has ingested, follows one clearly stated maslak instead of blending schools, and refuses when the library is silent.",
  },
  {
    q: "Is AI Mufti a replacement for a real mufti?",
    a: "No. It is a study aid. For talaq, inheritance, and anything where the details change the ruling, confirm with a qualified mufti or your local Dar al-Ifta.",
  },
];

const TOOLS = [
  { href: "/tools/prayer-times", title: "Prayer Times", urdu: "اوقاتِ نماز", desc: "Hanafi Asr, for your exact location" },
  { href: "/tools/qibla", title: "Qibla Direction", urdu: "سمتِ قبلہ", desc: "Live compass and precise bearing" },
  { href: "/tools/calendar", title: "Hijri Calendar", urdu: "اسلامی کیلنڈر", desc: "Today's date and the full month" },
  { href: "/tools/zakat", title: "Zakat Calculator", urdu: "حسابِ زکوٰۃ", desc: "Nisab by gold or silver" },
];

function nf(n: number) {
  return new Intl.NumberFormat("en-US").format(n);
}

export default async function LandingPage() {
  const books = await libraryApi.books();
  const totalPassages = books.reduce((sum, b) => sum + Number(b.passages || 0), 0);
  const topBooks = books.slice(0, 8);

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  const appJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "AI Mufti",
    applicationCategory: "EducationalApplication",
    operatingSystem: "Any",
    description:
      "Islamic question-and-answer assistant answering from authentic Hanafi Ahl-e-Sunnat books with page-level citations.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    inLanguage: ["ur", "en", "ar"],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(appJsonLd) }}
      />

      <SiteHeader />

      <main className="landing">
        {/* ─── Hero ─────────────────────────────────────────────── */}
        <section className="hero">
          <div className="hero-arch" aria-hidden="true" />
          <div className="hero-inner">
            <p className="hero-bismillah" dir="rtl" lang="ar">
              بِسْمِ اللہِ الرَّحْمٰنِ الرَّحِیْمِ
            </p>

            {/* Name and promise in one heading: the brand line names the thing,
                the sentence says what it does. Both stay inside the h1 so the
                key phrase and the name are indexed together. */}
            <h1 className="hero-title">
              <span className="hero-title-brand">Digital Mufti</span>
              Your Islamic AI guide from the
              <span className="hero-title-accent"> Qur&apos;an and Hadith.</span>
            </h1>

            <p className="hero-sub">
              Ask anything in Urdu, Roman Urdu or English. AI Mufti answers from the
              Qur&apos;an al-Kareem and the Hadith of the Prophet ﷺ — understood through
              the classical books of the ulama, and always shown with the exact page the
              ruling came from. When the sources are silent, so is it.
            </p>

            {/* The maslak follows the message rather than leading it: a reader must
                first see what this is, then whose position it gives. */}
            <p className="hero-maslak">
              <span className="hero-maslak-label">Maslak</span>
              Hanafi · Ahl-e-Sunnat wa Jama&apos;at
            </p>

            <div className="hero-actions">
              <Link href="/chat" className="btn btn-primary btn-lg">
                Ask a question
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </Link>
              <Link href="/library" className="btn btn-ghost btn-lg">
                Browse the library
              </Link>
            </div>

            <p className="hero-note">Free · No account required</p>
          </div>
        </section>

        {/* ─── Proof ────────────────────────────────────────────── */}
        <section className="proof" aria-label="Library at a glance">
          <div className="proof-inner">
            <div className="stat">
              <span className="stat-num">{books.length || "26"}</span>
              <span className="stat-label">Authentic books ingested</span>
            </div>
            <div className="stat">
              <span className="stat-num">{totalPassages ? nf(totalPassages) : "22,000"}+</span>
              <span className="stat-label">Passages, each with jild &amp; safha</span>
            </div>
            <div className="stat">
              <span className="stat-num">4</span>
              <span className="stat-label">Languages — Urdu, Roman Urdu, English, Arabic</span>
            </div>
            <div className="stat">
              <span className="stat-num">0</span>
              <span className="stat-label">Rulings invented without a source</span>
            </div>
          </div>
        </section>

        {/* ─── The difference ───────────────────────────────────── */}
        <section className="section" id="how">
          <div className="section-inner">
            <span className="eyebrow">Why it can be trusted</span>
            <h2 className="section-title">
              A general AI guesses the page number. This one cannot.
            </h2>

            <div className="cards-3">
              <article className="card">
                <div className="card-num">١</div>
                <h3>It reads before it answers</h3>
                <p>
                  Your question is matched against the actual text of the books. The
                  passages it finds are what the answer is built from — nothing is
                  recalled from training data.
                </p>
              </article>
              <article className="card">
                <div className="card-num">٢</div>
                <h3>It refuses rather than guess</h3>
                <p>
                  If no passage clears the similarity threshold, no ruling is produced.
                  You get <em>&ldquo;koi mustanad hawala nahi&rdquo;</em> — an honest
                  silence instead of a confident fabrication.
                </p>
              </article>
              <article className="card">
                <div className="card-num">٣</div>
                <h3>One maslak, stated plainly</h3>
                <p>
                  Rulings follow Imam-e-Azam Abu Hanifa and the verified positions of
                  A&apos;la Hazrat Imam Ahmad Raza Khan. No blending of schools, no
                  ambiguity about where an answer comes from.
                </p>
              </article>
            </div>
          </div>
        </section>

        {/* ─── Library preview ──────────────────────────────────── */}
        <section className="section section-alt" id="library">
          <div className="section-inner">
            <span className="eyebrow">The library</span>
            <h2 className="section-title">Read the sources yourself.</h2>
            <p className="section-lede">
              The Qur&apos;an and Hadith are the proof; these books are how the ulama
              explained them — tafseer, sharh of hadith, and the fiqh derived from both.
              Nothing is hidden behind the answer: every one of them is open to browse,
              page by page.
            </p>

            <div className="books-grid">
              {topBooks.map((b) => (
                <Link key={b.slug} href={`/library/${b.slug}`} className="book-card">
                  <span className="book-spine" aria-hidden="true" />
                  <span className="book-name">{b.name}</span>
                  <span className="book-count">{nf(Number(b.passages))} passages</span>
                </Link>
              ))}
            </div>

            <Link href="/library" className="btn btn-ghost">
              See all {books.length || 26} books
            </Link>
          </div>
        </section>

        {/* ─── Daily tools ──────────────────────────────────────── */}
        <section className="section" id="tools">
          <div className="section-inner">
            <span className="eyebrow">Every day</span>
            <h2 className="section-title">The things you check daily.</h2>

            <div className="tools-grid">
              {TOOLS.map((t) => (
                <Link key={t.href} href={t.href} className="tool-card">
                  <h3>
                    {t.title}
                    <span className="urdu" dir="rtl">
                      {t.urdu}
                    </span>
                  </h3>
                  <p>{t.desc}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ─── FAQ ──────────────────────────────────────────────── */}
        <section className="section section-alt" id="faq">
          <div className="section-inner section-narrow">
            <span className="eyebrow">Questions</span>
            <h2 className="section-title">Before you ask.</h2>

            <div className="faq">
              {FAQS.map((f) => (
                <details key={f.q} className="faq-item">
                  <summary>
                    {f.q}
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </summary>
                  <p>{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Closing CTA ──────────────────────────────────────── */}
        <section className="cta">
          <div className="cta-inner">
            <h2>Ask your first mas&apos;ala.</h2>
            <p>No sign-up, no cost. Just the question you actually have.</p>
            <Link href="/chat" className="btn btn-primary btn-lg">
              Open AI Mufti
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
