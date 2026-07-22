"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "./Logo";

/** Inline SVG icons — no icon font, no emoji, so they inherit colour and stay crisp. */
const icons = {
  chat: (
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  ),
  library: (
    <>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </>
  ),
  quran: (
    <>
      <path d="M12 6.5C10.5 5 8.5 4.5 6 4.5A2 2 0 0 0 4 6.5v11a2 2 0 0 0 2 2c2.5 0 4.5.5 6 2 1.5-1.5 3.5-2 6-2a2 2 0 0 0 2-2v-11a2 2 0 0 0-2-2c-2.5 0-4.5.5-6 2z" />
      <path d="M12 6.5v13" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" />
    </>
  ),
  masla: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9a2.5 2.5 0 1 1 3.4 2.3c-.6.25-.9.8-.9 1.45V13" />
      <path d="M12 16.5h.01" />
    </>
  ),
  prayer: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  qibla: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M15.5 8.5l-2 5.5-5.5 2 2-5.5 5.5-2z" />
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M16 3v4M8 3v4M3 11h18" />
    </>
  ),
  zakat: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v10M9.5 9.5h4a1.75 1.75 0 0 1 0 3.5h-3a1.75 1.75 0 0 0 0 3.5h4" />
    </>
  ),
};

type NavItem = { href: string; label: string; urdu: string; icon: keyof typeof icons };

// The desktop bar shows the first few; the mobile drawer shows all of them, so
// the bar stays readable while nothing becomes unreachable.
const NAV: NavItem[] = [
  { href: "/chat", label: "Ask a Mufti", urdu: "سوال پوچھیں", icon: "chat" },
  { href: "/quran", label: "Qur'an", urdu: "قرآن", icon: "quran" },
  { href: "/library", label: "Library", urdu: "کتب خانہ", icon: "library" },
  { href: "/search", label: "Search", urdu: "تلاش", icon: "search" },
  { href: "/masla", label: "Masail", urdu: "مسائل", icon: "masla" },
  { href: "/tools/prayer-times", label: "Prayer Times", urdu: "اوقاتِ نماز", icon: "prayer" },
  { href: "/tools/qibla", label: "Qibla", urdu: "قبلہ", icon: "qibla" },
  { href: "/tools/calendar", label: "Hijri Calendar", urdu: "اسلامی کیلنڈر", icon: "calendar" },
  { href: "/tools/zakat", label: "Zakat", urdu: "زکوٰۃ", icon: "zakat" },
];

const DESKTOP_NAV = NAV.slice(0, 5);

function Icon({ name }: { name: keyof typeof icons }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {icons[name]}
    </svg>
  );
}

export default function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close the drawer on navigation and on Escape — a menu that survives a route
  // change traps the user behind an overlay on mobile.
  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link href="/" className="site-brand" aria-label="AI Mufti — home">
          <Logo size={36} />
          <span className="site-brand-text">
            <strong>AI Mufti</strong>
            <small>Hanafi · Ahl-e-Sunnat</small>
          </span>
        </Link>

        <nav className="site-nav" aria-label="Main">
          {DESKTOP_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`site-nav-link${isActive(item.href) ? " active" : ""}`}
              aria-current={isActive(item.href) ? "page" : undefined}
            >
              <Icon name={item.icon} />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="site-header-actions">
          <Link href="/chat" className="btn btn-primary btn-sm site-header-cta">
            Ask a question
          </Link>
          <button
            type="button"
            className="site-menu-toggle"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="site-drawer"
            aria-label={open ? "Close menu" : "Open menu"}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
              {open ? <path d="M18 6L6 18M6 6l12 12" /> : <path d="M3 12h18M3 6h18M3 18h18" />}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <div
        className={`site-drawer-backdrop${open ? " open" : ""}`}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />
      <div id="site-drawer" className={`site-drawer${open ? " open" : ""}`} hidden={!open}>
        <nav aria-label="Mobile">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`site-drawer-link${isActive(item.href) ? " active" : ""}`}
              aria-current={isActive(item.href) ? "page" : undefined}
            >
              <span className="site-drawer-icon">
                <Icon name={item.icon} />
              </span>
              <span className="site-drawer-labels">
                <span>{item.label}</span>
                <span className="urdu" dir="rtl">
                  {item.urdu}
                </span>
              </span>
            </Link>
          ))}
        </nav>
        <Link href="/chat" className="btn btn-primary btn-block">
          Ask a question
        </Link>
      </div>
    </header>
  );
}
