import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { useTranslations, useLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import ProductCardImpression from "@/components/marketing/ProductCardImpression";
import { SEA_PORTS, waLink } from "@/lib/site";
import { PRODUCTS, pick } from "@/lib/products-data";
import { localizedAlternates } from "@/lib/seo";
import type { Locale } from "@/i18n/config";

const TRUST = [
  { icon: "📦", key: "tbMoq", sub: "tbMoqSub" },
  { icon: "🧪", key: "tbSamples", sub: "tbSamplesSub" },
  { icon: "📄", key: "tbCoa", sub: "tbCoaSub" },
  { icon: "⚡", key: "tbReply", sub: "tbReplySub" },
];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return { alternates: localizedAlternates(locale) };
}

export default function Home({ params }: { params: { locale: string } }) {
  setRequestLocale(params.locale);
  const t = useTranslations("home");
  const tp = useTranslations("products");
  const locale = useLocale();
  const localePath = locale === "en" ? "" : `/${locale}`;
  const lang = locale as Locale;

  return (
    <>
      {/* Hero */}
      <section className="gradient-hero text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 py-20 md:py-28 grid md:grid-cols-2 gap-12 items-center relative z-10">
          <div>
            <span className="inline-flex items-center gap-2 bg-white/10 ring-1 ring-white/20 backdrop-blur px-4 py-1.5 rounded-full text-sm mb-6">
              🏭 {t("heroBadge")}
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.1] mb-6 tracking-tight">
              {t("heroTitle1")}
              <br />
              <span className="text-accent">{t("heroTitle2")}</span>
              <br />
              {t("heroTitle3")}
            </h1>
            <p className="text-lg md:text-xl text-emerald-50/90 mb-8 max-w-lg">{t("heroSubtitle")}</p>
            <div className="flex flex-wrap gap-3">
              <Link href={`${localePath}/contact`} className="btn-accent text-base" data-track="cta_hero_samples">
                {t("ctaSamples")} →
              </Link>
              <a
                href={waLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 ring-1 ring-white/30 text-white px-6 py-3 rounded-xl font-semibold transition"
                data-track="cta_hero_whatsapp"
              >
                💬 WhatsApp
              </a>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-2 mt-10 text-sm text-emerald-100">
              <div className="trust-chip">✓ {t("trustQuote")}</div>
              <div className="trust-chip">✓ {t("trustDocs")}</div>
              <div className="trust-chip">✓ {t("trustShipping")}</div>
            </div>
          </div>
          <div className="hidden md:block relative">
            <Image
              src="/images/products/abs.jpg"
              alt="Recycled ABS, HIPS, PP and GPPS pellets"
              width={800}
              height={600}
              className="rounded-2xl shadow-2xl ring-1 ring-white/10"
              priority
            />
            {/* Floating proof badge */}
            <div className="absolute -bottom-5 -left-5 bg-white rounded-2xl shadow-2xl px-5 py-4 text-forest-900 animate-fadeIn">
              <div className="text-2xl font-extrabold text-brand-700">1 Ton</div>
              <div className="text-xs font-medium text-slate-500">{t("statsMoq")} · MOQ</div>
            </div>
          </div>
        </div>
        <div className="absolute -bottom-10 -right-10 w-72 h-72 bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute -top-10 -left-10 w-72 h-72 bg-emerald-300/20 rounded-full blur-3xl" />
      </section>

      {/* Trust strip */}
      <section className="bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
          {TRUST.map((it) => (
            <div key={it.key} className="flex items-center gap-3 rounded-xl px-3 py-2">
              <span className="text-2xl">{it.icon}</span>
              <div>
                <div className="font-bold text-forest-900 text-sm">{t(it.key)}</div>
                <div className="text-slate-500 text-xs">{t(it.sub)}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Products */}
      <section className="py-20 bg-sand">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="section-tag">{t("productsTag")}</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-forest-900 mt-2 mb-4">{t("productsTitle")}</h2>
            <p className="text-slate-600">{t("productsSubtitle")}</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {PRODUCTS.map((p) => (
              <ProductCardImpression key={p.slug} slug={p.slug}>
                <Link
                  href={`${localePath}/products/${p.slug}`}
                  className="product-card overflow-hidden block h-full"
                  data-track={`product_card_${p.slug}`}
                >
                  <div className="relative">
                    <Image src={p.hero} alt={pick(p.name, lang)} width={600} height={400} className="w-full h-48 object-cover" />
                    <span className={`absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm ${p.badgeClass}`}>
                      {tp(p.badge)}
                    </span>
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-bold mt-1 mb-2 text-forest-900">{pick(p.name, lang)}</h3>
                    <p className="text-slate-600 text-sm mb-4 line-clamp-3">{pick(p.shortDesc, lang)}</p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">{tp("from")} <span className="font-bold text-brand-700">${p.priceFrom}/T</span></span>
                      <span className="text-brand-700 font-semibold">{tp("viewSpecs")} →</span>
                    </div>
                  </div>
                </Link>
              </ProductCardImpression>
            ))}
          </div>
        </div>
      </section>

      {/* Stats band */}
      <section className="bg-forest-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { num: "1 Ton", label: t("statsMoq") },
            { num: "300 T", label: t("statsCapacity") },
            { num: "24h", label: t("statsReply") },
            { num: "4", label: t("statsLines") },
          ].map((s, i) => (
            <div key={i}>
              <div className="text-3xl md:text-4xl font-extrabold text-accent">{s.num}</div>
              <div className="text-emerald-100/70 text-sm mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Ports we ship to (Southeast Asia) */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="section-tag">{t("portsTag")}</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-forest-900 mt-2 mb-4">{t("portsTitle")}</h2>
            <p className="text-slate-600">{t("portsSubtitle")}</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {SEA_PORTS.map((c) => (
              <div key={c.country} className="card p-5 hover:shadow-soft transition">
                <div className="text-3xl mb-2">{c.flag}</div>
                <div className="font-bold text-forest-900 mb-1">{c.country}</div>
                <ul className="text-xs text-slate-500 space-y-0.5">
                  {c.ports.map((port) => (
                    <li key={port}>{port}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-slate-500 mt-8">🌏 {t("portsNote")}</p>
        </div>
      </section>

      {/* Why us */}
      <section className="py-20 bg-sand">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="section-tag">{t("whyTag")}</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-forest-900 mt-2 mb-4">{t("whyTitle")}</h2>
            <p className="text-slate-600">{t("whySubtitle")}</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="card p-6">
                <div className="w-12 h-12 bg-brand-50 rounded-xl flex items-center justify-center mb-4">
                  <span className="text-brand-700 font-extrabold text-lg">{n}</span>
                </div>
                <h3 className="font-bold text-lg mb-2 text-forest-900">{t(`why${n}Title`)}</h3>
                <p className="text-slate-600 text-sm">{t(`why${n}Body`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Industries */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="section-tag">{t("industriesTag")}</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-forest-900 mt-2 mb-4">{t("industriesTitle")}</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { emoji: "📺", key: "appliance" },
              { emoji: "🔌", key: "electronics" },
              { emoji: "🚗", key: "automotive" },
              { emoji: "🍴", key: "disposables" },
              { emoji: "📦", key: "packaging" },
              { emoji: "✏️", key: "stationery" },
            ].map((it) => (
              <div key={it.key} className="bg-sand p-5 rounded-2xl text-center hover:bg-brand-50 transition cursor-default">
                <div className="text-3xl mb-2">{it.emoji}</div>
                <div className="text-sm font-semibold text-forest-900">{t(`industries.${it.key}`)}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 gradient-hero text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">{t("ctaTitle")}</h2>
          <p className="text-lg text-emerald-100/90 mb-8 max-w-2xl mx-auto">{t("ctaBody")}</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href={`${localePath}/contact`} className="btn-accent text-base" data-track="cta_bottom_quote">
              {t("ctaButton")} →
            </Link>
            <a
              href={waLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 ring-1 ring-white/30 text-white px-6 py-3 rounded-xl font-semibold transition"
              data-track="cta_bottom_whatsapp"
            >
              💬 WhatsApp
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
