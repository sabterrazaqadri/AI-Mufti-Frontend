"use client";

import { createAuthClient } from "better-auth/react";

// baseURL defaults to the current origin in the browser.
// refetchOnWindowFocus is disabled so the session isn't re-fetched every time the
// tab regains focus (it defaults to true, which spams /api/auth/get-session as you
// switch windows). Session is still fetched on mount and after auth actions.
export const authClient = createAuthClient({
  sessionOptions: { refetchOnWindowFocus: false },
});

export const { signIn, signUp, signOut, useSession } = authClient;

/**
 * Fetch a short-lived JWT (minted by the Better Auth `jwt` plugin) to send as a
 * Bearer token to the FastAPI backend. Returns null for signed-out (guest) users.
 */
export async function getToken(): Promise<string | null> {
  try {
    const res = await fetch("/api/auth/token", { credentials: "include" });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.token ?? null;
  } catch {
    return null;
  }
}
