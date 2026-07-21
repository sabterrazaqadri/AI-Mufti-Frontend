import { getToken } from "./auth-client";

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://digital-mufti-backend.onrender.com";

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
 * Library reads are public and unauthenticated, so they can run on the server for
 * SEO. Revalidated hourly — the corpus only changes when a new book is ingested.
 *
 * None of these throw: they run during the production build, and a sleeping or
 * briefly unreachable backend must degrade to an empty shelf, not fail the deploy.
 */
async function getJson<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${API_URL}${path}`, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
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
