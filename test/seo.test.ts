import assert from "node:assert/strict";
import test from "node:test";
import { localizedAlternates, localizedPath, localizedUrl, siteUrl } from "../src/lib/seo";

test("localized URLs use an unprefixed English canonical and prefixed target languages", () => {
  assert.equal(localizedPath("en", "/products/abs"), "/products/abs");
  assert.equal(localizedPath("vi", "/products/abs"), "/vi/products/abs");
  assert.equal(localizedPath("invalid", "/products/abs"), "/products/abs");
  assert.equal(localizedUrl("id", "/contact"), `${siteUrl}/id/contact`);
});

test("localized alternates contain a page-specific canonical and every language", () => {
  const alternates = localizedAlternates("th", "/quality");
  assert.equal(alternates.canonical, `${siteUrl}/th/quality`);
  assert.deepEqual(alternates.languages, {
    en: `${siteUrl}/quality`,
    vi: `${siteUrl}/vi/quality`,
    id: `${siteUrl}/id/quality`,
    th: `${siteUrl}/th/quality`,
    ms: `${siteUrl}/ms/quality`,
    zh: `${siteUrl}/zh/quality`,
    "x-default": `${siteUrl}/quality`,
  });
});
