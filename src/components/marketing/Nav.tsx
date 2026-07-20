"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { useState } from "react";
import LangSwitcher from "./LangSwitcher";
import { CONTACT, waLink } from "@/lib/site";

export default function Nav() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

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
      {/* Top bar */}
      <div className="bg-forest-900 text-emerald-100/80 text-sm py-2">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <div className="flex gap-4 items-center">
            <a href={`mailto:${CONTACT.email}`} className="hover:text-white transition">📧 {CONTACT.email}</a>
            <span className="hidden sm:inline">📞 {CONTACT.phoneDisplay}</span>
          </div>
          <div className="text-xs flex items-center gap-1.5">
            🚢 <span className="hidden xs:inline sm:inline">Shipping to Vietnam · Indonesia · Thailand · Malaysia</span>
          </div>
        </div>
      </div>

      <nav className="bg-white/90 backdrop-blur border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <Link href={`${localePath}/`} className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-600 to-forest-800 flex items-center justify-center text-white font-extrabold shadow-soft">
                G
              </div>
              <span className="text-xl font-extrabold text-forest-900 tracking-tight">{CONTACT.brand}</span>
            </Link>

            <div className="desktop-nav hidden md:flex gap-7 items-center">
              {links.map((l) => (
                <Link
                  key={l.key}
                  href={l.href}
                  className={
                    isActive(l.href)
                      ? "text-brand-700 font-semibold"
                      : "text-slate-700 hover:text-brand-700 transition"
                  }
                >
                  {t(l.key)}
                </Link>
              ))}
              <LangSwitcher />
              <a
                href={waLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-green-600 hover:text-green-700 font-semibold text-sm transition"
                data-track="nav_whatsapp"
                aria-label="WhatsApp"
              >
                <WhatsAppIcon className="w-5 h-5" />
                <span className="hidden lg:inline">WhatsApp</span>
              </a>
              <Link href={`${localePath}/contact`} className="btn-accent text-sm !px-5 !py-2.5" data-track="cta_nav_quote">
                {t("getQuote")}
              </Link>
            </div>

            <button
              className="md:hidden p-2 text-forest-900"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={t("menu")}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          {mobileOpen && (
            <div className="md:hidden pb-4 space-y-3 border-t border-slate-100 pt-3">
              {links.map((l) => (
                <Link key={l.key} href={l.href} className="block text-slate-700" onClick={() => setMobileOpen(false)}>
                  {t(l.key)}
                </Link>
              ))}
              <div className="flex gap-3 pt-1">
                <a
                  href={waLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-green-500 text-white font-semibold rounded-xl py-2.5"
                  data-track="nav_whatsapp_mobile"
                >
                  <WhatsAppIcon className="w-5 h-5" /> WhatsApp
                </a>
                <Link
                  href={`${localePath}/contact`}
                  className="flex-1 btn-accent !py-2.5"
                  onClick={() => setMobileOpen(false)}
                >
                  {t("getQuote")}
                </Link>
              </div>
              <div className="pt-3 border-t border-slate-100">
                <LangSwitcher mobile />
              </div>
            </div>
          )}
        </div>
      </nav>
    </>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.096 3.2 5.077 4.487.71.306 1.263.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413" />
    </svg>
  );
}
