// Location is read from the trusted CDN/host edge headers. Do not send visitor
// IPs to a third-party lookup API from the request path: it adds latency, leaks
// personal data, and makes the data panel depend on an external service.

import { getClientIp } from "@/lib/request-security";

const COUNTRY_CODE_RE = /^[A-Z]{2}$/;
const UNKNOWN_COUNTRY_CODES = new Set(["T1", "XX"]);

export type VisitorInfo = {
  ip: string | null;
  country: string | null;
  countryCode: string | null;
  region: string | null;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  timezone: string | null;
  userAgent: string | null;
  referrer: string | null;
};

function readTextHeader(headers: Headers, names: string[]): string | null {
  for (const name of names) {
    const value = headers.get(name)?.trim();
    if (!value) continue;
    try {
      const decoded = decodeURIComponent(value).trim();
      if (decoded.length <= 128) return decoded;
    } catch {
      if (value.length <= 128) return value;
    }
  }
  return null;
}

function readNumberHeader(headers: Headers, names: string[]): number | null {
  const value = readTextHeader(headers, names);
  if (!value) return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function getCountryCode(headers: Headers): string | null {
  const value = readTextHeader(headers, [
    "cf-ipcountry",
    "x-vercel-ip-country",
    "cloudfront-viewer-country",
  ])?.toUpperCase();
  return value && COUNTRY_CODE_RE.test(value) && !UNKNOWN_COUNTRY_CODES.has(value) ? value : null;
}

function getCountryName(countryCode: string | null): string | null {
  if (!countryCode) return null;
  try {
    return new Intl.DisplayNames(["en"], { type: "region" }).of(countryCode) ?? null;
  } catch {
    return countryCode;
  }
}

export function getVisitorInfo(headers: Headers): VisitorInfo {
  const countryCode = getCountryCode(headers);
  const ip = getClientIp({ headers });

  return {
    ip: ip === "unknown" ? null : ip,
    country: getCountryName(countryCode),
    countryCode,
    // Cloudflare Free supplies country by default. These values are retained for
    // trusted host/edge configurations that explicitly forward finer location.
    region: readTextHeader(headers, ["x-vercel-ip-country-region", "x-geo-region"]),
    city: readTextHeader(headers, ["x-vercel-ip-city", "x-geo-city"]),
    latitude: readNumberHeader(headers, ["x-vercel-ip-latitude", "x-geo-latitude"]),
    longitude: readNumberHeader(headers, ["x-vercel-ip-longitude", "x-geo-longitude"]),
    timezone: readTextHeader(headers, ["x-vercel-ip-timezone", "x-geo-timezone"]),
    userAgent: readTextHeader(headers, ["user-agent"]),
    referrer: readTextHeader(headers, ["referer"]),
  };
}
