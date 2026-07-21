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
      { url: `${SITE_URL}/about`, changeFrequency: "monthly", priority: 0.8 },
      { url: `${SITE_URL}/tools/prayer-times`, changeFrequency: "daily", priority: 0.7 },
      { url: `${SITE_URL}/tools/qibla`, changeFrequency: "monthly", priority: 0.6 },
      { url: `${SITE_URL}/tools/calendar`, changeFrequency: "daily", priority: 0.6 },
      { url: `${SITE_URL}/tools/zakat`, changeFrequency: "monthly", priority: 0.6 },
    ] as const
  ).map((r) => ({ ...r, lastModified: now }));

  // Books and their volumes. The ~11,000 individual page URLs are deliberately
  // left out: every one of them is linked from its volume index, so crawlers
  // reach them anyway, and listing them would push the sitemap into megabytes.
  let libraryRoutes: MetadataRoute.Sitemap = [];
  try {
    const categories = await libraryApi.categories();
    const categoryRoutes = categories.map((c) => ({
      url: `${SITE_URL}/library/category/${c.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));

    const books = await libraryApi.books();
    const details = await Promise.all(books.map((b) => libraryApi.book(b.slug)));

    libraryRoutes = books.flatMap((b, i) => {
      const detail = details[i];
      const bookUrl = {
        url: `${SITE_URL}/library/${b.slug}`,
        lastModified: now,
        changeFrequency: "monthly" as const,
        priority: 0.6,
      };
      const jildUrls = (detail?.jilds ?? []).map((j) => ({
        url: `${SITE_URL}/library/${b.slug}/${j.jild}`,
        lastModified: now,
        changeFrequency: "monthly" as const,
        priority: 0.5,
      }));
      return [bookUrl, ...jildUrls];
    });
    libraryRoutes = [...categoryRoutes, ...libraryRoutes];
  } catch {
    // Sitemap must still build if the backend is briefly unreachable.
  }

  return [...staticRoutes, ...libraryRoutes];
}
