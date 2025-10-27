"use client";

import { useEffect } from "react";
import ChatBox from "./components/ChatBox";

export default function HomePage() {
  // Initialize Google AdSense after render
  useEffect(() => {
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.log("AdSense error:", e);
    }
  }, []);

  return (
    <main className="flex flex-col items-center justify-between min-h-screen">
      {/* Header */}
      <header className="py-6 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-green-700">
          🤖 Digital Mufti
        </h1>
        <p className="text-sm text-gray-600 mt-2">
          AI Islamic Scholar | Sunni Hanafi Fiqh | Authentic Fatwas
        </p>
      </header>

      {/* Chat Section */}
      <section className="flex-1 w-full max-w-2xl bg-white/70 backdrop-blur-md rounded-3xl shadow-lg p-6 mb-4 border border-green-100">
        <ChatBox />
      </section>

      {/* Footer with AdSense */}
      <footer className="w-full text-center py-4 border-t border-green-200">
        <p className="text-xs text-gray-600">
          © {new Date().getFullYear()} Digital Mufti — Powered by{" "}
          <span className="font-semibold text-green-700">
            Sabter Raza Qadri
          </span>
        </p>

        {/* ✅ Google AdSense Banner */}
        <div className="mt-3 flex justify-center">
          <ins
            className="adsbygoogle"
            style={{ display: "block", width: "100%", height: "90px" }}
            data-ad-client="ca-pub-7846074061736370"
            data-ad-slot="1234567890" // ⚠️ apna real ad slot yahan likhna
            data-ad-format="auto"
            data-full-width-responsive="true"
          ></ins>
        </div>
      </footer>
    </main>
  );
}
