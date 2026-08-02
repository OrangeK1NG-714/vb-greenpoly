import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { use } from "react";
import { useTranslations, useLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import {
  ArrowRight,
  BadgeCheck,
  Box,
  CarFront,
  Factory,
  FileCheck2,
  FlaskConical,
  Gauge,
  MapPinned,
  MessageCircle,
  PackageCheck,
  PencilRuler,
  PlugZap,
  Ship,
  ShoppingBag,
  Zap,
} from "lucide-react";
import ProductCardImpression from "@/components/marketing/ProductCardImpression";
import { SEA_PORTS, waLink } from "@/lib/site";
import { PRODUCTS, pick } from "@/lib/products-data";
import { localizedAlternates } from "@/lib/seo";
import type { Locale } from "@/i18n/config";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const TRUST = [
  { icon: PackageCheck, key: "tbMoq", sub: "tbMoqSub" },
  { icon: FlaskConical, key: "tbSamples", sub: "tbSamplesSub" },
  { icon: FileCheck2, key: "tbCoa", sub: "tbCoaSub" },
  { icon: Zap, key: "tbReply", sub: "tbReplySub" },
];

const INDUSTRIES = [
  { icon: Gauge, key: "appliance" },
  { icon: PlugZap, key: "electronics" },
  { icon: CarFront, key: "automotive" },
  { icon: ShoppingBag, key: "disposables" },
  { icon: Box, key: "packaging" },
  { icon: PencilRuler, key: "stationery" },
];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return { alternates: localizedAlternates(locale) };
}

