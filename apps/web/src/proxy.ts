import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// Auth route guards are intentionally disabled so every page is browsable
// without a session (template/preview mode). To re-enable protection,
// restore redirects here based on the Better Auth session cookie
// ("better-auth.session_token", "__Secure-" prefixed on HTTPS).
export const proxy = (_request: NextRequest) => {
  return NextResponse.next();
};

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|api).*)",
  ],
};
