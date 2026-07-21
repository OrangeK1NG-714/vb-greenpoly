import { NextRequest, NextResponse } from "next/server";
import { clearAdminCookie } from "@/lib/auth";
import { apiLimiters, rejectCrossSite, rejectRateLimited } from "@/lib/api-security";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const crossSite = rejectCrossSite(request);
  if (crossSite) return crossSite;
  const limited = rejectRateLimited(request, apiLimiters.admin);
  if (limited) return limited;
  await clearAdminCookie();
  return NextResponse.json({ ok: true });
}
