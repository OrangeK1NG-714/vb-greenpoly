// ─────────────────────────────────────────────────────────────────────────────
// SINGLE SOURCE OF TRUTH for contact details & regional config.
//
// 👉 BEFORE GOING LIVE: replace every placeholder in CONTACT below with your real
//    handles. Leave a value as "" to hide that channel everywhere automatically.
//    (Every component reads from here, so you only edit this one file.)
// ─────────────────────────────────────────────────────────────────────────────

export const CONTACT = {
  // Company / brand
  brand: "GreenPoly",
  legalName: "GreenPoly Recycling Co., Ltd.",

  // Email + phone (shown in top bar, footer, contact page)
  // NOTE: using the owner's Gmail until the domain mailbox (sales@greenpoly.com
  // via Zoho) is live — a fake sales@ address that bounces is worse than a real
  // Gmail. Swap this to sales@greenpoly.com once the mailbox is set up.
  email: "richardq0714@gmail.com",
  phoneDisplay: "+86 183 5297 8082", // human-readable
  address: "Cixi, Ningbo, Zhejiang, China",
  addressFull: "Cixi, Ningbo,\nZhejiang, China",

  // ── Chat channels ── (SEA buyers live in these apps). "" = hidden.
  // WhatsApp / Zalo take the phone in international format WITHOUT "+".
  whatsapp: "8618352978082",       // wa.me/<number>  — used across Indonesia/Malaysia/global
  zalo: "8618352978082",           // zalo.me/<number> — Vietnam. Set "" to hide.
  line: "",                        // line.me/ti/p/~<lineID> — Thailand. Create a LINE ID then fill in, e.g. "greenpoly"
  wechat: "",                      // WeChat ID (mostly for China buyers). "" = hide.
} as const;

// Prefilled first message when a buyer opens a chat.
export const CHAT_PREFILL =
  "Hi, I saw your recycled pellets on greenpoly.com and would like a quote.";

export function waLink(prefill: string = CHAT_PREFILL) {
  return `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(prefill)}`;
}
export function zaloLink() {
  return `https://zalo.me/${CONTACT.zalo}`;
}
export function lineLink() {
  return `https://line.me/ti/p/~${CONTACT.line}`;
}
export function mailLink(subject: string) {
  return `mailto:${CONTACT.email}?subject=${encodeURIComponent(subject)}`;
}

// ── Southeast-Asian destination ports we consolidate / ship FCL to. ──
// Proper nouns — kept in English (standard for B2B shipping docs across the region).
export const SEA_PORTS: { country: string; flag: string; ports: string[] }[] = [
  { country: "Vietnam", flag: "🇻🇳", ports: ["Cat Lai (HCMC)", "Hai Phong", "Da Nang"] },
  { country: "Indonesia", flag: "🇮🇩", ports: ["Tanjung Priok", "Tanjung Perak", "Belawan"] },
  { country: "Thailand", flag: "🇹🇭", ports: ["Laem Chabang", "Bangkok"] },
  { country: "Malaysia", flag: "🇲🇾", ports: ["Port Klang", "Penang", "Pasir Gudang"] },
  { country: "Philippines", flag: "🇵🇭", ports: ["Manila"] },
  { country: "Singapore", flag: "🇸🇬", ports: ["PSA Singapore"] },
];
