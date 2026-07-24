import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { apiLimiters, rejectCrossSite, rejectRateLimited, requestBodyErrorResponse } from "@/lib/api-security";
import { prisma } from "@/lib/db";
import { readJsonBody } from "@/lib/request-security";
import { CreateSampleSchema, samplePayloadToDatabase } from "@/lib/sales-api";
import { salesInquiryExists } from "@/lib/sales-inquiries";
import { sampleRecordToData } from "@/lib/sales-records";
import { sampleStatusForContents, type SampleSnapshot } from "@/lib/sales-tools";

export const runtime = "nodejs";

function emptySample(inquiryId: string): SampleSnapshot {
  return {
    inquiryId,
    version: 1,
    status: "NEEDS_INFORMATION",
    product: "",
    grade: "",
    application: "",
    appearance: "",
    technicalRequirements: "",
    quantity: null,
    quantityUnit: "",
    packaging: "",
    acceptanceCriteria: "",
    targetConfirmationDate: null,
    customerConfirmedAt: null,
    handedToFactoryAt: null,
  };
}

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
  const samples = await prisma.sampleConfirmation.findMany({
    where: inquiryId ? { inquiryId } : undefined,
    orderBy: [{ inquiryId: "asc" }, { version: "desc" }],
    take: 500,
  });
  return NextResponse.json({ ok: true, samples: samples.map(sampleRecordToData) });
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
    const parsed = CreateSampleSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: "invalid_payload" }, { status: 400 });
    }
    if (!await salesInquiryExists(parsed.data.inquiryId)) {
      return NextResponse.json({ ok: false, error: "inquiry_not_found" }, { status: 404 });
    }

    const latest = await prisma.sampleConfirmation.findFirst({
      where: { inquiryId: parsed.data.inquiryId },
      orderBy: { version: "desc" },
    });
    if (latest && !parsed.data.sourceVersionId) {
      return NextResponse.json({ ok: false, error: "source_version_required" }, { status: 409 });
    }

    const source = parsed.data.sourceVersionId
      ? await prisma.sampleConfirmation.findUnique({ where: { id: parsed.data.sourceVersionId } })
      : null;
    if (parsed.data.sourceVersionId && (!source || source.inquiryId !== parsed.data.inquiryId)) {
      return NextResponse.json({ ok: false, error: "source_version_not_found" }, { status: 404 });
    }
    if (source && latest && source.id !== latest.id) {
      return NextResponse.json({ ok: false, error: "stale_source_version" }, { status: 409 });
    }
    if (source?.status === "CANCELLED") {
      return NextResponse.json({ ok: false, error: "source_version_cancelled" }, { status: 409 });
    }

    const base = source ? sampleRecordToData(source) : emptySample(parsed.data.inquiryId);
    const { inquiryId } = parsed.data;
    const nextVersion = (latest?.version ?? 0) + 1;
    const merged: SampleSnapshot = {
      ...base,
      inquiryId,
      version: nextVersion,
      status: "NEEDS_INFORMATION",
      product: parsed.data.product ?? base.product,
      grade: parsed.data.grade ?? base.grade,
      application: parsed.data.application ?? base.application,
      appearance: parsed.data.appearance ?? base.appearance,
      technicalRequirements: parsed.data.technicalRequirements ?? base.technicalRequirements,
      quantity: parsed.data.quantity === undefined ? base.quantity : parsed.data.quantity,
      quantityUnit: parsed.data.quantityUnit ?? base.quantityUnit,
      packaging: parsed.data.packaging ?? base.packaging,
      acceptanceCriteria: parsed.data.acceptanceCriteria ?? base.acceptanceCriteria,
      targetConfirmationDate: parsed.data.targetConfirmationDate === undefined ? base.targetConfirmationDate : parsed.data.targetConfirmationDate,
      customerConfirmedAt: null,
      handedToFactoryAt: null,
    };
    const status = sampleStatusForContents(merged);
    const sample = await prisma.sampleConfirmation.create({
      data: {
        inquiryId,
        previousVersionId: source?.id,
        version: nextVersion,
        status,
        ...samplePayloadToDatabase(merged),
      },
    });
    return NextResponse.json({ ok: true, sample: sampleRecordToData(sample) }, { status: 201 });
  } catch (error) {
    const inputError = requestBodyErrorResponse(error);
    if (inputError) return inputError;
    return NextResponse.json({ ok: false, error: "sample_create_failed" }, { status: 500 });
  }
}
