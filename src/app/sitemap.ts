import type { MetadataRoute } from "next";
import { libraryApi } from "./lib/api";

const SITE_URL = "https://digitalmufti.vercel.app";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = (
    [
      { url: SITE_URL, changeFrequency: "weekly", priority: 1 },
      { url: `${SITE_URL}/chat`, changeFrequency: "weekly", priority: 0.9 },
      { url: `${SITE_URL}/library`, changeFrequency: "weekly", priority: 0.8 },
      { url: `${SITE_URL}/tools/prayer-times`, changeFrequency: "daily", priority: 0.7 },
      { url: `${SITE_URL}/tools/qibla`, changeFrequency: "monthly", priority: 0.6 },
      { url: `${SITE_URL}/tools/calendar`, changeFrequency: "daily", priority: 0.6 },
      { url: `${SITE_URL}/tools/zakat`, changeFrequency: "monthly", priority: 0.6 },
    ] as const
  ).map((r) => ({ ...r, lastModified: now }));

  // One entry per book. Individual pages are paginated via ?page= and are reachable
  // from the book's first page, so they are left to the crawler to follow.
  let bookRoutes: MetadataRoute.Sitemap = [];
  try {
    const books = await libraryApi.books();
    bookRoutes = books.map((b) => ({
      url: `${SITE_URL}/library/${b.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    }));
  } catch {
    // Sitemap must still build if the backend is briefly unreachable.
  }

  return [...staticRoutes, ...bookRoutes];
}
