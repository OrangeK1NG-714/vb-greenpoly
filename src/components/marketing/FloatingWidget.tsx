"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Clock3, FileText, Mail, MessageCircle, X } from "lucide-react";
import { track } from "@/lib/tracking";
import { CONTACT, waLink, zaloLink, lineLink, mailLink } from "@/lib/site";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export default function FloatingWidget() {
  const [open, setOpen] = useState(false);
  const locale = useLocale();
  const t = useTranslations("floating");
  const localePath = locale === "en" ? "" : `/${locale}`;

  function onOpenChange(next: boolean) {
    setOpen(next);
    track({
      eventName: next ? "floating_open" : "floating_close",
      page: typeof window !== "undefined" ? window.location.pathname : "",
      locale,
    });
  }

  return (
    <div className="fixed bottom-5 right-5 z-50">
      <Popover open={open} onOpenChange={onOpenChange}>
        <PopoverTrigger asChild>
          <Button
            size="icon"
            className="h-14 w-14 rounded-full bg-amber-500 text-forest-900 shadow-2xl hover:bg-amber-600"
            aria-label={t("openLabel")}
            data-track="floating_toggle"
          >
            {open ? <X className="h-5 w-5" aria-hidden="true" /> : <MessageCircle className="h-6 w-6" aria-hidden="true" />}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="end"
          side="top"
          sideOffset={12}
          className="w-[min(20rem,calc(100vw-2rem))] rounded-2xl border-slate-200 bg-white p-4 shadow-2xl"
        >
          <div className="relative pr-8">
            <div className="font-bold text-forest-900">{t("title")}</div>
            <p className="text-xs text-slate-500">{t("subtitle")}</p>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="absolute -right-1 -top-1 h-8 w-8 text-slate-400 hover:text-slate-700"
              onClick={() => onOpenChange(false)}
              aria-label={t("close")}
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>

          <div className="mt-3 space-y-2">
            {CONTACT.whatsapp && (
              <a
                href={waLink()}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  buttonVariants(),
                  "h-11 w-full justify-start rounded-xl bg-[#25D366] px-3 font-semibold text-white hover:bg-[#20bd5a]"
                )}
                data-track="floating_whatsapp"
              >
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                <span className="flex-1 text-left">{t("waButton")}</span>
                <span className="text-[11px] font-medium opacity-80">{t("waReply")}</span>
              </a>
            )}
            {CONTACT.zalo && (
              <a
                href={zaloLink()}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  buttonVariants(),
                  "h-11 w-full justify-start rounded-xl bg-[#0068FF] px-3 font-semibold text-white hover:bg-[#005ee6]"
                )}
                data-track="floating_zalo"
              >
                <span aria-hidden="true">🇻🇳</span>
                <span className="flex-1 text-left">{t("zaloButton")}</span>
              </a>
            )}
            {CONTACT.line && (
              <a
                href={lineLink()}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  buttonVariants(),
                  "h-11 w-full justify-start rounded-xl bg-[#06C755] px-3 font-semibold text-white hover:bg-[#05b34d]"
                )}
                data-track="floating_line"
              >
                <span aria-hidden="true">🇹🇭</span>
                <span className="flex-1 text-left">{t("lineButton")}</span>
              </a>
            )}
            <a
              href={mailLink(t("emailSubject"))}
              className={cn(
                buttonVariants({ variant: "secondary" }),
                "h-11 w-full justify-start rounded-xl px-3 text-forest-900"
              )}
              data-track="floating_email"
            >
              <Mail className="h-4 w-4" aria-hidden="true" />
              <span className="flex-1 text-left">{t("emailButton")}</span>
            </a>
            <a
              href={`${localePath}/contact`}
              className={cn(buttonVariants(), "h-11 w-full justify-start rounded-xl px-3")}
              data-track="floating_form"
            >
              <FileText className="h-4 w-4" aria-hidden="true" />
              <span className="flex-1 text-left">{t("formButton")}</span>
            </a>
          </div>

          <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
            <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
            {t("footnote")}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
