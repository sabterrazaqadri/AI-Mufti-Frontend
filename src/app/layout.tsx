import type { Metadata, Viewport } from "next";
import { Geist, Noto_Nastaliq_Urdu, Cormorant_Garamond } from "next/font/google";
import { ToastProvider } from "./components/ToastProvider";
import { ConfirmProvider } from "./components/ConfirmProvider";
import ServiceWorker from "./components/ServiceWorker";
import "./globals.css";
// Loaded after globals so the site/marketing layer can build on its tokens.
import "./site.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

// Display serif for headings — the scholarly register the product is going for.
// Body copy stays on the sans for legibility at small sizes.
const cormorant = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const notoUrdu = Noto_Nastaliq_Urdu({
  variable: "--font-urdu",
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const SITE_URL = "https://digitalmufti.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "AI Mufti — Hanafi Ahl-e-Sunnat wa Jama'at Islamic Q&A",
    template: "%s · AI Mufti",
  },
  description:
    "Ask authentic Islamic questions and get clear, sourced answers based on the Sunni Hanafi Ahl-e-Sunnat wa Jama'at school — referencing Fatawa Razvia, Bahar-e-Shariat and classical Hanafi works. Ask and get answered in any language — Urdu, Roman Urdu, English, Arabic and more.",
  keywords: [
    "AI Mufti", "Islamic Q&A", "Hanafi fiqh", "Barelvi", "Ahl-e-Sunnat",
    "Fatawa Razvia", "Bahar-e-Shariat", "Islamic chatbot", "masail", "fatwa",
  ],
  applicationName: "AI Mufti",
  authors: [{ name: "Sabter Raza Qadri" }],
  icons: {
    icon: [
      { url: "/logo.svg", type: "image/svg+xml" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: "/apple-icon.png",
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    title: "AI Mufti — Hanafi Ahl-e-Sunnat wa Jama'at Islamic Q&A",
    description:
      "Clear, sourced answers based on the Sunni Hanafi Ahl-e-Sunnat wa Jama'at school of thought.",
    siteName: "AI Mufti",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "AI Mufti" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Mufti — Hanafi Ahl-e-Sunnat wa Jama'at Islamic Q&A",
    description:
      "Clear, sourced answers based on the Sunni Hanafi Ahl-e-Sunnat wa Jama'at school.",
    images: ["/og.png"],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#16a34a" },
    { media: "(prefers-color-scheme: dark)", color: "#07120b" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${cormorant.variable} ${notoUrdu.variable}`}
    >
      <body>
        <ToastProvider>
          <ConfirmProvider>{children}</ConfirmProvider>
        </ToastProvider>
        <ServiceWorker />
      </body>
    </html>
  );
}
