import type { Metadata } from "next";
import localFont from "next/font/local";
import { CONTACT } from "@/lib/site";
import "./globals.css";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://greenpoly.com";

// Keep builds self-contained; Thai glyphs use the system fallback declared in globals.css.
const siteSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-sans",
  display: "swap",
});

const TITLE_DEFAULT = `${CONTACT.brand} — Recycled ABS · HIPS · PP · GPPS Pellets from China`;
const DESCRIPTION =
  "Small Ningbo factory supplying recycled ABS, HIPS, PP and GPPS pellets to injection molders across Vietnam, Indonesia, Thailand and Malaysia. Low 1-ton MOQ, batch COA, direct-from-owner pricing.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE_DEFAULT,
    template: `%s | ${CONTACT.brand}`,
  },
  description: DESCRIPTION,
  keywords: [
    "recycled ABS pellets",
    "recycled HIPS",
    "recycled PP granules",
    "GPPS",
    "plastic pellets supplier",
    "China plastic recycling factory",
    "injection molding raw material",
    "Vietnam Indonesia Thailand Malaysia plastic supplier",
  ],
  alternates: { canonical: "/" },
  // OpenGraph drives the link-preview cards buyers see when a URL is pasted into
  // WhatsApp / Zalo / LINE / Facebook — the dominant sharing channels across SEA.
  openGraph: {
    type: "website",
    siteName: CONTACT.brand,
    title: TITLE_DEFAULT,
    description: DESCRIPTION,
    url: SITE_URL,
    locale: "en_US",
    images: [
      {
        // TODO: replace with a branded 1200×630 share image at /public/og.jpg
        url: "/images/products/abs.jpg",
        width: 800,
        height: 600,
        alt: `${CONTACT.brand} — recycled ABS · HIPS · PP · GPPS pellets`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE_DEFAULT,
    description: DESCRIPTION,
    images: ["/images/products/abs.jpg"],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html className={siteSans.variable}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
