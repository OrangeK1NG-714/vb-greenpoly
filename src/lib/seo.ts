import type { Metadata } from "next";
import { defaultLocale, locales, type Locale } from "@/i18n/config";

const DEFAULT_SITE_URL = "https://greenpoly.com";

function normalizeSiteUrl(value: string): string {
  try {
    return new URL(value).origin;
  } catch {
    return DEFAULT_SITE_URL;
  }
}

export const siteUrl = normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL ?? DEFAULT_SITE_URL);

function normalizeLocale(locale: string): Locale {
  return locales.includes(locale as Locale) ? (locale as Locale) : defaultLocale;
}

function normalizePath(path: string): string {
  if (!path || path === "/") return "";
  return path.startsWith("/") ? path : `/${path}`;
}

export function localizedPath(locale: string, path = "/"): string {
  const safeLocale = normalizeLocale(locale);
  const safePath = normalizePath(path);
  return safeLocale === defaultLocale ? safePath || "/" : `/${safeLocale}${safePath}`;
}

export function localizedUrl(locale: string, path = "/"): string {
  return `${siteUrl}${localizedPath(locale, path)}`;
}

export function localizedLanguageUrls(path = "/"): Record<string, string> {
  return {
    ...Object.fromEntries(locales.map((item) => [item, localizedUrl(item, path)])),
    "x-default": localizedUrl(defaultLocale, path),
  };
}

export function localizedAlternates(locale: string, path = "/"): NonNullable<Metadata["alternates"]> {
  return {
    canonical: localizedUrl(locale, path),
    languages: localizedLanguageUrls(path),
  };
}
