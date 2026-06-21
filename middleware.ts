import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

// The home/chat page is open to guests (stateless). Real authorization is
// enforced by the FastAPI backend, which verifies the Better Auth JWT.
// Add paths here if you later want to gate them at the edge.
const PROTECTED_PREFIXES: string[] = [];

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
