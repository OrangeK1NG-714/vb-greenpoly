// Southeast-Asia-first locale set. English is the default (no prefix);
// the four SEA target markets (VI/ID/TH/MS) plus Chinese are prefixed.
export const locales = ["en", "vi", "id", "th", "ms", "zh"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

export const localeLabels: Record<Locale, { label: string; flag: string }> = {
  en: { label: "English", flag: "🇬🇧" },
  vi: { label: "Tiếng Việt", flag: "🇻🇳" },
  id: { label: "Bahasa Indonesia", flag: "🇮🇩" },
  th: { label: "ไทย", flag: "🇹🇭" },
  ms: { label: "Bahasa Melayu", flag: "🇲🇾" },
  zh: { label: "中文", flag: "🇨🇳" },
};
