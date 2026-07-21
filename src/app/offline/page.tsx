import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Offline",
  robots: { index: false, follow: false },
};

export default function OfflinePage() {
  return (
    <main className="page page-prose">
      <div className="page-head">
        <span className="eyebrow">Offline</span>
        <h1>You are not connected.</h1>
        <p>
          AI Mufti needs a connection to look up sources, so it cannot answer right
          now. Your saved chats will still be here when you are back online.
        </p>
      </div>
      <Link href="/chat" className="btn btn-primary">
        Try again
      </Link>
    </main>
  );
}
