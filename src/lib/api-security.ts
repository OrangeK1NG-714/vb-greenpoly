import { NextRequest, NextResponse } from "next/server";
import {
  createRateLimiter,
  getClientIp,
  isSameOriginRequest,
  RateLimitDecision,
  RequestBodyError,
} from "@/lib/request-security";

type ApiLimiter = ReturnType<typeof createRateLimiter>;

const globalSecurity = globalThis as unknown as {
  greenpolyLimiters?: Record<"login" | "inquiry" | "track" | "admin", ApiLimiter>;
};

export const apiLimiters = globalSecurity.greenpolyLimiters ?? {
  login: createRateLimiter({ limit: 10, windowMs: 15 * 60_000 }),
  inquiry: createRateLimiter({ limit: 12, windowMs: 60 * 60_000 }),
  track: createRateLimiter({ limit: 180, windowMs: 60_000 }),
  admin: createRateLimiter({ limit: 120, windowMs: 15 * 60_000 }),
};

if (process.env.NODE_ENV !== "production") globalSecurity.greenpolyLimiters = apiLimiters;

function rateLimitHeaders(decision: RateLimitDecision) {
  return {
    "Cache-Control": "no-store",
    "Retry-After": String(decision.retryAfterSeconds),
    "X-RateLimit-Limit": String(decision.limit),
    "X-RateLimit-Remaining": String(decision.remaining),
  };
}

export function rejectRateLimited(request: NextRequest, limiter: ApiLimiter) {
  const decision = limiter.check(getClientIp(request));
  if (decision.allowed) return null;
  return NextResponse.json(
    { ok: false, error: "rate_limited" },
    { status: 429, headers: rateLimitHeaders(decision) }
  );
}

export function rejectCrossSite(request: NextRequest) {
  if (isSameOriginRequest(request)) return null;
  return NextResponse.json(
    { ok: false, error: "cross_site_request_blocked" },
    { status: 403, headers: { "Cache-Control": "no-store" } }
  );
}

export function requestBodyErrorResponse(error: unknown) {
  if (!(error instanceof RequestBodyError)) return null;
  return NextResponse.json(
    { ok: false, error: error.code },
    { status: error.status, headers: { "Cache-Control": "no-store" } }
  );
}
