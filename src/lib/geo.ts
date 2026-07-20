// Helpers to extract visitor info from request headers.
// Vercel sets x-vercel-ip-country, Cloudflare sets cf-ipcountry.

import { headers } from "next/headers";

export async function getVisitorInfo() {
  const h = await headers();
  const ip =
    h.get("x-forwarded-for")?.split(",")[0].trim() ||
    h.get("x-real-ip") ||
    null;
  const country =
    h.get("x-vercel-ip-country") ||
    h.get("cf-ipcountry") ||
    null;
  const city =
    h.get("x-vercel-ip-city") ||
    h.get("cf-ipcity") ||
    null;
  const userAgent = h.get("user-agent") || null;
  const referrer = h.get("referer") || null;

  return { ip, country, city, userAgent, referrer };
}
