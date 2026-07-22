"use client";

import Link from "next/link";
import Logo from "./Logo";

/**
 * Chat-app chrome. Distinct from SiteHeader (which is for the marketing and
 * library pages) — but the brand and these two links are the only way out of the
 * chat, so they must always be present.
 */
export default function Header() {
  return (
    <header className="app-header">
      <Link href="/" className="app-header-brand" aria-label="AI Mufti — home">
        <Logo size={34} className="app-header-logo" />
        <div className="app-header-titles">
          <span className="app-header-name">AI Mufti</span>
          <span className="app-header-tagline">Islamic guidance, clearly sourced</span>
        </div>
      </Link>

      <div className="app-header-right">
        <nav className="app-header-links" aria-label="Site">
          <Link href="/library">Library</Link>
          <Link href="/tools/prayer-times">Prayer Times</Link>
        </nav>
        <span className="maslak-badge" title="Sunni Hanafi, Ahl-e-Sunnat wa Jama'at">
          Hanafi · Ahl-e-Sunnat wa Jama&apos;at
        </span>
      </div>
    </header>
  );
}
