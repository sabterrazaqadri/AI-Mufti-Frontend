import Link from "next/link";

const COLUMNS = [
  {
    heading: "Ask",
    links: [
      { href: "/chat", label: "Ask a Mufti" },
      { href: "/library", label: "Library" },
      { href: "/about", label: "About & Maslak" },
    ],
  },
  {
    heading: "Daily",
    links: [
      { href: "/tools/prayer-times", label: "Prayer Times" },
      { href: "/tools/qibla", label: "Qibla Direction" },
      { href: "/tools/calendar", label: "Hijri Calendar" },
      { href: "/tools/zakat", label: "Zakat Calculator" },
    ],
  },
];

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="site-footer-brand">
          <p className="site-footer-bismillah" dir="rtl" lang="ar">
            بِسْمِ اللہِ الرَّحْمٰنِ الرَّحِیْمِ
          </p>
          <p className="site-footer-desc">
            AI Mufti answers from a digitised library of authentic Ahl-e-Sunnat wa
            Jama&apos;at works, and stays silent when it has no source to stand on.
          </p>
        </div>

        {COLUMNS.map((col) => (
          <nav key={col.heading} className="site-footer-col" aria-label={col.heading}>
            <h3>{col.heading}</h3>
            {col.links.map((l) => (
              <Link key={l.href} href={l.href}>
                {l.label}
              </Link>
            ))}
          </nav>
        ))}
      </div>

      <div className="site-footer-bottom">
        <p>
          AI Mufti is a study aid, not a substitute for a qualified mufti. For talaq,
          mirath and other binding matters, confirm with your local Dar al-Ifta.
        </p>
        <p className="site-footer-credit">
          Built by Sabter Raza Qadri · © {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  );
}
