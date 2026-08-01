"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Globe2, Mail, Menu, MessageCircle, Phone, Ship } from "lucide-react";
import LangSwitcher from "./LangSwitcher";
import { CONTACT, waLink } from "@/lib/site";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export default function Nav() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const localePath = locale === "en" ? "" : `/${locale}`;
  const links = [
    { href: `${localePath}/`, key: "home" },
    { href: `${localePath}/products`, key: "products" },
    { href: `${localePath}/about`, key: "about" },
    { href: `${localePath}/quality`, key: "quality" },
  ];

  const isActive = (href: string) => {
    if (href.endsWith("/")) return pathname === href || pathname === href.slice(0, -1);
    return pathname.startsWith(href);
  };

  return (
    <>
      <div className="bg-forest-900 py-2 text-xs text-emerald-100/80 sm:text-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4">
          <div className="flex min-w-0 items-center gap-4">
            <a
              href={`mailto:${CONTACT.email}`}
              className="flex min-w-0 items-center gap-1.5 transition hover:text-white"
            >
              <Mail className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span className="truncate">{CONTACT.email}</span>
            </a>
            <span className="hidden items-center gap-1.5 sm:flex">
              <Phone className="h-3.5 w-3.5" aria-hidden="true" />
              {CONTACT.phoneDisplay}
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <Ship className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">Vietnam · Indonesia · Thailand · Malaysia</span>
            <span className="sm:hidden">SEA shipping</span>
          </div>
        </div>
      </div>

      <nav className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex h-[68px] items-center justify-between">
            <Link href={`${localePath}/`} className="flex items-center gap-2.5" aria-label={`${CONTACT.brand} home`}>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-forest-800 font-extrabold text-white shadow-soft">
                G
              </div>
              <span className="text-xl font-extrabold tracking-tight text-forest-900">{CONTACT.brand}</span>
            </Link>

            <div className="hidden items-center gap-1 md:flex">
              {links.map((link) => (
                <Button
                  key={link.key}
                  asChild
                  variant="ghost"
                  className={cn(
                    "h-9 px-3 text-sm",
                    isActive(link.href)
                      ? "bg-brand-50 font-semibold text-brand-800"
                      : "text-slate-700 hover:bg-slate-50 hover:text-brand-800"
                  )}
                >
                  <Link href={link.href}>{t(link.key)}</Link>
                </Button>
              ))}
              <LangSwitcher />
              <Button asChild variant="ghost" className="ml-1 h-9 text-green-700 hover:bg-green-50 hover:text-green-800">
                <a
                  href={waLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-track="nav_whatsapp"
                  aria-label="WhatsApp"
                >
                  <MessageCircle aria-hidden="true" />
                  <span className="hidden lg:inline">WhatsApp</span>
                </a>
              </Button>
              <Button
                asChild
                className="ml-1 h-10 rounded-xl bg-amber-500 px-5 font-bold text-forest-900 shadow-sm hover:bg-amber-600"
              >
                <Link href={`${localePath}/contact`} data-track="cta_nav_quote">
                  {t("getQuote")}
                </Link>
              </Button>
            </div>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden" aria-label={t("menu")}>
                  <Menu className="h-5 w-5" aria-hidden="true" />
                </Button>
              </SheetTrigger>
              <SheetContent className="w-[88vw] border-slate-200 bg-white p-0 sm:max-w-sm">
                <SheetHeader className="border-b border-slate-100 px-5 py-5 text-left">
                  <SheetTitle className="flex items-center gap-2.5 text-forest-900">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-700 text-sm font-extrabold text-white">
                      G
                    </span>
                    {CONTACT.brand}
                  </SheetTitle>
                  <SheetDescription className="flex items-center gap-1.5 text-xs">
                    <Globe2 className="h-3.5 w-3.5" aria-hidden="true" />
                    Recycled pellets direct from Ningbo
                  </SheetDescription>
                </SheetHeader>

                <div className="flex flex-col gap-1 px-4 py-5">
                  {links.map((link) => (
                    <SheetClose key={link.key} asChild>
                      <Link
                        href={link.href}
                        className={cn(
                          buttonVariants({ variant: "ghost" }),
                          "h-11 justify-start rounded-xl px-4 text-base",
                          isActive(link.href) && "bg-brand-50 font-semibold text-brand-800"
                        )}
                      >
                        {t(link.key)}
                      </Link>
                    </SheetClose>
                  ))}
                </div>

                <div className="mt-auto space-y-4 border-t border-slate-100 p-5">
                  <LangSwitcher mobile />
                  <div className="grid grid-cols-2 gap-2">
                    <SheetClose asChild>
                      <a
                        href={waLink()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                          buttonVariants({ variant: "outline" }),
                          "h-11 rounded-xl border-green-200 text-green-700 hover:bg-green-50"
                        )}
                        data-track="nav_whatsapp_mobile"
                      >
                        <MessageCircle className="h-4 w-4" aria-hidden="true" />
                        WhatsApp
                      </a>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link
                        href={`${localePath}/contact`}
                        className={cn(
                          buttonVariants(),
                          "h-11 rounded-xl bg-amber-500 font-bold text-forest-900 hover:bg-amber-600"
                        )}
                      >
                        {t("getQuote")}
                      </Link>
                    </SheetClose>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>
    </>
  );
}
