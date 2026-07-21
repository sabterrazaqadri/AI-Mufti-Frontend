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
  /** Book tag — links the citation to its /library/<slug> page. */
  slug?: string;
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
}

export interface LibraryPassage {
  title: string;
  reference?: string;
  content: string;
}

export interface LibraryBookPage {
  slug: string;
  name: string;
  total: number;
  page: number;
  per_page: number;
  pages: number;
  passages: LibraryPassage[];
}

/**
 * Library reads are public and unauthenticated, so they can run on the server for
 * SEO. Revalidated hourly — the corpus only changes when a new book is ingested.
 */
export const libraryApi = {
  books: async (): Promise<LibraryBook[]> => {
    // Never throw: these run during the production build, and a sleeping or
    // briefly unreachable backend must degrade to an empty shelf, not fail
    // the whole deploy.
    try {
      const res = await fetch(`${API_URL}/api/library/books`, {
        next: { revalidate: 3600 },
      });
      if (!res.ok) return [];
      const data = await res.json();
      return data.books ?? [];
    } catch {
      return [];
    }
  },

  book: async (slug: string, page = 1): Promise<LibraryBookPage | null> => {
    try {
      const res = await fetch(
        `${API_URL}/api/library/books/${encodeURIComponent(slug)}?page=${page}`,
        { next: { revalidate: 3600 } }
      );
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },
};

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
