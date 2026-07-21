import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import { libraryApi } from "../lib/api";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "About & Maslak — Hanafi, Ahl-e-Sunnat wa Jama'at",
  description:
    "AI Mufti follows the Sunni Hanafi, Ahl-e-Sunnat wa Jama'at (Razvi) maslak. How answers are built from real books, when it refuses to answer, and why it is not a replacement for a qualified mufti.",
  alternates: { canonical: "/about" },
};

const nf = (n: number) => new Intl.NumberFormat("en-US").format(n);

export default async function AboutPage() {
  const books = await libraryApi.books();
  const totalPassages = books.reduce((s, b) => s + Number(b.passages || 0), 0);

  return (
    <>
      <SiteHeader />
      <main className="page page-prose">
        <div className="page-head">
          <span className="eyebrow">About</span>
          <h1>What AI Mufti is, and what it is not.</h1>
          <p>
            An honest account of the maslak it follows, where its answers come from,
            and the limits it is built to respect.
          </p>
        </div>

        <section className="prose-section">
          <h2>The maslak</h2>
          <p>
            AI Mufti answers according to <strong>Ahl-e-Sunnat wa Jama&apos;at</strong>,
            the <strong>Hanafi</strong> school of fiqh in the{" "}
            <strong>Barelvi (Razvi)</strong> tradition. Rulings follow Imam-e-Azam Abu
            Hanifa (رحمۃ اللہ علیہ) and the verified positions of A&apos;la Hazrat Imam
            Ahmad Raza Khan (رحمۃ اللہ علیہ). On matters of aqeedah it holds the
            Ahl-e-Sunnat position.
          </p>
          <p>
            This is stated plainly on purpose. An assistant that quietly blends four
            madhahib leaves you to work out which answer is yours. If you follow this
            maslak, you should know exactly whose position you are reading — and if you
            follow another, you should know that just as clearly before you rely on it.
          </p>
        </section>

        <section className="prose-section">
          <h2>Where the answers come from</h2>
          <p>
            Every substantive answer is built from{" "}
            <strong>
              {books.length || 26} digitised books, {nf(totalPassages) || "22,978"}{" "}
              passages
            </strong>{" "}
            — Bahar-e-Shariat, Fatawa Razawiyya, Miraat-ul-Manajeeh, Sirat-ul-Jinan, Ja
            Al-Haq, Qanoon-e-Shariat and others. The whole library is{" "}
            <Link href="/library">open for you to read</Link>, page by page.
          </p>
          <ol className="prose-steps">
            <li>
              <strong>Your question is matched against the actual text</strong> of those
              books — not against the model&apos;s training memory.
            </li>
            <li>
              <strong>The passages it finds become the answer.</strong> The model is
              given those excerpts and instructed to rule from them and nothing else.
            </li>
            <li>
              <strong>The reference is copied, never composed.</strong> Volume and page
              numbers are taken verbatim from the passage — the model is not permitted
              to supply one of its own.
            </li>
            <li>
              <strong>You can check it.</strong> Each citation links to the original
              page in the library, so the ruling and its source sit side by side.
            </li>
          </ol>
        </section>

        <section className="prose-section">
          <h2>When it refuses</h2>
          <p>
            If no passage in the library supports an answer, AI Mufti says so —{" "}
            <em>&ldquo;koi mustanad hawala nahi&rdquo;</em> — instead of producing a
            plausible-sounding ruling. This is enforced before generation: a question
            whose retrieval comes back empty never reaches the model with permission to
            rule.
          </p>
          <p>It also declines, honestly and by name, in two other cases:</p>
          <ul>
            <li>
              <strong>Questions that are not Islamic matters</strong> — space, sport,
              general trivia. It says it only covers Islamic matters, rather than
              pretending a reference is missing.
            </li>
            <li>
              <strong>Counting questions</strong> — how many times a word appears in the
              Qur&apos;an, and the like. It looks passages up; it does not tally text,
              and it will not guess a number.
            </li>
          </ul>
        </section>

        <section className="prose-section">
          <h2>What it is not</h2>
          <p>
            <strong>It is not a mufti, and it is not a fatwa.</strong> It is a study aid
            that shows you what the books say and exactly where they say it. A real
            ruling depends on circumstances no software asks about.
          </p>
          <p>
            For <strong>talaq, mirath, nikah</strong>, serious financial or medical
            matters — or any question where the details change the verdict — take the
            answer and its references to a qualified mufti or your local Dar al-Ifta and
            confirm it. Every answer carries a button to send the whole exchange on for
            exactly that.
          </p>
          <p>
            It can also simply be wrong: retrieval can surface the wrong passage, and
            OCR of Urdu text is not perfect. The library is open so that you never have
            to take its word for anything.
          </p>
        </section>

        <div className="page-cta">
          <p>Ready to ask?</p>
          <Link href="/chat" className="btn btn-primary">
            Open AI Mufti
          </Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
