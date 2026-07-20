import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { locales, defaultLocale, type Locale } from "./i18n/config";
import { detectLocaleFromCountry } from "./lib/country-locale";

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: "as-needed",
  localeDetection: false, // we handle detection ourselves (by IP) below
});

const LOCALE_COOKIE = "NEXT_LOCALE";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip intl middleware for API and admin routes entirely — intl would
  // rewrite them to /en/admin/... which doesn't exist as a file route.
  if (pathname.startsWith("/api") || pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  // If URL already has an explicit locale prefix, let intl middleware handle it
  // and persist the choice in the cookie for next visit.
  const localeFromPath = locales.find(
    (loc) => loc !== defaultLocale && (pathname === `/${loc}` || pathname.startsWith(`/${loc}/`))
  ) as Locale | undefined;

  if (localeFromPath) {
    const res = intlMiddleware(req);
    res.cookies.set(LOCALE_COOKIE, localeFromPath, { maxAge: COOKIE_MAX_AGE, path: "/" });
    return res;
  }

  // Visitor is on the default-locale root (no /vi /id /th /ms /zh prefix).
  // If they already have a cookie choice, respect it without redirecting again.
  const cookieLocale = req.cookies.get(LOCALE_COOKIE)?.value as Locale | undefined;
  if (cookieLocale && locales.includes(cookieLocale)) {
    // They picked the default before — leave them at this English URL.
    return intlMiddleware(req);
  }

  // First-time visitor on a non-prefixed URL → try IP-based detection
  const country =
    req.headers.get("x-vercel-ip-country") ??
    req.headers.get("cf-ipcountry") ??
    null;

  const target = detectLocaleFromCountry(country);
  if (target && target !== defaultLocale) {
    const url = req.nextUrl.clone();
    // Prepend locale prefix
    url.pathname = `/${target}${pathname === "/" ? "" : pathname}`;
    const res = NextResponse.redirect(url);
    res.cookies.set(LOCALE_COOKIE, target, { maxAge: COOKIE_MAX_AGE, path: "/" });
    return res;
  }

  // No match / English country → default. Set cookie so we don't recompute every visit.
  const res = intlMiddleware(req);
  res.cookies.set(LOCALE_COOKIE, defaultLocale, { maxAge: COOKIE_MAX_AGE, path: "/" });
  return res;
}

export const config = {
  matcher: ["/((?!_next|_vercel|.*\\..*).*)"],
};
