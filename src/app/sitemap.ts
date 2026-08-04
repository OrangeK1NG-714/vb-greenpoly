import { MetadataRoute } from "next";
import { PRODUCTS } from "@/lib/products-data";
import { locales } from "@/i18n/config";
import { localizedLanguageUrls, localizedUrl } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = ["", "/products", "/about", "/quality", "/contact"];
  const productPages = PRODUCTS.map((p) => `/products/${p.slug}`);
  const allPaths = [...staticPages, ...productPages];

  const sitemap: MetadataRoute.Sitemap = [];

  for (const path of allPaths) {
    for (const loc of locales) {
      sitemap.push({
        url: localizedUrl(loc, path),
        lastModified: new Date(),
        changeFrequency: path === "" ? "weekly" : "monthly",
        priority: loc === "en" && path === "" ? 1.0 : loc === "en" ? 0.8 : 0.6,
        alternates: {
          languages: localizedLanguageUrls(path),
        },
      });
    }
  }

  sitemap.push({
    url: localizedUrl("en", "/mvp/sanding-disc-organizer"),
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.7,
  });

  return sitemap;
}
