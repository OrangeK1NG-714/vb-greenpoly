"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale } from "next-intl";
import { Check, ChevronDown, Globe2 } from "lucide-react";
import { locales, localeLabels, defaultLocale, type Locale } from "@/i18n/config";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function persistLocaleChoice(locale: Locale) {
  document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
}

export default function LangSwitcher({ mobile = false }: { mobile?: boolean }) {
  const pathname = usePathname();
  const currentLocale = useLocale() as Locale;

  let basePath = pathname;
  for (const locale of locales) {
    if (locale === defaultLocale) continue;
    if (basePath === `/${locale}` || basePath.startsWith(`/${locale}/`)) {
      basePath = basePath.slice(`/${locale}`.length) || "/";
      break;
    }
  }
  if (!basePath.startsWith("/")) basePath = `/${basePath}`;

  const localizedPath = (locale: Locale) => {
    if (locale === defaultLocale) return basePath || "/";
    return `/${locale}${basePath === "/" ? "" : basePath}` || `/${locale}`;
  };

  if (mobile) {
    return (
      <div>
        <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
          <Globe2 className="h-3.5 w-3.5" aria-hidden="true" />
          Language
        </div>
        <div className="grid grid-cols-2 gap-2">
          {locales.map((locale) => (
            <Button
              key={locale}
              asChild
              size="sm"
              variant={locale === currentLocale ? "secondary" : "outline"}
              className="h-9 justify-start rounded-lg"
            >
              <Link href={localizedPath(locale)} onClick={() => persistLocaleChoice(locale)}>
                <span aria-hidden="true">{localeLabels[locale].flag}</span>
                <span className="truncate">{localeLabels[locale].label}</span>
              </Link>
            </Button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-9 gap-1.5 px-2.5 text-slate-700 hover:bg-slate-50">
          <Globe2 className="h-4 w-4 text-brand-700" aria-hidden="true" />
          <span className="uppercase">{currentLocale}</span>
          <ChevronDown className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {locales.map((locale) => (
          <DropdownMenuItem key={locale} asChild className="cursor-pointer">
            <Link
              href={localizedPath(locale)}
              onClick={() => persistLocaleChoice(locale)}
              className="flex w-full items-center gap-2"
            >
              <span aria-hidden="true">{localeLabels[locale].flag}</span>
              <span className="flex-1">{localeLabels[locale].label}</span>
              {locale === currentLocale && <Check className="h-4 w-4 text-brand-700" aria-hidden="true" />}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
