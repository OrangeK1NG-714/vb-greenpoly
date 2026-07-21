import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getVisitorInfo } from "@/lib/geo";
import { apiLimiters, rejectCrossSite, rejectRateLimited, requestBodyErrorResponse } from "@/lib/api-security";
import { readJsonBody } from "@/lib/request-security";

export const runtime = "nodejs";

const InquirySchema = z.object({
  name: z.string().min(1).max(128),
  email: z.string().email().max(256),
  company: z.string().max(256).optional(),
  phone: z.string().max(64).optional(),
  country: z.string().max(128).optional(),
  port: z.string().max(128).optional(),
  product: z.string().max(256).optional(),
  grade: z.string().max(64).optional(),
  volume: z.string().max(128).optional(),
  incoterms: z.string().max(64).optional(),
  message: z.string().max(4000).optional(),
  sessionId: z.string().max(64).optional(),
  utmSource: z.string().max(128).optional(),
  utmMedium: z.string().max(128).optional(),
  utmCampaign: z.string().max(128).optional(),
  website: z.string().max(256).optional(),
}).strict();

export async function POST(req: NextRequest) {
  const crossSite = rejectCrossSite(req);
  if (crossSite) return crossSite;
  const limited = rejectRateLimited(req, apiLimiters.inquiry);
  if (limited) return limited;

  try {
    const body = await readJsonBody(req, 16 * 1024);
    const parsed = InquirySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: "invalid_payload" }, { status: 400 });
    }

    const { grade, message, website, ...rest } = parsed.data;
    if (website) return NextResponse.json({ ok: true });
    const visitor = getVisitorInfo(req.headers);

    // Stash grade code in message tail so we don't need a schema change.
    const finalMessage = grade
      ? `${message ?? ""}\n\n[Grade requested] ${grade}`.trim()
      : message;

    const inquiry = await prisma.inquiry.create({
      data: {
        ...rest,
        message: finalMessage,
        ipAddress: visitor.ip,
        userAgent: visitor.userAgent,
        referrer: visitor.referrer,
      },
    });

    // Mark session as inquired
    if (rest.sessionId) {
      await prisma.session.updateMany({
        where: { id: rest.sessionId },
        data: { inquired: true },
      });
    }

    // TODO: send email notification via Resend / SES / etc.

    return NextResponse.json({ ok: true, id: inquiry.id });
  } catch (err) {
    const inputError = requestBodyErrorResponse(err);
    if (inputError) return inputError;
    console.error("inquiry error", err);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
