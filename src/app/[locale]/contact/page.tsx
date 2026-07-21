import { Suspense } from "react";
import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import ContactForm from "@/components/marketing/ContactForm";
import { CONTACT, waLink, zaloLink, lineLink } from "@/lib/site";
import { localizedAlternates } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contact" });
  return {
    title: t("title"),
    description: t("subtitle"),
    alternates: localizedAlternates(locale, "/contact"),
  };
}

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("contact");
  const tf = await getTranslations("floating");

  return (
    <>
      <section className="gradient-hero text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">{t("title")}</h1>
          <p className="text-lg md:text-xl text-emerald-50/90">{t("subtitle")}</p>
        </div>
      </section>

      <section className="py-16 bg-sand">
        <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-5 gap-10">
          <div className="md:col-span-2 space-y-6">
            {/* Quick chat channels */}
            <div className="space-y-2">
              {CONTACT.whatsapp && (
                <a
                  href={waLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 bg-[#25D366] hover:brightness-95 text-white font-semibold rounded-xl px-4 py-3 transition"
                  data-track="contact_whatsapp"
                >
                  💬 <span className="flex-1">{tf("waButton")}</span>
                  <span className="text-xs opacity-80">{tf("waReply")}</span>
                </a>
              )}
              {CONTACT.zalo && (
                <a
                  href={zaloLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 bg-[#0068FF] hover:brightness-95 text-white font-semibold rounded-xl px-4 py-3 transition"
                  data-track="contact_zalo"
                >
                  🇻🇳 <span className="flex-1">{tf("zaloButton")}</span>
                </a>
              )}
              {CONTACT.line && (
                <a
                  href={lineLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 bg-[#06C755] hover:brightness-95 text-white font-semibold rounded-xl px-4 py-3 transition"
                  data-track="contact_line"
                >
                  🇹🇭 <span className="flex-1">{tf("lineButton")}</span>
                </a>
              )}
            </div>

            <div>
              <h3 className="text-lg font-bold text-forest-900 mb-3">{t("directContact")}</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="text-brand-600 text-xl">📧</div>
                  <div>
                    <div className="text-xs text-slate-500 uppercase tracking-wide">{t("email")}</div>
                    <a href={`mailto:${CONTACT.email}`} className="text-forest-900 hover:text-brand-700">{CONTACT.email}</a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="text-brand-600 text-xl">📱</div>
                  <div>
                    <div className="text-xs text-slate-500 uppercase tracking-wide">{t("whatsappLabel")}</div>
                    <a href={waLink()} className="text-forest-900 hover:text-brand-700">{CONTACT.phoneDisplay}</a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="text-brand-600 text-xl">📍</div>
                  <div>
                    <div className="text-xs text-slate-500 uppercase tracking-wide">{t("address")}</div>
                    <span className="text-forest-900 whitespace-pre-line">{CONTACT.addressFull}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-brand-50 border border-brand-100 rounded-2xl p-5">
              <h4 className="font-bold text-brand-900 mb-2">⏱ {t("responseTitle")}</h4>
              <p className="text-brand-800 text-sm">{t("responseBody")}</p>
            </div>

            <div className="card p-5">
              <h4 className="font-bold mb-2 text-forest-900">🕐 {t("hoursTitle")}</h4>
              <p className="text-slate-700 text-sm">{t("hoursBody")}</p>
            </div>
          </div>

          <div className="md:col-span-3">
            <div className="card p-8">
              <h2 className="text-2xl font-bold text-forest-900 mb-2">{t("formTitle")}</h2>
              <p className="text-slate-600 mb-6 text-sm">{t("formSubtitle")}</p>
              <Suspense fallback={<div className="text-slate-500 text-sm">Loading form…</div>}>
                <ContactForm />
              </Suspense>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
