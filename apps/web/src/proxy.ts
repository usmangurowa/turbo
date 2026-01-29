import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// Cookie name for the redirect preference
export const REDIRECT_PREFERENCE_COOKIE = "turbo-redirect-to-dashboard";

// Routes that require authentication
const protectedRoutes = ["/dashboard"];

// Routes only accessible when NOT authenticated
const authRoutes = [
  "/login",
  "/create-account",
  "/forgot-password",
  "/reset-password",
];

// Routes that need special handling during auth flow
// These are accessible both with and without session during transitions
const transitionRoutes = ["/onboarding", "/verify-email"];

// Routes that are always accessible
// const publicRoutes = ["/", "/api"];

const getSessionFromCookie = (request: NextRequest) => {
  // Better Auth stores session in a cookie
  // On HTTPS (production), it uses __Secure- prefix
  const sessionCookie =
    request.cookies.get("__Secure-better-auth.session_token") ??
    request.cookies.get("better-auth.session_token");
  return sessionCookie?.value ?? null;
};

const getRedirectPreference = (request: NextRequest): boolean => {
  const cookie = request.cookies.get(REDIRECT_PREFERENCE_COOKIE);
  // Default to true (redirect) if cookie is not set
  if (!cookie) return true;
  return cookie.value === "true";
};

export const proxy = (request: NextRequest) => {
  const path = request.nextUrl.pathname;
  const session = getSessionFromCookie(request);

  // Check if current path is protected
  const isProtectedRoute = protectedRoutes.some((route) =>
    path.startsWith(route),
  );

  // Check if current path is an auth route
  const isAuthRoute = authRoutes.some((route) => path.startsWith(route));

  // Check if current path is a transition route (onboarding, verify-email)
  const isTransitionRoute = transitionRoutes.some((route) =>
    path.startsWith(route),
  );

  // Transition routes are allowed during auth flow - don't redirect
  if (isTransitionRoute) {
    return NextResponse.next();
  }

  // If trying to access protected route without session, redirect to login
  if (isProtectedRoute && !session) {
    const url = new URL("/login", request.url);
    url.searchParams.set("callbackUrl", path);
    return NextResponse.redirect(url);
  }

  // If trying to access auth routes with active session, redirect to dashboard
  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Landing page redirect for authenticated users (based on user preference)
  if (path === "/" && session && getRedirectPreference(request)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
};

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     * - api routes (handled separately)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|api).*)",
  ],
};
