import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getVisitorInfo } from "@/lib/geo";
import { lookupIp } from "@/lib/ip-geo";

export const runtime = "nodejs";

const TrackSchema = z.object({
  eventName: z.string().min(1).max(64),
  page: z.string().min(1).max(512),
  sessionId: z.string().min(1).max(64),
  properties: z.record(z.unknown()).optional(),
  referrer: z.string().max(1024).optional(),
  utmSource: z.string().max(128).optional(),
  utmMedium: z.string().max(128).optional(),
  utmCampaign: z.string().max(128).optional(),
  locale: z.string().max(8).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const raw = await req.text();
    const body = JSON.parse(raw);
    const parsed = TrackSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: "invalid_payload" }, { status: 400 });
    }

    const data = parsed.data;
    const visitor = await getVisitorInfo();

    // Resolve IP -> location. Falls back to header values if available;
    // hits ip-api.com when the IP is public and headers don't tell us.
    const geo = await lookupIp(visitor.ip);
    const country = geo.country ?? visitor.country ?? null;
    const city = geo.city ?? visitor.city ?? null;

    await prisma.event.create({
      data: {
        eventName: data.eventName,
        page: data.page,
        sessionId: data.sessionId,
        properties: data.properties ? JSON.stringify(data.properties) : null,
        referrer: data.referrer ?? visitor.referrer ?? null,
        utmSource: data.utmSource ?? null,
        utmMedium: data.utmMedium ?? null,
        utmCampaign: data.utmCampaign ?? null,
        locale: data.locale ?? null,
        country,
        city,
        userAgent: visitor.userAgent,
        ipAddress: visitor.ip,
      },
    });

    // Upsert session
    const existing = await prisma.session.findUnique({ where: { id: data.sessionId } });
    if (!existing) {
      await prisma.session.create({
        data: {
          id: data.sessionId,
          ipAddress: visitor.ip,
          country,
          countryCode: geo.countryCode,
          region: geo.region,
          city,
          latitude: geo.latitude,
          longitude: geo.longitude,
          isp: geo.isp,
          timezone: geo.timezone,
          userAgent: visitor.userAgent,
          referrer: data.referrer ?? visitor.referrer ?? null,
          utmSource: data.utmSource ?? null,
          utmMedium: data.utmMedium ?? null,
          utmCampaign: data.utmCampaign ?? null,
          locale: data.locale ?? null,
          pageViews: data.eventName === "page_view" ? 1 : 0,
        },
      });
    } else {
      const updateData: Record<string, unknown> = { lastSeen: new Date() };
      if (data.eventName === "page_view") {
        updateData.pageViews = existing.pageViews + 1;
      }
      if (data.eventName === "dwell" && data.properties?.dwellMs) {
        const ms = Number(data.properties.dwellMs);
        if (Number.isFinite(ms) && ms > 0 && ms < 30 * 60 * 1000) {
          updateData.totalDwellMs = Math.max(existing.totalDwellMs, ms);
        }
      }
      // Backfill location/IP on existing sessions if we now know more
      if (!existing.ipAddress && visitor.ip) updateData.ipAddress = visitor.ip;
      if (!existing.country && country) updateData.country = country;
      if (!existing.countryCode && geo.countryCode) updateData.countryCode = geo.countryCode;
      if (!existing.region && geo.region) updateData.region = geo.region;
      if (!existing.city && city) updateData.city = city;
      if (existing.latitude == null && geo.latitude != null) updateData.latitude = geo.latitude;
      if (existing.longitude == null && geo.longitude != null) updateData.longitude = geo.longitude;
      if (!existing.isp && geo.isp) updateData.isp = geo.isp;
      if (!existing.timezone && geo.timezone) updateData.timezone = geo.timezone;

      await prisma.session.update({ where: { id: data.sessionId }, data: updateData });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("track error", err);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
