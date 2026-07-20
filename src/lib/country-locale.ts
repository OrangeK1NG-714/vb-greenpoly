// ISO country code → site locale.
// Vercel sets `x-vercel-ip-country`, Cloudflare sets `cf-ipcountry` — both use ISO-3166-1 alpha-2.
// Southeast-Asia-focused: we auto-route VN/ID/TH/MY visitors into their language.

import type { Locale } from "@/i18n/config";

export const COUNTRY_TO_LOCALE: Record<string, Locale> = {
  // Southeast Asia — primary target markets
  VN: "vi",            // Vietnam
  ID: "id",            // Indonesia
  TH: "th",            // Thailand
  MY: "ms", BN: "ms",  // Malaysia, Brunei

  // Chinese-speaking (Singapore kept on Chinese — large Mandarin-reading trade base)
  CN: "zh", TW: "zh", HK: "zh", MO: "zh", SG: "zh",

  // Everything else falls through to default (en) — Philippines, India, Middle East,
  // EU, Americas, Africa all read English in this B2B segment.
};

export function detectLocaleFromCountry(country: string | null | undefined): Locale | null {
  if (!country) return null;
  return COUNTRY_TO_LOCALE[country.toUpperCase()] ?? null;
}
