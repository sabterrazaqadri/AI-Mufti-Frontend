import type { MetadataRoute } from "next";

/**
 * Installable web app. This is the cheap answer to a native app: "Add to Home
 * Screen" gives a launcher icon, a standalone window with no browser chrome, and
 * a splash screen — without an App Store review cycle.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "AI Mufti — Islamic answers from the Qur'an and Hadith",
    short_name: "AI Mufti",
    description:
      "Ask any Islamic question and get an answer grounded in the Qur'an and Hadith, shown with the exact page it came from.",
    start_url: "/chat",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f6fbf5",
    theme_color: "#16a34a",
    lang: "ur",
    dir: "auto",
    categories: ["education", "books", "lifestyle"],
    icons: [
      { src: "/AI-Mufti.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/AI-Mufti.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/AI-Mufti.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Ask a question", url: "/chat" },
      { name: "Prayer times", url: "/tools/prayer-times" },
      { name: "Library", url: "/library" },
    ],
  };
}
