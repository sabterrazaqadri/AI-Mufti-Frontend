import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

// The home/chat page is open to guests (stateless). Real authorization is
// enforced by the FastAPI backend, which verifies the Better Auth JWT.
//
// /admin is gated here too, but only for the look of it: a signed-out visitor is
// bounced instead of landing on a page of error messages. The backend still refuses
// every admin route unless the caller's verified identity is on its allowlist —
// a session cookie alone buys nothing.
const PROTECTED_PREFIXES: string[] = ["/admin"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const needsAuth = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  if (!needsAuth) return NextResponse.next();

  const session = getSessionCookie(req);
  if (!session) {
    const url = req.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|api/auth|.*\\..*).*)"],
};
