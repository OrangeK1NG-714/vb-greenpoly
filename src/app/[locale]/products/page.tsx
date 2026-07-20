import Link from "next/link";
import Image from "next/image";
import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { PRODUCTS, pick } from "@/lib/products-data";
import type { Locale } from "@/i18n/config";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "products" });
  return { title: t("title"), description: t("subtitle") };
}

export default async function ProductsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("products");
  const localePath = locale === "en" ? "" : `/${locale}`;
  const lang = locale as Locale;

  return (
    <>
      <section className="bg-slate-50 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">{t("title")}</h1>
          <p className="text-lg text-slate-600 max-w-3xl">{t("subtitle")}</p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 space-y-16">
          {PRODUCTS.map((p) => (
            <div key={p.slug}>
              <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-slate-900">{pick(p.name, lang)}</h2>
                  <p className="text-slate-600 mt-1 max-w-3xl">{pick(p.shortDesc, lang)}</p>
                </div>
                <Link
                  href={`${localePath}/products/${p.slug}`}
                  className="btn-outline text-sm"
                  data-track={`products_${p.slug}_view_all`}
                >
                  {t("viewAll", { category: p.category })} →
                </Link>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
                {p.grades.slice(0, 4).map((g) => (
                  <div key={g.code} className="product-card bg-white rounded-xl overflow-hidden flex flex-col">
                    <Link href={`${localePath}/products/${p.slug}`} data-track={`product_grade_${g.code}`}>
                      <Image src={p.hero} alt={g.code} width={400} height={200} className="w-full h-40 object-cover" />
                      <div className="p-4 pb-2">
                        <h3 className="font-bold mb-1">{g.code} — {g.process}</h3>
                        <p className="text-xs text-slate-500 mb-2">MFI {g.mfi} · {g.color}</p>
                        <p className="text-xs text-slate-600 line-clamp-2 mb-2">{g.application}</p>
                        <span className="text-sm text-emerald-700 font-semibold">{t("from")} ${g.priceUSD}/T</span>
                      </div>
                    </Link>
                    <div className="px-4 pb-4 mt-auto">
                      <Link
                        href={`${localePath}/contact?grade=${g.code}`}
                        className="block w-full text-center bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold px-3 py-2 rounded-md transition"
                        data-track={`grade_inquiry_${g.code}`}
                      >
                        {t("inquireGrade")} →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="py-16 bg-emerald-50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">{t("customTitle")}</h2>
          <p className="text-lg text-slate-700 mb-8">{t("customBody")}</p>
          <Link href={`${localePath}/contact`} className="btn-primary" data-track="cta_products_custom">
            {t("requestQuote")} →
          </Link>
        </div>
      </section>
    </>
  );
}
