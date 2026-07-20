"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { track } from "@/lib/tracking";
import { CONTACT, waLink, zaloLink, lineLink, mailLink } from "@/lib/site";

export default function FloatingWidget() {
  const [open, setOpen] = useState(false);
  const locale = useLocale();
  const t = useTranslations("floating");
  const localePath = locale === "en" ? "" : `/${locale}`;

  function onToggle() {
    const next = !open;
    setOpen(next);
    track({
      eventName: next ? "floating_open" : "floating_close",
      page: typeof window !== "undefined" ? window.location.pathname : "",
      locale,
    });
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      {open && (
        <div className="bg-white shadow-2xl rounded-2xl border border-slate-100 w-72 p-4 animate-fadeIn">
          <div className="flex justify-between items-start mb-3">
            <div>
              <div className="text-sm font-bold text-forest-900">{t("title")}</div>
              <div className="text-xs text-slate-500">{t("subtitle")}</div>
            </div>
            <button
              onClick={onToggle}
              aria-label={t("close")}
              className="text-slate-400 hover:text-slate-700 text-xl leading-none -mt-1"
            >
              ×
            </button>
          </div>
          <div className="space-y-2">
            {CONTACT.whatsapp && (
              <a
                href={waLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 bg-[#25D366] hover:brightness-95 text-white text-sm font-semibold rounded-xl px-3 py-2.5 transition"
                data-track="floating_whatsapp"
              >
                <span className="text-lg">💬</span>
                <span className="flex-1">{t("waButton")}</span>
                <span className="text-xs opacity-80">{t("waReply")}</span>
              </a>
            )}
            {CONTACT.zalo && (
              <a
                href={zaloLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 bg-[#0068FF] hover:brightness-95 text-white text-sm font-semibold rounded-xl px-3 py-2.5 transition"
                data-track="floating_zalo"
              >
                <span className="text-lg">🇻🇳</span>
                <span className="flex-1">{t("zaloButton")}</span>
              </a>
            )}
            {CONTACT.line && (
              <a
                href={lineLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 bg-[#06C755] hover:brightness-95 text-white text-sm font-semibold rounded-xl px-3 py-2.5 transition"
                data-track="floating_line"
              >
                <span className="text-lg">🇹🇭</span>
                <span className="flex-1">{t("lineButton")}</span>
              </a>
            )}
            <a
              href={mailLink(t("emailSubject"))}
              className="flex items-center gap-3 bg-slate-100 hover:bg-slate-200 text-slate-900 text-sm font-semibold rounded-xl px-3 py-2.5 transition"
              data-track="floating_email"
            >
              <span className="text-lg">📧</span>
              <span className="flex-1">{t("emailButton")}</span>
            </a>
            <a
              href={`${localePath}/contact`}
              className="flex items-center gap-3 bg-brand-700 hover:bg-brand-800 text-white text-sm font-semibold rounded-xl px-3 py-2.5 transition"
              data-track="floating_form"
            >
              <span className="text-lg">📝</span>
              <span className="flex-1">{t("formButton")}</span>
            </a>
          </div>
          <p className="text-[11px] text-slate-400 text-center mt-3">{t("footnote")}</p>
        </div>
      )}
      <button
        onClick={onToggle}
        aria-label={t("openLabel")}
        className="w-14 h-14 bg-accent hover:bg-accent-dark text-forest-900 rounded-full shadow-2xl flex items-center justify-center transition"
        data-track="floating_toggle"
      >
        {open ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.86 9.86 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        )}
      </button>
    </div>
  );
}
