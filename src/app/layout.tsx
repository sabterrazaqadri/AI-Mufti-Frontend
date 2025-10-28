import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Digital Mufti — AI Islamic Scholar",
  description: "Ask authentic Sunni Hanafi fiqh questions and get sourced, respectful answers from the AI Mufti.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={geistSans.variable}>
      <head>
        {/* Google AdSense (kept for author) */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7846074061736370"
          crossOrigin="anonymous"
        ></script>
      </head>
      <body className="min-h-screen text-gray-900">
        <div className="app-container py-10">
          <header className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 md:mb-8 gap-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-linear-to-br from-green-600 to-green-400 flex items-center justify-center text-white font-bold shadow-lg">AI</div>
              <div>
                <h1 className="text-xl font-semibold">AI Mufti</h1>
                <h1 className="text-lg md:text-xl font-semibold">AI Mufti</h1>
                <p className="text-xs text-muted-foreground">AI Islamic QA — Sunni Hanafi</p>
              </div>
            </div>

            <nav aria-label="Primary" className="flex items-center gap-4">
              <a href="/" className="text-sm text-muted-foreground hover:text-black">Home</a>
              <a href="/chat" className="text-sm font-medium text-green-600 bg-green-50 px-3 py-1 rounded-lg">Chat with AI Mufti</a>
            </nav>
          </header>

          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
