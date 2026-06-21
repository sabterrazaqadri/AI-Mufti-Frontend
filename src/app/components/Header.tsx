"use client";

import Image from "next/image";

export default function Header() {
  return (
    <header className="app-header">
      <div className="app-header-brand">
        <Image
          src="/AI-Mufti.png"
          alt="AI Mufti logo"
          width={32}
          height={32}
          className="app-header-logo"
          priority
        />
        <div className="app-header-titles">
          <span className="app-header-name">AI Mufti</span>
          <span className="app-header-tagline">Islamic guidance, clearly sourced</span>
        </div>
      </div>
      <span className="maslak-badge" title="Sunni Hanafi, Ahl-e-Sunnat wa Jama'at">
        Hanafi · Ahl-e-Sunnat wa Jama&apos;at
      </span>
    </header>
  );
}
