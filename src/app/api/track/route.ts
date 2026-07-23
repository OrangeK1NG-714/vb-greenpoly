import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getVisitorInfo } from "@/lib/geo";
import { apiLimiters, rejectCrossSite, rejectRateLimited, requestBodyErrorResponse } from "@/lib/api-security";
import { readJsonBody } from "@/lib/request-security";

export const runtime = "nodejs";

const TrackPropertySchema = z.union([z.string().max(1024), z.number().finite(), z.boolean(), z.null()]);
const TrackSchema = z.object({
  eventName: z.enum([
    "page_view", "dwell", "page_exit", "scroll_depth", "cta_click",
    "whatsapp_click", "email_click", "outbound_click", "form_submit",
    "form_field_focus", "inquiry_intent", "product_card_impression",
  ]),
  page: z.string().min(1).max(512).startsWith("/"),
  sessionId: z.string().regex(/^[A-Za-z0-9_-]{8,64}$/),
  properties: z.record(TrackPropertySchema).refine(
    (properties) => Object.keys(properties).length <= 16 && Object.keys(properties).every((key) => key.length <= 64)
  ).optional(),
  referrer: z.string().max(1024).optional(),
  utmSource: z.string().max(128).optional(),
  utmMedium: z.string().max(128).optional(),
  utmCampaign: z.string().max(128).optional(),
  locale: z.enum(["en", "vi", "id", "th", "ms", "zh"]).optional(),
  sessionStartedAt: z.number().int().min(0).max(8_640_000_000_000).optional(),
  eventSequence: z.number().int().min(1).max(10_000_000).optional(),
}).strict();

export async function POST(req: NextRequest) {
  const crossSite = rejectCrossSite(req);
  if (crossSite) return crossSite;
  const limited = rejectRateLimited(req, apiLimiters.track);
  if (limited) return limited;

  try {
    const body = await readJsonBody(req, 8 * 1024);
    const parsed = TrackSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: "invalid_payload" }, { status: 400 });
    }

    const data = parsed.data;
    const visitor = getVisitorInfo(req.headers);

    await prisma.event.create({
      data: {
        eventName: data.eventName,
        page: data.page,
        sessionId: data.sessionId,
        properties: data.properties || data.eventSequence
          ? JSON.stringify({ ...data.properties, _eventSequence: data.eventSequence })
          : null,
        referrer: data.referrer ?? visitor.referrer ?? null,
        utmSource: data.utmSource ?? null,
        utmMedium: data.utmMedium ?? null,
        utmCampaign: data.utmCampaign ?? null,
        locale: data.locale ?? null,
        country: visitor.country,
        city: visitor.city,
        userAgent: visitor.userAgent,
        ipAddress: visitor.ip,
      },
    });

    const sessionStartedAt = data.sessionStartedAt
      ? new Date(data.sessionStartedAt)
      : new Date();
    const dwellMs = data.eventName === "dwell" ? Number(data.properties?.dwellMs) : 0;
    await prisma.session.upsert({
      where: { id: data.sessionId },
      create: {
        id: data.sessionId,
        firstSeen: sessionStartedAt,
        ipAddress: visitor.ip,
        country: visitor.country,
        countryCode: visitor.countryCode,
        region: visitor.region,
        city: visitor.city,
        latitude: visitor.latitude,
        longitude: visitor.longitude,
        timezone: visitor.timezone,
        userAgent: visitor.userAgent,
        referrer: data.referrer ?? visitor.referrer ?? null,
        utmSource: data.utmSource ?? null,
        utmMedium: data.utmMedium ?? null,
        utmCampaign: data.utmCampaign ?? null,
        locale: data.locale ?? null,
        pageViews: data.eventName === "page_view" ? 1 : 0,
        totalDwellMs: Number.isFinite(dwellMs) && dwellMs > 0 && dwellMs < 30 * 60 * 1000 ? dwellMs : 0,
      },
      update: {
        lastSeen: new Date(),
        pageViews: data.eventName === "page_view" ? { increment: 1 } : undefined,
        totalDwellMs: Number.isFinite(dwellMs) && dwellMs > 0 && dwellMs < 30 * 60 * 1000
          ? Math.floor(dwellMs)
          : undefined,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    const inputError = requestBodyErrorResponse(err);
    if (inputError) return inputError;
    console.error("track error", err);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
