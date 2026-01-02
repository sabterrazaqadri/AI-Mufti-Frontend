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
      <body>
          <main>{children}</main>
      </body>
    </html>
  );
}
