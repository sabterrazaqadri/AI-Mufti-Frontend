import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { ToastProvider } from "./components/ToastProvider";
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
    <ClerkProvider>
      <html lang="en" className={geistSans.variable}>
        <body>
          <ToastProvider>
            <main>{children}</main>
          </ToastProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
