import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { apiLimiters, rejectCrossSite, rejectRateLimited, requestBodyErrorResponse } from "@/lib/api-security";
import { prisma } from "@/lib/db";
import { readJsonBody } from "@/lib/request-security";
import { PatchQuoteSchema, quotePayloadToDatabase } from "@/lib/sales-api";
import { quoteRecordToData } from "@/lib/sales-records";
import { canTransitionQuoteStatus, validateQuoteDraft, type QuoteStatus } from "@/lib/sales-tools";

export const runtime = "nodejs";

const LOCKED_QUOTE_FIELDS = [
  "product", "grade", "quantityMt", "quantityUnit", "currency", "incoterm", "originPort", "destinationPort",
  "supplierCostCnyPerMt", "inlandAndPortCny", "documentsCny", "exchangeRateCnyPerUsd", "targetMarginPercent",
  "oceanFreightUsd", "insurancePercent", "paymentTerms", "packaging", "leadTime", "validUntil",
] as const;

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const crossSite = rejectCrossSite(req);
  if (crossSite) return crossSite;
  const limited = rejectRateLimited(req, apiLimiters.admin);
  if (limited) return limited;
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    if (!id || id.length > 64) {
      return NextResponse.json({ ok: false, error: "invalid_id" }, { status: 400 });
    }
    const body = await readJsonBody(req, 24 * 1024);
    const parsed = PatchQuoteSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: "invalid_payload" }, { status: 400 });
    }
    const existingRecord = await prisma.quoteDraft.findUnique({ where: { id } });
    if (!existingRecord) {
      return NextResponse.json({ ok: false, error: "quote_not_found" }, { status: 404 });
    }

    const existing = quoteRecordToData(existingRecord);
    const hasLockedFieldChange = LOCKED_QUOTE_FIELDS.some((field) => (
      parsed.data[field] !== undefined && parsed.data[field] !== existing[field]
    ));
    if ((existing.status === "SENT_MANUALLY" || existing.status === "ARCHIVED") && hasLockedFieldChange) {
      return NextResponse.json({ ok: false, error: "quote_locked" }, { status: 409 });
    }
    if (parsed.data.status === "SENT_MANUALLY" && hasLockedFieldChange) {
      return NextResponse.json({ ok: false, error: "review_required_before_sending" }, { status: 409 });
    }

    const { status: requestedStatus, ...fields } = parsed.data;
    let targetStatus = requestedStatus ?? existing.status;
    if (!requestedStatus && hasLockedFieldChange && existing.status === "READY_TO_REVIEW") {
      targetStatus = "DRAFT";
    }
    if (!canTransitionQuoteStatus(existing.status, targetStatus as QuoteStatus)) {
      return NextResponse.json({ ok: false, error: "invalid_status_transition" }, { status: 409 });
    }

    const merged = { ...existing, ...fields, status: targetStatus as QuoteStatus };
    const validation = validateQuoteDraft(merged);
    if (validation.invalidFields.length > 0) {
      return NextResponse.json({ ok: false, error: "invalid_quote_values", fields: validation.invalidFields }, { status: 400 });
    }
    if (targetStatus === "READY_TO_REVIEW" && !validation.canMarkReady) {
      return NextResponse.json({ ok: false, error: "quote_incomplete", fields: validation.missingFields }, { status: 409 });
    }

    const quote = await prisma.quoteDraft.update({
      where: { id },
      data: {
        ...quotePayloadToDatabase(fields),
        status: targetStatus,
        sentAt: targetStatus === "SENT_MANUALLY" && !existing.sentAt ? new Date() : undefined,
      },
    });
    return NextResponse.json({ ok: true, quote: quoteRecordToData(quote) });
  } catch (error) {
    const inputError = requestBodyErrorResponse(error);
    if (inputError) return inputError;
    return NextResponse.json({ ok: false, error: "quote_update_failed" }, { status: 500 });
  }
}
