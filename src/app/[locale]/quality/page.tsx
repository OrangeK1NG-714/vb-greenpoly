import Link from "next/link";
import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { localizedAlternates } from "@/lib/seo";

const PROMISES = [
  { icon: "🔬", titleKey: "p1Title", bodyKey: "p1Body" },
  { icon: "📄", titleKey: "p2Title", bodyKey: "p2Body" },
  { icon: "🧪", titleKey: "p3Title", bodyKey: "p3Body" },
  { icon: "🏷️", titleKey: "p4Title", bodyKey: "p4Body" },
  { icon: "📦", titleKey: "p5Title", bodyKey: "p5Body" },
  { icon: "🔁", titleKey: "p6Title", bodyKey: "p6Body" },
];

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "quality" });
  return {
    title: `${t("title1")} ${t("title2")}`,
    description: t("subtitle"),
    alternates: localizedAlternates(locale, "/quality"),
  };
}

const STEPS = [
  { num: "01", titleKey: "s1Title", bodyKey: "s1Body" },
  { num: "02", titleKey: "s2Title", bodyKey: "s2Body" },
  { num: "03", titleKey: "s3Title", bodyKey: "s3Body" },
  { num: "04", titleKey: "s4Title", bodyKey: "s4Body" },
  { num: "05", titleKey: "s5Title", bodyKey: "s5Body" },
];

export default async function QualityPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("quality");
  const localePath = locale === "en" ? "" : `/${locale}`;

  return (
    <>
      <section className="gradient-hero text-white py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <span className="inline-block bg-white/10 backdrop-blur px-4 py-1.5 rounded-full text-sm mb-6">{t("badge")}</span>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">{t("title1")}<br />{t("title2")}</h1>
          <p className="text-lg md:text-xl text-emerald-50">{t("subtitle")}</p>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-emerald-700 font-semibold uppercase text-sm tracking-wide">{t("promisesTag")}</span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-2">{t("promisesTitle")}</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {PROMISES.map((c) => (
              <div key={c.titleKey} className="bg-slate-50 p-8 rounded-xl border border-slate-200">
                <div className="text-3xl mb-3">{c.icon}</div>
                <h3 className="font-bold text-lg mb-2">{t(c.titleKey)}</h3>
                <p className="text-slate-600 text-sm">{t(c.bodyKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-emerald-700 font-semibold uppercase text-sm tracking-wide">{t("processTag")}</span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-2">{t("processTitle")}</h2>
          </div>
          <div className="grid md:grid-cols-5 gap-4">
            {STEPS.map((s) => (
              <div key={s.num} className="bg-white p-5 rounded-xl border border-slate-200">
                <div className="text-emerald-700 font-bold text-sm mb-1">STEP {s.num}</div>
                <h3 className="font-bold mb-2 text-sm">{t(s.titleKey)}</h3>
                <p className="text-slate-600 text-xs leading-relaxed">{t(s.bodyKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-amber-50">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white border-l-4 border-amber-400 rounded-xl p-8 shadow-sm">
            <div className="text-xs font-bold uppercase tracking-wide text-amber-700 mb-2">{t("honestTag")}</div>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">{t("honestTitle")}</h2>
            <p className="text-slate-700 leading-relaxed">{t("honestBody")}</p>
          </div>
        </div>
      </section>

      <section className="py-16 gradient-hero text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">{t("ctaTitle")}</h2>
          <p className="text-lg text-emerald-100 mb-8">{t("ctaBody")}</p>
          <Link href={`${localePath}/contact`} className="bg-white text-emerald-700 px-8 py-4 rounded-lg font-semibold hover:bg-emerald-50 transition inline-block" data-track="cta_quality_quote">
            {t("ctaButton")} →
          </Link>
        </div>
      </section>
    </>
  );
}