export default function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: routeLocale } = use(params);
  setRequestLocale(routeLocale);
  const t = useTranslations("home");
  const tp = useTranslations("products");
  const locale = useLocale();
  const localePath = locale === "en" ? "" : `/${locale}`;
  const lang = locale as Locale;

  return (
    <>
      <section className="gradient-hero relative overflow-hidden text-white">
        <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 md:grid-cols-[minmax(0,.92fr)_minmax(480px,1.08fr)] md:py-24">
          <div>
            <Badge
              variant="outline"
              className="mb-6 h-auto gap-2 rounded-full border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur"
            >
              <Factory className="h-4 w-4 text-amber-300" aria-hidden="true" />
              {t("heroBadge")}
            </Badge>
            <h1 className="mb-6 max-w-2xl text-[clamp(2.55rem,5vw,4.6rem)] font-extrabold leading-[1.02] tracking-[-0.045em]">
              {t("heroTitle1")}
              <br />
              <span className="text-accent">{t("heroTitle2")}</span>
              <br />
              {t("heroTitle3")}
            </h1>
            <p className="mb-8 max-w-xl text-base leading-7 text-emerald-50/85 md:text-lg">{t("heroSubtitle")}</p>
            <div className="flex flex-wrap gap-3">
              <Button
                asChild
                size="lg"
                className="h-12 rounded-xl bg-amber-500 px-6 font-bold text-forest-900 shadow-lg hover:bg-amber-600"
              >
                <Link href={`${localePath}/contact`} data-track="cta_hero_samples">
                  {t("ctaSamples")}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-12 rounded-xl border-white/25 bg-white/10 px-6 font-semibold text-white shadow-none hover:bg-white/20 hover:text-white"
              >
                <a href={waLink()} target="_blank" rel="noopener noreferrer" data-track="cta_hero_whatsapp">
                  <MessageCircle className="h-4 w-4" aria-hidden="true" />
                  WhatsApp
                </a>
              </Button>
            </div>
            <div className="mt-9 flex flex-wrap gap-x-5 gap-y-2 text-sm text-emerald-100">
              <div className="trust-chip"><BadgeCheck className="h-4 w-4 text-amber-300" aria-hidden="true" />{t("trustQuote")}</div>
              <div className="trust-chip"><FileCheck2 className="h-4 w-4 text-amber-300" aria-hidden="true" />{t("trustDocs")}</div>
              <div className="trust-chip"><Ship className="h-4 w-4 text-amber-300" aria-hidden="true" />{t("trustShipping")}</div>
            </div>
          </div>
          <div className="relative hidden md:block">
            <Image
              src={PRODUCTS[0].hero}
              alt="Recycled ABS, HIPS, PP and GPPS pellets"
              width={800}
              height={600}
              className="aspect-[4/3] w-full rounded-[1.4rem] object-cover shadow-2xl ring-1 ring-white/10"
              priority
            />
            <Card className="absolute -bottom-5 -left-5 border-0 bg-white px-5 py-4 text-forest-900 shadow-2xl animate-fadeIn">
              <div className="text-2xl font-extrabold text-brand-700">1 Ton</div>
              <div className="mt-1 flex items-center gap-1.5 text-xs font-medium text-slate-500">
                <PackageCheck className="h-3.5 w-3.5" aria-hidden="true" />
                {t("statsMoq")} · MOQ
              </div>
            </Card>
          </div>
        </div>
        <div className="absolute -bottom-10 -right-10 w-72 h-72 bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute -top-10 -left-10 w-72 h-72 bg-emerald-300/20 rounded-full blur-3xl" />
      </section>

      {/* Trust strip */}
      <section className="bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
          {TRUST.map((item) => {
            const Icon = item.icon;
            return (
            <Card key={item.key} className="flex-row items-center gap-3 border-slate-100 px-4 py-3 shadow-none">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <div className="text-sm font-bold text-forest-900">{t(item.key)}</div>
                <div className="text-xs text-slate-500">{t(item.sub)}</div>
              </div>
            </Card>
            );
          })}
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
                <Card className="product-card h-full overflow-hidden border-slate-200/80">
                  <Link
                    href={`${localePath}/products/${p.slug}`}
                    className="block h-full"
                    data-track={`product_card_${p.slug}`}
                  >
                    <div className="relative overflow-hidden">
                      <Image
                        src={p.hero}
                        alt={pick(p.name, lang)}
                        width={600}
                        height={450}
                        className="h-52 w-full object-cover transition duration-500 hover:scale-[1.025]"
                      />
                      <Badge className={`absolute left-3 top-3 h-auto rounded-full px-2.5 py-1 shadow-sm ${p.badgeClass}`}>
                        {tp(p.badge)}
                      </Badge>
                    </div>
                    <div className="p-5">
                      <h3 className="mb-2 mt-1 text-lg font-bold text-forest-900">{pick(p.name, lang)}</h3>
                      <p className="mb-5 line-clamp-3 text-sm leading-6 text-slate-600">{pick(p.shortDesc, lang)}</p>
                      <div className="flex items-center justify-between gap-3 text-sm">
                        <span className="text-slate-500">
                          {tp("from")} <span className="font-bold text-brand-700">${p.priceFrom}/T</span>
                        </span>
                        <span className="inline-flex items-center gap-1 font-semibold text-brand-700">
                          {tp("viewSpecs")}
                          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                        </span>
                      </div>
                    </div>
                  </Link>
                </Card>
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
              <Card key={c.country} className="border-slate-200/80 p-5 shadow-card transition hover:-translate-y-0.5 hover:shadow-soft">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-3xl">{c.flag}</span>
                  <MapPinned className="h-4 w-4 text-brand-600" aria-hidden="true" />
                </div>
                <div className="mb-1 font-bold text-forest-900">{c.country}</div>
                <ul className="text-xs text-slate-500 space-y-0.5">
                  {c.ports.map((port) => (
                    <li key={port}>{port}</li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
          <p className="mt-8 flex items-center justify-center gap-2 text-center text-sm text-slate-500">
            <Ship className="h-4 w-4 text-brand-600" aria-hidden="true" />
            {t("portsNote")}
          </p>
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
              <Card key={n} className="border-slate-200/80 p-6 shadow-card">
                <div className="w-12 h-12 bg-brand-50 rounded-xl flex items-center justify-center mb-4">
                  <span className="text-brand-700 font-extrabold text-lg">{n}</span>
                </div>
                <h3 className="font-bold text-lg mb-2 text-forest-900">{t(`why${n}Title`)}</h3>
                <p className="text-slate-600 text-sm">{t(`why${n}Body`)}</p>
              </Card>
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
            {INDUSTRIES.map((item) => {
              const Icon = item.icon;
              return (
                <Card key={item.key} className="items-center border-slate-100 bg-sand p-5 text-center shadow-none transition hover:bg-brand-50">
                  <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-white text-brand-700 shadow-sm">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div className="text-sm font-semibold text-forest-900">{t(`industries.${item.key}`)}</div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 gradient-hero text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">{t("ctaTitle")}</h2>
          <p className="text-lg text-emerald-100/90 mb-8 max-w-2xl mx-auto">{t("ctaBody")}</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Button
              asChild
              size="lg"
              className="h-12 rounded-xl bg-amber-500 px-6 font-bold text-forest-900 hover:bg-amber-600"
            >
              <Link href={`${localePath}/contact`} data-track="cta_bottom_quote">
                {t("ctaButton")}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-12 rounded-xl border-white/25 bg-white/10 px-6 font-semibold text-white hover:bg-white/20 hover:text-white"
            >
              <a href={waLink()} target="_blank" rel="noopener noreferrer" data-track="cta_bottom_whatsapp">
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                WhatsApp
              </a>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
