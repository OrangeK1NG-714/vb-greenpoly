import Link from "next/link";
import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });
  return { title: `${t("title1")} ${t("title2")}`, description: t("subtitle") };
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("about");
  const localePath = locale === "en" ? "" : `/${locale}`;

  return (
    <>
      <section className="gradient-hero text-white py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <span className="inline-block bg-white/10 backdrop-blur px-4 py-1.5 rounded-full text-sm mb-6">
            {t("badge")}
          </span>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            {t("title1")}<br />{t("title2")}
          </h1>
          <p className="text-lg md:text-xl text-emerald-50">{t("subtitle")}</p>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 prose prose-slate max-w-none">
          <h2 className="text-3xl font-bold text-slate-900">{t("storyTitle")}</h2>
          <p className="text-slate-700 leading-relaxed">{t("storyP1")}</p>
          <p className="text-slate-700 leading-relaxed">{t("storyP2")}</p>
          <p className="text-slate-700 leading-relaxed">{t("storyP3")}</p>
        </div>
      </section>

      <section className="py-20 bg-amber-50">
        <div className="max-w-5xl mx-auto px-4">
          <div className="bg-white border-l-4 border-amber-400 rounded-xl p-8 shadow-sm">
            <div className="text-xs font-bold uppercase tracking-wide text-amber-700 mb-2">{t("sourcingTag")}</div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">{t("sourcingTitle")}</h2>
            <p className="text-slate-700 leading-relaxed mb-4">{t("sourcingP1")}</p>
            <p className="text-slate-700 leading-relaxed mb-6">{t("sourcingP2")}</p>
            <ul className="space-y-2 text-slate-700">
              {[1, 2, 3, 4].map((i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-amber-600 font-bold mt-0.5">✓</span>
                  <span>{t(`sourcingPoint${i}`)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-3 gap-6">
          {[
            { num: "300 T", labelKey: "stat1Label", bodyKey: "stat1Body" },
            { num: "4", labelKey: "stat2Label", bodyKey: "stat2Body" },
            { num: "24h", labelKey: "stat3Label", bodyKey: "stat3Body" },
          ].map((s, i) => (
            <div key={i} className="bg-white p-8 rounded-xl border border-slate-200">
              <div className="text-3xl font-bold text-emerald-700 mb-2">{s.num}</div>
              <h3 className="font-bold mb-2">{t(s.labelKey)}</h3>
              <p className="text-slate-600 text-sm">{t(s.bodyKey)}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-16 gradient-hero text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">{t("ctaTitle")}</h2>
          <p className="text-lg text-emerald-100 mb-8">{t("ctaBody")}</p>
          <Link href={`${localePath}/contact`} className="bg-white text-emerald-700 px-8 py-4 rounded-lg font-semibold hover:bg-emerald-50 transition inline-block" data-track="cta_about_quote">
            {t("ctaButton")} →
          </Link>
        </div>
      </section>
    </>
  );
}
