import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { apiLimiters, rejectRateLimited } from "@/lib/api-security";
import { prisma } from "@/lib/db";
import { secureTokenMatch } from "@/lib/internal-token";
import { buildMarketingStats } from "@/lib/marketing-stats";
import { getMarketingStatsToken } from "@/lib/production-config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const QuerySchema = z.object({
  days: z.coerce.number().int().min(1).max(365).default(30),
}).strict();

function noStoreJson(body: object, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

function hostname(raw: string): string {
  try {
    return new URL(`http://${raw}`).hostname.toLowerCase().replace(/^\[|\]$/g, "");
  } catch {
    return "";
  }
}

function isPrivateHostname(value: string): boolean {
  if (value === "localhost" || value === "::1" || value.startsWith("127.")) return true;
  const octets = value.split(".").map(Number);
  if (octets.length !== 4 || octets.some((octet) => !Number.isInteger(octet) || octet < 0 || octet > 255)) {
    return false;
  }
  return octets[0] === 10 ||
    (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31) ||
    (octets[0] === 192 && octets[1] === 168);
}

export function isPublicMarketingStatsRequest(req: NextRequest): boolean {
  const hosts = [req.headers.get("host") || ""];
  const forwarded = req.headers.get("x-forwarded-host")?.split(",", 1)[0]?.trim();
  if (forwarded) hosts.push(forwarded);
  return hosts.some((value) => !isPrivateHostname(hostname(value)));
}

type MarketingStatsRouteDependencies = {
  getToken: () => string;
  buildStats: (days: number) => Promise<object>;
};

export function createMarketingStatsHandler(
  dependencies: MarketingStatsRouteDependencies = {
    getToken: getMarketingStatsToken,
    buildStats: (days) => buildMarketingStats(prisma, { days }),
  },
) {
  return async function handleMarketingStats(req: NextRequest) {
    if (isPublicMarketingStatsRequest(req)) {
      return noStoreJson({ ok: false, error: "not_found" }, 404);
    }

    const limited = rejectRateLimited(req, apiLimiters.internalStats);
    if (limited) return limited;

    try {
      const expectedToken = dependencies.getToken();
      const receivedToken = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") || "";
      if (!expectedToken || !secureTokenMatch(receivedToken, expectedToken)) {
        return noStoreJson({ ok: false, error: "unauthorized" }, 401);
      }

      const parsed = QuerySchema.safeParse(Object.fromEntries(req.nextUrl.searchParams));
      if (!parsed.success) {
        return noStoreJson({ ok: false, error: "invalid_range" }, 400);
      }

      const stats = await dependencies.buildStats(parsed.data.days);
      return noStoreJson(stats);
    } catch (error) {
      console.error("internal marketing stats error", error);
      return noStoreJson({ ok: false, error: "stats_unavailable" }, 503);
    }
  };
}

export const GET = createMarketingStatsHandler();
