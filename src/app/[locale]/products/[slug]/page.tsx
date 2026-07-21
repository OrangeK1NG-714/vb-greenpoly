import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { PRODUCTS, getProduct, pick } from "@/lib/products-data";
import { locales, type Locale } from "@/i18n/config";
import { waLink } from "@/lib/site";
import { localizedAlternates, localizedUrl } from "@/lib/seo";

export function generateStaticParams() {
  return PRODUCTS.flatMap((p) =>
    locales.map((locale) => ({ locale, slug: p.slug }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const product = getProduct(slug);
  if (!product) return {};
  return {
    title: pick(product.name, locale as Locale),
    description: pick(product.shortDesc, locale as Locale),
    alternates: localizedAlternates(locale, `/products/${slug}`),
    openGraph: {
      title: pick(product.name, locale as Locale),
      description: pick(product.shortDesc, locale as Locale),
      url: localizedUrl(locale, `/products/${slug}`),
      images: [{ url: product.hero }],
    },
  };
}

export default async function ProductDetail({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const product = getProduct(slug);
  if (!product) notFound();

  const t = await getTranslations("products");
  const localePath = locale === "en" ? "" : `/${locale}`;
  const lang = locale as Locale;
  const productUrl = localizedUrl(locale, `/products/${slug}`);

  // JSON-LD for SEO + GEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${productUrl}#product`,
    name: pick(product.name, lang),
    description: pick(product.shortDesc, lang),
    url: productUrl,
    image: [new URL(product.hero, productUrl).toString()],
    brand: { "@type": "Brand", name: "GreenPoly" },
    manufacturer: { "@type": "Organization", name: "GreenPoly Recycling Co., Ltd." },
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "USD",
      lowPrice: product.priceFrom,
      highPrice: product.priceTo,
      offerCount: product.grades.length,
      availability: "https://schema.org/InStock",
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: localizedUrl(locale) },
      { "@type": "ListItem", position: 2, name: "Products", item: localizedUrl(locale, "/products") },
      { "@type": "ListItem", position: 3, name: pick(product.name, lang), item: productUrl },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      <div className="bg-slate-50 py-4 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 text-sm text-slate-500">
          <Link href={`${localePath}/`} className="hover:text-emerald-700">Home</Link> /{" "}
          <Link href={`${localePath}/products`} className="hover:text-emerald-700">{t("title")}</Link> /{" "}
          <span className="text-slate-900">{pick(product.name, lang)}</span>
        </div>
      </div>

      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-2 gap-12">
          <Image src={product.hero} alt={pick(product.name, lang)} width={800} height={600} className="rounded-xl shadow-lg w-full" />
          <div>
            <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full mb-3 ${product.badgeClass}`}>
              {t(product.badge)}
            </span>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">{pick(product.name, lang)}</h1>
            <p className="text-slate-600 mb-6 leading-relaxed">{pick(product.shortDesc, lang)}</p>

            <div className="bg-amber-50 border-l-4 border-amber-400 rounded-lg p-4 mb-6">
              <div className="text-xs font-bold uppercase tracking-wide text-amber-800 mb-1">{t("sourcingTag")}</div>
              <p className="text-sm text-amber-900 leading-relaxed">{t("sourcingBody")}</p>
            </div>

            <div className="bg-slate-50 rounded-xl p-5 mb-6">
              <h3 className="font-bold text-sm uppercase tracking-wide text-slate-700 mb-3">{t("spec.quickFacts")}</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-slate-500">{t("spec.priceRange")}:</span> <strong>${product.priceFrom}–{product.priceTo}/T FOB</strong></div>
                <div><span className="text-slate-500">{t("spec.moq")}:</span> <strong>1 ton</strong></div>
                <div><span className="text-slate-500">{t("spec.leadTime")}:</span> <strong>{product.leadTime}</strong></div>
                <div><span className="text-slate-500">{t("spec.payment")}:</span> <strong>T/T, L/C</strong></div>
                <div><span className="text-slate-500">{t("spec.packaging")}:</span> <strong>25kg / 1T bag</strong></div>
                <div><span className="text-slate-500">{t("spec.origin")}:</span> <strong>Ningbo, China</strong></div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link href={`${localePath}/contact?product=${product.slug}`} className="btn-primary" data-track={`cta_${product.slug}_quote`}>
                {t("requestQuote")}
              </Link>
              <Link href={`${localePath}/contact?sample=${product.slug}`} className="btn-outline" data-track={`cta_${product.slug}_sample`}>
                {t("requestSample")}
              </Link>
              <a href={waLink()} target="_blank" rel="noopener noreferrer" className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold transition inline-flex items-center gap-2" data-track={`cta_${product.slug}_whatsapp`}>
                💬 {t("whatsapp")}
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">{t("availableGrades")}</h2>
          <p className="text-slate-600 mb-8 text-sm">{t("gradesHint")}</p>
          <div className="overflow-x-auto bg-white rounded-xl shadow border border-slate-200">
            <table className="w-full spec-table">
              <thead>
                <tr>
                  <th>{t("spec.grade")}</th>
                  <th>{t("spec.color")}</th>
                  <th>{t("spec.mfi")}</th>
                  <th>{t("spec.density")}</th>
                  <th>{t("spec.process")}</th>
                  <th>{t("spec.application")}</th>
                  <th>{t("spec.price")}</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {product.grades.map((g) => (
                  <tr key={g.code}>
                    <td className="font-semibold">{g.code}</td>
                    <td>{g.color}</td>
                    <td>{g.mfi}</td>
                    <td>{g.density}</td>
                    <td>{g.process}</td>
                    <td>{g.application}</td>
                    <td><strong>{g.priceUSD}</strong></td>
                    <td>
                      <Link
                        href={`${localePath}/contact?grade=${g.code}`}
                        className="inline-block bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold px-3 py-1.5 rounded-md transition whitespace-nowrap"
                        data-track={`grade_inquiry_${g.code}`}
                      >
                        {t("inquireGrade")} →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="py-16 gradient-hero text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">{t("readyTitle")}</h2>
          <p className="text-lg text-emerald-100 mb-8">{t("readyBody")}</p>
          <Link href={`${localePath}/contact?product=${product.slug}`} className="bg-white text-emerald-700 px-8 py-4 rounded-lg font-semibold hover:bg-emerald-50 transition" data-track={`cta_bottom_${product.slug}_quote`}>
            {t("requestQuote")} →
          </Link>
        </div>
      </section>
    </>
  );
}
