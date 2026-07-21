export class RequestBodyError extends Error {
  constructor(
    public readonly code: "invalid_json" | "payload_too_large",
    public readonly status: 400 | 413
  ) {
    super(code);
  }
}

type Clock = () => number;

type RateLimiterOptions = {
  limit: number;
  windowMs: number;
  maxKeys?: number;
  clock?: Clock;
};

type RateEntry = { count: number; resetAt: number };

export type RateLimitDecision = {
  allowed: boolean;
  limit: number;
  remaining: number;
  retryAfterSeconds: number;
};

export function createRateLimiter({
  limit,
  windowMs,
  maxKeys = 10_000,
  clock = () => Date.now(),
}: RateLimiterOptions) {
  if (!Number.isInteger(limit) || limit < 1) throw new Error("limit must be a positive integer");
  if (!Number.isFinite(windowMs) || windowMs < 1) throw new Error("windowMs must be positive");
  if (!Number.isInteger(maxKeys) || maxKeys < 1) throw new Error("maxKeys must be a positive integer");

  const entries = new Map<string, RateEntry>();
  let nextSweepAt = 0;

  function sweepExpired(now: number) {
    if (now < nextSweepAt && entries.size < maxKeys) return;
    entries.forEach((entry, key) => {
      if (entry.resetAt <= now) entries.delete(key);
    });
    nextSweepAt = now + Math.min(windowMs, 60_000);
  }

  function check(rawKey: string): RateLimitDecision {
    const now = clock();
    const key = rawKey.slice(0, 160) || "unknown";
    sweepExpired(now);

    let entry = entries.get(key);
    if (!entry || entry.resetAt <= now) {
      if (!entry && entries.size >= maxKeys) {
        return {
          allowed: false,
          limit,
          remaining: 0,
          retryAfterSeconds: Math.max(1, Math.ceil(windowMs / 1000)),
        };
      }
      entry = { count: 0, resetAt: now + windowMs };
      entries.set(key, entry);
    }

    const retryAfterSeconds = Math.max(1, Math.ceil((entry.resetAt - now) / 1000));
    if (entry.count >= limit) {
      return { allowed: false, limit, remaining: 0, retryAfterSeconds };
    }

    entry.count += 1;
    return {
      allowed: true,
      limit,
      remaining: Math.max(0, limit - entry.count),
      retryAfterSeconds,
    };
  }

  function reset(rawKey: string) {
    entries.delete(rawKey.slice(0, 160) || "unknown");
  }

  return { check, reset, size: () => entries.size };
}

type RequestLike = {
  headers: Headers;
  text(): Promise<string>;
  url: string;
};

function cleanIp(value: string | null) {
  const candidate = value?.split(",", 1)[0]?.trim() || "";
  return candidate.length <= 64 && /^[0-9a-fA-F:.]+$/.test(candidate) ? candidate : "";
}

export function getClientIp(request: Pick<RequestLike, "headers">): string {
  return cleanIp(request.headers.get("cf-connecting-ip")) ||
    cleanIp(request.headers.get("x-real-ip")) ||
    cleanIp(request.headers.get("x-forwarded-for")) ||
    "unknown";
}

export function isSameOriginRequest(
  request: Pick<RequestLike, "headers" | "url">,
  expectedSiteUrl = process.env.NEXT_PUBLIC_SITE_URL,
  nodeEnv = process.env.NODE_ENV
) {
  const origin = request.headers.get("origin");
  if (!origin) return true;

  try {
    const normalizedOrigin = new URL(origin).origin;
    if (origin !== normalizedOrigin) return false;
    if (expectedSiteUrl) return normalizedOrigin === new URL(expectedSiteUrl).origin;
    return nodeEnv !== "production" && normalizedOrigin === new URL(request.url).origin;
  } catch {
    return false;
  }
}

export async function readJsonBody(request: RequestLike, maxBytes: number): Promise<unknown> {
  const length = request.headers.get("content-length");
  if (length && /^\d+$/.test(length) && Number(length) > maxBytes) {
    throw new RequestBodyError("payload_too_large", 413);
  }

  const raw = await request.text();
  if (new TextEncoder().encode(raw).byteLength > maxBytes) {
    throw new RequestBodyError("payload_too_large", 413);
  }

  try {
    return JSON.parse(raw);
  } catch {
    throw new RequestBodyError("invalid_json", 400);
  }
}
