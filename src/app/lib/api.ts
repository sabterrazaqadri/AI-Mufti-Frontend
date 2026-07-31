import { getToken } from "./auth-client";

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://sabter-ai-mufti-backend.hf.space";

export interface Chat {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface Source {
  title: string;
  reference?: string;
  content: string;
  /** Book tag, volume and page — deep-link a citation to the exact original page. */
  slug?: string;
  jild?: number | null;
  page?: number | null;
  score?: number;
}

export interface ChatMessageDTO {
  role: "user" | "assistant";
  content: string;
  sources?: Source[] | null;
}

// Markers of a reply that carries no ruling — the "no mustanad reference" refusal
// or the "I only cover Islamic matters" out-of-scope reply. Mirrors the backend's
// _REFUSAL_MARKERS. Citations must never render under such an answer.
const REFUSAL_MARKERS = [
  "مستند حوالہ نہیں",
  "mustanad hawala nahi",
  "authentic reference on this matter",
  "صرف اسلامی مسائل",
  "sirf islami masail",
  "only have knowledge about islamic matters",
  "only cover islamic matters",
];

/** True when the answer text is a refusal / out-of-scope reply (no ruling given). */
export function isRefusalAnswer(text: string | null | undefined): boolean {
  const low = (text || "").toLowerCase();
  return REFUSAL_MARKERS.some((m) => low.includes(m.toLowerCase()));
}

/** Decode the base64(JSON) X-Sources header into citation cards (UTF-8 safe). */
export function decodeSources(header: string | null): Source[] {
  if (!header) return [];
  try {
    const bytes = Uint8Array.from(atob(header), (c) => c.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    return [];
  }
}

/**
 * fetch wrapper that attaches the Better Auth JWT (if signed in) so the backend
 * can derive identity from a verified token instead of a client-supplied id.
 */
export async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  const token = await getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  return fetch(`${API_URL}${path}`, { ...init, headers });
}

export interface LibraryBook {
  slug: string;
  name: string;
  passages: number;
  /** Shelf slug, assigned by the backend. Never empty — falls back to "mutafarriq". */
  category: string;
}

export interface LibraryCategory {
  slug: string;
  name: string;
  urdu: string;
  desc: string;
  books: LibraryBook[];
  book_count: number;
  passages: number;
}

export interface LibraryPassage {
  title: string;
  reference?: string;
  content: string;
}

export interface LibraryJild {
  jild: number;
  pages: number;
  passages: number;
}

export interface LibraryBookDetail {
  slug: string;
  name: string;
  category?: { slug: string; name: string; urdu: string };
  /** False for books scraped by section, which carry no printed page number. */
  has_safha: boolean;
  jilds: LibraryJild[];
  total_pages: number;
  total_passages: number;
}

export interface LibraryJildDetail {
  slug: string;
  name: string;
  has_safha: boolean;
  jild: number;
  pages: { page: number; heading: string | null; passages: number }[];
}

export interface LibraryPageDetail {
  slug: string;
  name: string;
  jild: number;
  page: number;
  heading: string | null;
  passages: LibraryPassage[];
  prev: number | null;
  next: number | null;
}

/**
 * How long a rendered library page stays cached. Deliberately short: the corpus
 * only changes when a book is ingested, but a page rendered while the backend was
 * asleep shows "could not be reached", and that failure gets cached too — an hour
 * of a broken shelf is far worse than re-rendering a page that rarely changes.
 */
export const LIBRARY_REVALIDATE = 300;

/**
 * Library reads are public and unauthenticated, so they can run on the server for
 * SEO.
 *
 * None of these throw: they run during the production build, and a sleeping or
 * briefly unreachable backend must degrade to an empty shelf, not fail the deploy.
 * They do retry, because "briefly unreachable" is the normal case on a free tier
 * that spins down after 15 minutes idle and needs ~30s to wake.
 */
async function getJson<T>(path: string, attempts = 3): Promise<T | null> {
  for (let i = 0; i < attempts; i += 1) {
    try {
      const res = await fetch(`${API_URL}${path}`, {
        next: { revalidate: LIBRARY_REVALIDATE },
        // The backend sleeps on the free tier and takes ~30s to wake, so the
        // first try is short and later ones wait out a cold start.
        signal: AbortSignal.timeout(i === 0 ? 8000 : 30000),
      });
      if (res.ok) return (await res.json()) as T;
      // A 404/400 is a real answer — retrying it just stalls the render.
      if (res.status < 500) return null;
    } catch {
      // Timeout or network error: the backend is probably still waking up.
    }
    if (i < attempts - 1) {
      await new Promise((r) => setTimeout(r, 1000 * (i + 1)));
    }
  }
  return null;
}

export const libraryApi = {
  books: async (): Promise<LibraryBook[]> => {
    const data = await getJson<{ books: LibraryBook[] }>("/api/library/books");
    return data?.books ?? [];
  },

  categories: async (): Promise<LibraryCategory[]> => {
    const data = await getJson<{ categories: LibraryCategory[] }>(
      "/api/library/categories"
    );
    return data?.categories ?? [];
  },

  category: (slug: string) =>
    getJson<LibraryCategory>(`/api/library/categories/${encodeURIComponent(slug)}`),

  book: (slug: string) =>
    getJson<LibraryBookDetail>(`/api/library/books/${encodeURIComponent(slug)}`),

  jild: (slug: string, jild: number) =>
    getJson<LibraryJildDetail>(`/api/library/books/${encodeURIComponent(slug)}/${jild}`),

  page: (slug: string, jild: number, page: number) =>
    getJson<LibraryPageDetail>(
      `/api/library/books/${encodeURIComponent(slug)}/${jild}/${page}`
    ),
};

export interface QuranIndex {
  pages: { page: number; surah: string | null }[];
  total: number;
  surahs: { surah: string; page: number }[];
}

export interface QuranPage {
  page: number;
  surah: string | null;
  reference: string | null;
  lead: string;
  ayat: { number: number; text: string }[];
  prev: number | null;
  next: number | null;
}

export const quranApi = {
  index: () => getJson<QuranIndex>("/api/quran/pages"),
  page: (n: number) => getJson<QuranPage>(`/api/quran/pages/${n}`),
};

export interface PublicAnswer {
  slug: string;
  question: string;
  answer: string;
  sources: Source[];
  views?: number;
  created_at: string;
}

export const answersApi = {
  get: (slug: string) =>
    getJson<PublicAnswer>(`/api/answers/${encodeURIComponent(slug)}`),

  list: async (limit = 60): Promise<{ slug: string; question: string; created_at: string }[]> => {
    const data = await getJson<{ answers: { slug: string; question: string; created_at: string }[] }>(
      `/api/answers?limit=${limit}`
    );
    return data?.answers ?? [];
  },

  /** Publishing is a user action, so this one is a live POST, not a cached read. */
  publish: (question: string, answer: string, sources: Source[]) =>
    fetch(`${API_URL}/api/answers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, answer, sources }),
    }),
};

/** Path to the original page a citation came from, when we know it precisely. */
export function sourceHref(s: Source): string | null {
  if (!s.slug) return null;
  if (s.jild == null || s.page == null) return `/library/${s.slug}`;
  return `/library/${s.slug}/${s.jild}/${s.page}`;
}

export const chatApi = {
  list: () => apiFetch("/api/chats"),

  create: (title = "New Chat") =>
    apiFetch("/api/chats", { method: "POST", body: JSON.stringify({ title }) }),

  rename: (chatId: string, title: string) =>
    apiFetch(`/api/chats/${chatId}/title`, { method: "PUT", body: JSON.stringify({ title }) }),

  remove: (chatId: string) => apiFetch(`/api/chats/${chatId}`, { method: "DELETE" }),

  messages: (chatId: string) => apiFetch(`/api/chats/${chatId}/messages`),

  send: (body: { content: string; chat_id: string | null }, signal?: AbortSignal) =>
    apiFetch("/chat", { method: "POST", body: JSON.stringify(body), signal }),
};
