import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { CONTACT } from "@/lib/site";

export default function Footer() {
  const t = useTranslations("footer");
  const tNav = useTranslations("nav");
  const locale = useLocale();
  const localePath = locale === "en" ? "" : `/${locale}`;
  const year = 2026;

  const products = [
    { slug: "abs", label: "Recycled ABS" },
    { slug: "hips", label: "Recycled HIPS" },
    { slug: "pp", label: "Recycled PP" },
    { slug: "gpps", label: "Recycled GPPS" },
  ];

  return (
    <footer className="bg-forest-900 text-emerald-100/60 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-10 mb-12">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-600 to-brand-800 flex items-center justify-center text-white font-extrabold">
                G
              </div>
              <span className="text-xl font-extrabold text-white">{CONTACT.brand}</span>
            </div>
            <p className="text-sm leading-relaxed">{t("tagline")}</p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">{t("productsHeading")}</h4>
            <ul className="space-y-2 text-sm">
              {products.map((p) => (
                <li key={p.slug}>
                  <Link href={`${localePath}/products/${p.slug}`} className="hover:text-white transition">
                    {p.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href={`${localePath}/products`} className="hover:text-white transition">
                  {tNav("products")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">{t("companyHeading")}</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href={`${localePath}/about`} className="hover:text-white transition">{tNav("about")}</Link></li>
              <li><Link href={`${localePath}/quality`} className="hover:text-white transition">{tNav("quality")}</Link></li>
              <li><Link href={`${localePath}/contact`} className="hover:text-white transition">{tNav("contact")}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">{t("contactHeading")}</h4>
            <ul className="space-y-2 text-sm">
              <li>📧 {CONTACT.email}</li>
              <li>📱 WhatsApp: {CONTACT.phoneDisplay}</li>
              <li>📍 {CONTACT.address}</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 text-sm text-center">
          {t("copyright", { year })}
        </div>
      </div>
    </footer>
  );
}
