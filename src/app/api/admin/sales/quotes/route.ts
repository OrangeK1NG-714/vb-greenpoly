import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { apiLimiters, rejectCrossSite, rejectRateLimited, requestBodyErrorResponse } from "@/lib/api-security";
import { prisma } from "@/lib/db";
import { readJsonBody } from "@/lib/request-security";
import { CreateQuoteSchema, quotePayloadToDatabase } from "@/lib/sales-api";
import { salesInquiryExists } from "@/lib/sales-inquiries";
import { quoteRecordToData } from "@/lib/sales-records";

export const runtime = "nodejs";

async function requireAdmin() {
  const admin = await getCurrentAdmin();
  return admin ? null : NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
}

export async function GET(req: NextRequest) {
  const limited = rejectRateLimited(req, apiLimiters.admin);
  if (limited) return limited;
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const inquiryId = req.nextUrl.searchParams.get("inquiryId")?.trim();
  if (inquiryId && inquiryId.length > 64) {
    return NextResponse.json({ ok: false, error: "invalid_inquiry_id" }, { status: 400 });
  }
  const quotes = await prisma.quoteDraft.findMany({
    where: inquiryId ? { inquiryId } : undefined,
    orderBy: { updatedAt: "desc" },
    take: 500,
  });
  return NextResponse.json({ ok: true, quotes: quotes.map(quoteRecordToData) });
}

export async function POST(req: NextRequest) {
  const crossSite = rejectCrossSite(req);
  if (crossSite) return crossSite;
  const limited = rejectRateLimited(req, apiLimiters.admin);
  if (limited) return limited;
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const body = await readJsonBody(req, 24 * 1024);
    const parsed = CreateQuoteSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: "invalid_payload" }, { status: 400 });
    }
    if (!await salesInquiryExists(parsed.data.inquiryId)) {
      return NextResponse.json({ ok: false, error: "inquiry_not_found" }, { status: 404 });
    }
    const quote = await prisma.quoteDraft.create({
      data: {
        inquiryId: parsed.data.inquiryId,
        ...quotePayloadToDatabase(parsed.data),
      },
    });
    return NextResponse.json({ ok: true, quote: quoteRecordToData(quote) }, { status: 201 });
  } catch (error) {
    const inputError = requestBodyErrorResponse(error);
    if (inputError) return inputError;
    return NextResponse.json({ ok: false, error: "quote_create_failed" }, { status: 500 });
  }
}
