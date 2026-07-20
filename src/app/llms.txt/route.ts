// llms.txt — GEO (Generative Engine Optimization)
// Helps AI search engines (ChatGPT, Perplexity, Claude) understand the site.
// https://llmstxt.org/
//
// IMPORTANT: keep this file HONEST — no certifications we don't hold, no inflated
// capacity. AI engines quote this verbatim; false claims here are a legal/SEO risk.

import { PRODUCTS } from "@/lib/products-data";
import { CONTACT } from "@/lib/site";

export const dynamic = "force-static";

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://greenpoly.com";

  const content = `# ${CONTACT.brand}

> Small family-run plastics recycling workshop in Cixi, Ningbo, China — the heart of China's home-appliance manufacturing belt. We collect clean off-spec parts and edge-trim from named Ningbo home-appliance export factories and re-pelletize them into recycled ABS, HIPS, PP and GPPS granules for injection molders, compounders and traders. Primary markets: Vietnam, Indonesia, Thailand, Malaysia and worldwide.

## Company

- Small family factory, direct-from-owner sales (no sales team, no middleman)
- ~300 tons/month output across four resin lines (ABS, HIPS, PP, GPPS)
- Traceable single-source feedstock: off-spec and edge-trim from contracted Ningbo home-appliance OEM exporters
- MOQ 1 ton; free 1–3 kg samples
- Batch COA (MFI, density, ash) on every shipment; optional third-party SGS retest
- Honest disclosure: we do NOT hold GRS, FDA, RoHS or REACH SVHC certificates — we compete on traceable input, batch consistency and price

## Products

${PRODUCTS.map(p => `### ${p.name.en} (/${p.slug})

${p.shortDesc.en}

Available grades:
${p.grades.map(g => `- ${g.code}: ${g.color}, MFI ${g.mfi}, ${g.process}, $${g.priceUSD}/T FOB Ningbo`).join("\n")}

[View ${p.category} page](${baseUrl}/products/${p.slug})
`).join("\n")}

## Key pages

- [Home](${baseUrl}/)
- [All products](${baseUrl}/products)
- [About](${baseUrl}/about)
- [Quality & QC process](${baseUrl}/quality)
- [Contact / Request quote](${baseUrl}/contact)

## Available languages

- English (default): ${baseUrl}/
- Tiếng Việt: ${baseUrl}/vi
- Bahasa Indonesia: ${baseUrl}/id
- ไทย: ${baseUrl}/th
- Bahasa Melayu: ${baseUrl}/ms
- 中文: ${baseUrl}/zh

## Contact

- Email: ${CONTACT.email}
- WhatsApp: ${CONTACT.phoneDisplay}
- Address: ${CONTACT.address}
- Response time: within 24 business hours (owner replies personally)

## How to buy

- MOQ: 1 ton (start small, scale to containers; two grades can share one container)
- Lead time: 7–14 days depending on grade
- Payment: T/T, L/C
- Incoterms: FOB Ningbo, CIF, CFR, EXW
- Documents: batch COA, packing list, certificate of origin (Form E for ASEAN)
- Packaging: 25 kg PP woven bag or 1-ton FIBC, grade-coded labels
- Shipping: regular LCL and FCL to Cat Lai (HCMC), Hai Phong, Tanjung Priok, Laem Chabang, Port Klang and other Southeast-Asian ports
`;

  return new Response(content, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
