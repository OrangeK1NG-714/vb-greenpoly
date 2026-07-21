// Product catalog data. Move to DB later; for now keep here so home/products pages render.

import type { Locale } from "@/i18n/config";

export type ProductGrade = {
  code: string;
  color: string;
  mfi: string;
  density: string;
  process: string;
  application: string;
  priceUSD: number;
};

// Partial so we can add locales without adding translations.
// Use pickName() / pickDesc() to read with English fallback.
export type LocalizedString = Partial<Record<Locale, string>> & { en: string };

export type ProductSlug = "abs" | "hips" | "pp" | "gpps";

export type ProductCategory = {
  slug: ProductSlug;
  category: "ABS" | "HIPS" | "PP" | "GPPS";
  name: LocalizedString;
  shortDesc: LocalizedString;
  hero: string;
  badge: "bestSeller" | "highDemand" | "highImpact" | "transparent";
  badgeClass: string;
  priceFrom: number;
  priceTo: number;
  leadTime: string;
  grades: ProductGrade[];
};

export function pick(field: LocalizedString, locale: Locale): string {
  return field[locale] ?? field.en;
}

export const PRODUCTS: ProductCategory[] = [
  {
    slug: "abs",
    category: "ABS",
    name: {
      en: "Recycled ABS Pellets",
      zh: "再生 ABS 颗粒",
      vi: "Hạt nhựa ABS tái chế",
      id: "Pelet ABS Daur Ulang",
      th: "เม็ดพลาสติก ABS รีไซเคิล",
      ms: "Pelet ABS Kitar Semula",
    },
    shortDesc: {
      en: "Recycled ABS from appliance shells and electronic housings. Stable impact strength, good moldability. Black / natural / custom color, with or without flame retardant.",
      zh: "来自家电外壳与电子电器壳料的再生 ABS。冲击强度稳定，注塑性好。可提供黑色、本色及定制色，可选阻燃。",
      vi: "Hạt ABS tái chế từ vỏ thiết bị gia dụng và vỏ điện tử. Độ bền va đập ổn định, dễ ép phun. Có màu đen, tự nhiên hoặc theo yêu cầu, tùy chọn chống cháy.",
      id: "ABS daur ulang dari cangkang peralatan rumah tangga dan housing elektronik. Kekuatan bentur stabil dan mudah dicetak. Tersedia hitam, natural, atau warna khusus, dengan atau tanpa tahan api.",
      th: "เม็ด ABS รีไซเคิลจากเปลือกเครื่องใช้ไฟฟ้าและชิ้นส่วนอิเล็กทรอนิกส์ ความทนแรงกระแทกสม่ำเสมอ ขึ้นรูปง่าย มีสีดำ สีธรรมชาติ หรือสีสั่งทำ พร้อมตัวเลือกสารหน่วงไฟ",
      ms: "ABS kitar semula daripada perumah peralatan rumah dan elektronik. Kekuatan hentakan stabil dan mudah dibentuk. Tersedia dalam hitam, asli atau warna tersuai, dengan atau tanpa kalis api.",
    },
    hero: "/images/products/abs.jpg",
    badge: "bestSeller",
    badgeClass: "bg-emerald-100 text-emerald-700",
    priceFrom: 850,
    priceTo: 1250,
    leadTime: "7–14 days",
    grades: [
      { code: "ABS-BK-IN", color: "Black", mfi: "12–18", density: "1.05", process: "Injection", application: "Appliance shells, power tool housings", priceUSD: 950 },
      { code: "ABS-NT-EE", color: "Natural / Off-white", mfi: "15–22", density: "1.04", process: "Injection", application: "E&E parts, monitors, printer housings", priceUSD: 1050 },
      { code: "ABS-WH-AP", color: "White", mfi: "10–15", density: "1.05", process: "Injection", application: "Refrigerator parts, washing machine panels", priceUSD: 1100 },
      { code: "ABS-GR-AU", color: "Grey", mfi: "8–14", density: "1.06", process: "Injection / Extrusion", application: "Auto interior trim, dashboard parts", priceUSD: 980 },
      { code: "ABS-FR-V0", color: "Black (FR V-0)", mfi: "10–16", density: "1.18", process: "Injection", application: "Power adapters, electrical enclosures", priceUSD: 1250 },
    ],
  },
  {
    slug: "hips",
    category: "HIPS",
    name: {
      en: "Recycled HIPS Pellets",
      zh: "再生 HIPS（高抗冲聚苯乙烯）颗粒",
      vi: "Hạt nhựa HIPS tái chế",
      id: "Pelet HIPS Daur Ulang",
      th: "เม็ดพลาสติก HIPS รีไซเคิล",
      ms: "Pelet HIPS Kitar Semula",
    },
    shortDesc: {
      en: "High-impact polystyrene recycled from refrigerator liners, yogurt cups and disposable cutlery. Excellent toughness, easy thermoforming, low odor.",
      zh: "来源于冰箱内胆、酸奶杯及一次性餐具的再生 HIPS。抗冲击好，易热成型，气味低。",
      vi: "HIPS tái chế từ lớp lót tủ lạnh, cốc sữa chua và dao thìa dùng một lần. Độ dai tốt, dễ tạo hình nhiệt và mùi thấp.",
      id: "HIPS daur ulang dari liner lemari es, cup yogurt, dan alat makan sekali pakai. Ketangguhan baik, mudah thermoforming, dan berbau rendah.",
      th: "HIPS รีไซเคิลจากแผ่นบุภายในตู้เย็น ถ้วยโยเกิร์ต และช้อนส้อมใช้แล้วทิ้ง ทนแรงกระแทกดี ขึ้นรูปด้วยความร้อนได้ง่าย และมีกลิ่นต่ำ",
      ms: "HIPS kitar semula daripada pelapik peti sejuk, bekas yogurt dan peralatan makan pakai buang. Tahan lasak, mudah termoform dan berbau rendah.",
    },
    hero: "/images/products/hips.jpg",
    badge: "highImpact",
    badgeClass: "bg-orange-100 text-orange-700",
    priceFrom: 780,
    priceTo: 1050,
    leadTime: "7–14 days",
    grades: [
      { code: "HIPS-WH-RF", color: "White (off-white)", mfi: "3–5", density: "1.04", process: "Sheet Extrusion", application: "Refrigerator liners, thermoformed sheet", priceUSD: 880 },
      { code: "HIPS-NT-CT", color: "Natural", mfi: "6–9", density: "1.04", process: "Sheet / Thermoforming", application: "Yogurt cups, food containers", priceUSD: 920 },
      { code: "HIPS-BK-IN", color: "Black", mfi: "8–12", density: "1.05", process: "Injection", application: "TV / audio housings, electronic backs", priceUSD: 820 },
      { code: "HIPS-MX-RG", color: "Mixed color (regrind)", mfi: "5–10", density: "1.04", process: "Injection / Extrusion", application: "Inner parts, hangers, fillers", priceUSD: 780 },
      { code: "HIPS-IM-HI", color: "Natural (high impact)", mfi: "2–4", density: "1.04", process: "Sheet Extrusion", application: "Refrigerator panels needing higher IZOD", priceUSD: 1050 },
    ],
  },
  {
    slug: "pp",
    category: "PP",
    name: {
      en: "Recycled PP Pellets",
      zh: "再生 PP（聚丙烯）颗粒",
      vi: "Hạt nhựa PP tái chế",
      id: "Pelet PP Daur Ulang",
      th: "เม็ดพลาสติก PP รีไซเคิล",
      ms: "Pelet PP Kitar Semula",
    },
    shortDesc: {
      en: "Injection and extrusion-grade recycled polypropylene from clean post-industrial scrap. Homopolymer and copolymer available; optional talc / CaCO3 filling.",
      zh: "来自洁净工业边角料的注塑及挤出级再生聚丙烯。可提供均聚与共聚牌号，可定制滑石粉/碳酸钙填充。",
      vi: "PP tái chế cấp ép phun và đùn từ phế liệu công nghiệp sạch. Có homopolymer và copolymer; tùy chọn độn talc hoặc CaCO3.",
      id: "Polipropilena daur ulang untuk injection dan ekstrusi dari scrap industri bersih. Tersedia homopolimer dan kopolimer; pengisi talc atau CaCO3 opsional.",
      th: "PP รีไซเคิลเกรดฉีดและรีดขึ้นรูปจากเศษอุตสาหกรรมที่สะอาด มีทั้งโฮโมพอลิเมอร์และโคพอลิเมอร์ พร้อมตัวเลือกเติมทัลก์หรือ CaCO3",
      ms: "Polipropilena kitar semula gred suntikan dan penyemperitan daripada sisa industri yang bersih. Homopolimer dan kopolimer tersedia; pengisi talkum atau CaCO3 adalah pilihan.",
    },
    hero: "/images/products/pp.jpg",
    badge: "highDemand",
    badgeClass: "bg-blue-100 text-blue-700",
    priceFrom: 700,
    priceTo: 980,
    leadTime: "7–14 days",
    grades: [
      { code: "PP-BK-IN", color: "Black", mfi: "8–12", density: "0.905", process: "Injection", application: "Auto trim, household appliance parts", priceUSD: 780 },
      { code: "PP-NT-RF", color: "Natural", mfi: "2–4", density: "0.902", process: "Raffia extrusion", application: "Woven PP bags, FIBC", priceUSD: 900 },
      { code: "PP-CP-CR", color: "Black / Grey", mfi: "5–8", density: "0.910", process: "Injection (copolymer)", application: "Crates, pallets, fish boxes", priceUSD: 850 },
      { code: "PP-TF20", color: "Black", mfi: "10–14", density: "1.04", process: "Injection (talc 20%)", application: "Auto bumpers, dashboards", priceUSD: 720 },
      { code: "PP-FI-25", color: "White", mfi: "20–25", density: "0.905", process: "Fiber spinning", application: "Non-woven, geotextile", priceUSD: 920 },
    ],
  },
  {
    slug: "gpps",
    category: "GPPS",
    name: {
      en: "Recycled GPPS Pellets",
      zh: "再生 GPPS（通用聚苯乙烯）颗粒",
      vi: "Hạt nhựa GPPS tái chế",
      id: "Pelet GPPS Daur Ulang",
      th: "เม็ดพลาสติก GPPS รีไซเคิล",
      ms: "Pelet GPPS Kitar Semula",
    },
    shortDesc: {
      en: "General-purpose polystyrene with high transparency, suitable for disposable cutlery, CD cases, stationery and light covers. Crystal clear or color matched.",
      zh: "高透明通用聚苯乙烯，适用于一次性餐具、CD 盒、文具、灯罩等。可做水晶透明或定制色。",
      vi: "Polystyrene mục đích chung có độ trong cao, phù hợp cho dao thìa dùng một lần, hộp CD, văn phòng phẩm và chụp đèn. Có loại trong suốt hoặc phối màu.",
      id: "Polistirena serbaguna dengan transparansi tinggi, cocok untuk alat makan sekali pakai, kotak CD, alat tulis, dan penutup lampu. Tersedia bening kristal atau warna khusus.",
      th: "โพลีสไตรีนใช้งานทั่วไปที่มีความใสสูง เหมาะกับช้อนส้อมใช้แล้วทิ้ง กล่อง CD เครื่องเขียน และฝาครอบโคมไฟ มีทั้งใสแบบคริสตัลหรือสีสั่งทำ",
      ms: "Polistirena guna am dengan ketelusan tinggi, sesuai untuk peralatan makan pakai buang, bekas CD, alat tulis dan penutup lampu. Tersedia jernih seperti kristal atau padanan warna.",
    },
    hero: "/images/products/gpps.jpg",
    badge: "transparent",
    badgeClass: "bg-sky-100 text-sky-700",
    priceFrom: 720,
    priceTo: 980,
    leadTime: "7–14 days",
    grades: [
      { code: "GPPS-CL-IN", color: "Crystal Clear", mfi: "10–14", density: "1.04", process: "Injection", application: "Disposable cutlery, lighters, pens", priceUSD: 880 },
      { code: "GPPS-CL-SH", color: "Crystal Clear", mfi: "4–8", density: "1.05", process: "Sheet Extrusion", application: "Clear thermoforming sheet, lids", priceUSD: 920 },
      { code: "GPPS-CD-AU", color: "Audio Clear", mfi: "8–12", density: "1.04", process: "Injection", application: "CD / DVD cases, display boxes", priceUSD: 800 },
      { code: "GPPS-MD-EX", color: "Medical Clear", mfi: "6–10", density: "1.05", process: "Extrusion", application: "Stationery rulers, light diffusers", priceUSD: 980 },
      { code: "GPPS-MX-RG", color: "Mixed color (regrind)", mfi: "Variable", density: "1.04", process: "—", application: "Internal blending, fillers", priceUSD: 720 },
    ],
  },
];

export function getProduct(slug: string) {
  return PRODUCTS.find((p) => p.slug === slug);
}

// Quick lookup: grade code -> { product, grade }. Used by ContactForm to prefill from ?grade=XXX.
export function findGrade(code: string) {
  for (const p of PRODUCTS) {
    const g = p.grades.find((x) => x.code === code);
    if (g) return { product: p, grade: g };
  }
  return null;
}
