import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { locales, type Locale } from "@/i18n/config";
import Nav from "@/components/marketing/Nav";
import Footer from "@/components/marketing/Footer";
import Tracker from "@/components/marketing/Tracker";
import FloatingWidget from "@/components/marketing/FloatingWidget";
import { CONTACT } from "@/lib/site";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://greenpoly.com";

// Organization entity for Google Knowledge Graph & AI engines (GEO).
const ORG_JSONLD = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: CONTACT.brand,
  legalName: CONTACT.legalName,
  url: SITE_URL,
  email: CONTACT.email,
  telephone: CONTACT.phoneDisplay,
  address: {
    "@type": "PostalAddress",
    addressLocality: "Cixi, Ningbo",
    addressRegion: "Zhejiang",
    addressCountry: "CN",
  },
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "sales",
    telephone: CONTACT.phoneDisplay,
    email: CONTACT.email,
    availableLanguage: ["en", "vi", "id", "th", "ms", "zh"],
  },
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

// Per-locale <title>/<description> so Google Vietnam/Indonesia/Thailand show
// buyers a headline in their own language instead of the English default.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const tMeta = await getTranslations({ locale, namespace: "meta" });
  const tHome = await getTranslations({ locale, namespace: "home" });
  return {
    title: `${tMeta("siteName")} — ${tMeta("siteTagline")}`,
    description: tHome("heroSubtitle"),
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!locales.includes(locale as Locale)) notFound();
  setRequestLocale(locale);

  const messages = await getMessages();

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ORG_JSONLD) }}
      />
      <Tracker locale={locale} />
      <Nav />
      <main>{children}</main>
      <Footer />
      <FloatingWidget />
    </NextIntlClientProvider>
  );
}
