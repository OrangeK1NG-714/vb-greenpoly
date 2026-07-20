"use client";

import { usePathname } from "next/navigation";
import { useLocale } from "next-intl";
import { locales, localeLabels, defaultLocale, type Locale } from "@/i18n/config";
import Link from "next/link";

function persistLocaleChoice(loc: Locale) {
  // Lock in the user's explicit choice so IP detection doesn't override it later.
  document.cookie = `NEXT_LOCALE=${loc}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
}

export default function LangSwitcher({ mobile = false }: { mobile?: boolean }) {
  const pathname = usePathname();
  const currentLocale = useLocale() as Locale;

  // Strip locale prefix from current path to get the "base" path
  let basePath = pathname;
  for (const loc of locales) {
    if (loc === defaultLocale) continue;
    if (basePath === `/${loc}` || basePath.startsWith(`/${loc}/`)) {
      basePath = basePath.slice(`/${loc}`.length) || "/";
      break;
    }
  }
  if (!basePath.startsWith("/")) basePath = "/" + basePath;

  const localizedPath = (loc: Locale) => {
    if (loc === defaultLocale) return basePath === "" ? "/" : basePath;
    return `/${loc}${basePath === "/" ? "" : basePath}` || `/${loc}`;
  };

  if (mobile) {
    return (
      <div className="flex flex-wrap gap-2">
        {locales.map((loc) => (
          <Link
            key={loc}
            href={localizedPath(loc)}
            onClick={() => persistLocaleChoice(loc)}
            className={`px-3 py-1.5 text-sm rounded-md border ${
              loc === currentLocale ? "border-emerald-700 bg-emerald-50 text-emerald-700 font-semibold" : "border-slate-200 text-slate-700"
            }`}
          >
            {localeLabels[loc].flag} {localeLabels[loc].label}
          </Link>
        ))}
      </div>
    );
  }

  return (
    <details className="relative">
      <summary className="text-slate-700 hover:text-emerald-700 cursor-pointer list-none flex items-center gap-1 select-none">
        🌐 <span className="text-sm uppercase">{currentLocale}</span>
      </summary>
      <div className="absolute right-0 top-full mt-2 bg-white shadow-lg rounded-lg border border-slate-200 py-1 min-w-[160px] z-50">
        {locales.map((loc) => (
          <Link
            key={loc}
            href={localizedPath(loc)}
            onClick={() => persistLocaleChoice(loc)}
            className={`block px-4 py-2 text-sm hover:bg-slate-50 ${
              loc === currentLocale ? "font-semibold text-emerald-700 bg-emerald-50" : "text-slate-700"
            }`}
          >
            {localeLabels[loc].flag} {localeLabels[loc].label}
          </Link>
        ))}
      </div>
    </details>
  );
}
