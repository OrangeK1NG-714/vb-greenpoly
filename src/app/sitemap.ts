import { MetadataRoute } from "next";
import { PRODUCTS } from "@/lib/products-data";
import { locales } from "@/i18n/config";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://greenpoly.com";

  const staticPages = ["", "/products", "/about", "/quality", "/contact"];
  const productPages = PRODUCTS.map((p) => `/products/${p.slug}`);
  const allPaths = [...staticPages, ...productPages];

  const sitemap: MetadataRoute.Sitemap = [];

  for (const path of allPaths) {
    // English (default — no prefix)
    sitemap.push({
      url: `${baseUrl}${path || "/"}`,
      lastModified: new Date(),
      changeFrequency: path === "" ? "weekly" : "monthly",
      priority: path === "" ? 1.0 : 0.8,
      alternates: {
        languages: Object.fromEntries(
          locales.map((loc) => [
            loc,
            loc === "en" ? `${baseUrl}${path || "/"}` : `${baseUrl}/${loc}${path}`,
          ])
        ),
      },
    });
    // Localized versions
    for (const loc of locales) {
      if (loc === "en") continue;
      sitemap.push({
        url: `${baseUrl}/${loc}${path}`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.6,
      });
    }
  }

  return sitemap;
}
