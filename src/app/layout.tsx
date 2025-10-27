import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Script } from "vm";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Digital Mufti | AI Islamic Scholar",
  description: "AI Mufti trained on authentic Sunni Hanafi Fiqh sources.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* ✅ Google AdSense */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7846074061736370"
          crossOrigin="anonymous"
        ></script>
      </head>
      <body className="bg-linear-to-b from-green-100 via-white to-green-50 text-gray-900">
        {children}
      </body>
    </html>
  );
}
