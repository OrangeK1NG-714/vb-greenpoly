// IP geolocation lookup via ip-api.com (free tier, no API key, 45 req/min).
// Cached in-process for 24h to stay well under the rate limit.

export type IpGeo = {
  ip: string;
  country: string | null;
  countryCode: string | null;
  region: string | null;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  isp: string | null;
  timezone: string | null;
};

type CacheEntry = { value: IpGeo; expires: number };
const cache = new Map<string, CacheEntry>();
const TTL_MS = 24 * 60 * 60 * 1000;

function isPrivateIp(ip: string): boolean {
  if (!ip) return true;
  if (ip === "::1" || ip === "127.0.0.1" || ip === "localhost") return true;
  if (ip.startsWith("10.")) return true;
  if (ip.startsWith("192.168.")) return true;
  if (ip.startsWith("169.254.")) return true;
  if (ip.startsWith("fc") || ip.startsWith("fd")) return true; // IPv6 ULA
  if (ip.startsWith("fe80:")) return true;
  // 172.16.0.0 – 172.31.255.255
  const m = ip.match(/^172\.(\d+)\./);
  if (m) {
    const n = parseInt(m[1], 10);
    if (n >= 16 && n <= 31) return true;
  }
  return false;
}

function emptyGeo(ip: string): IpGeo {
  return {
    ip,
    country: null,
    countryCode: null,
    region: null,
    city: null,
    latitude: null,
    longitude: null,
    isp: null,
    timezone: null,
  };
}

/**
 * Look up geolocation for an IP. Returns null fields for private/loopback IPs
 * (e.g. localhost dev). Cached for 24h.
 */
export async function lookupIp(ip: string | null | undefined): Promise<IpGeo> {
  if (!ip) return emptyGeo("");
  if (isPrivateIp(ip)) return emptyGeo(ip);

  const cached = cache.get(ip);
  if (cached && cached.expires > Date.now()) return cached.value;

  try {
    const url = `http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,country,countryCode,regionName,city,lat,lon,isp,timezone,query`;
    const res = await fetch(url, {
      // 8 second timeout — generous enough for cold DNS, never blocks the tracking pipeline
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) {
      const empty = emptyGeo(ip);
      cache.set(ip, { value: empty, expires: Date.now() + 60_000 }); // short negative cache
      return empty;
    }
    const data = await res.json();
    if (data.status !== "success") {
      const empty = emptyGeo(ip);
      cache.set(ip, { value: empty, expires: Date.now() + 60_000 });
      return empty;
    }
    const geo: IpGeo = {
      ip,
      country: data.country ?? null,
      countryCode: data.countryCode ?? null,
      region: data.regionName ?? null,
      city: data.city ?? null,
      latitude: typeof data.lat === "number" ? data.lat : null,
      longitude: typeof data.lon === "number" ? data.lon : null,
      isp: data.isp ?? null,
      timezone: data.timezone ?? null,
    };
    cache.set(ip, { value: geo, expires: Date.now() + TTL_MS });
    return geo;
  } catch {
    const empty = emptyGeo(ip);
    cache.set(ip, { value: empty, expires: Date.now() + 60_000 });
    return empty;
  }
}
