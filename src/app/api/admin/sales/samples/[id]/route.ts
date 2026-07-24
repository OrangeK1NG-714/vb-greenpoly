import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { apiLimiters, rejectCrossSite, rejectRateLimited, requestBodyErrorResponse } from "@/lib/api-security";
import { prisma } from "@/lib/db";
import { readJsonBody } from "@/lib/request-security";
import { PatchSampleSchema, samplePayloadToDatabase } from "@/lib/sales-api";
import { sampleRecordToData } from "@/lib/sales-records";
import {
  SAMPLE_CRITICAL_FIELDS,
  canTransitionSampleStatus,
  compareSampleVersions,
  sampleStatusForContents,
  validateSampleSnapshot,
  type SampleStatus,
} from "@/lib/sales-tools";

export const runtime = "nodejs";

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
    const parsed = PatchSampleSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: "invalid_payload" }, { status: 400 });
    }
    const existingRecord = await prisma.sampleConfirmation.findUnique({ where: { id } });
    if (!existingRecord) {
      return NextResponse.json({ ok: false, error: "sample_not_found" }, { status: 404 });
    }
    if (existingRecord.status === "CANCELLED") {
      return NextResponse.json({ ok: false, error: "sample_cancelled" }, { status: 409 });
    }

    const existing = sampleRecordToData(existingRecord);
    const { status: requestedStatus, ...fields } = parsed.data;
    const merged = { ...existing, ...fields };
    const comparison = compareSampleVersions(existing, merged);
    if (comparison.requiresNewVersion) {
      return NextResponse.json({
        ok: false,
        error: "new_version_required",
        fields: comparison.changedFields,
      }, { status: 409 });
    }

    const hasCriticalChange = SAMPLE_CRITICAL_FIELDS.some((field) => (
      fields[field] !== undefined && fields[field] !== existing[field]
    ));
    let targetStatus = requestedStatus ?? existing.status;
    if (!requestedStatus && (
      existing.status === "NEEDS_INFORMATION"
      || hasCriticalChange && (
        existing.status === "READY_FOR_CUSTOMER_CONFIRMATION"
        || existing.status === "AWAITING_CONFIRMATION"
      )
    )) {
      targetStatus = sampleStatusForContents({ ...merged, status: existing.status });
    }
    if (!canTransitionSampleStatus(existing.status, targetStatus as SampleStatus)) {
      return NextResponse.json({ ok: false, error: "invalid_status_transition" }, { status: 409 });
    }

    const candidate = { ...merged, status: targetStatus as SampleStatus };
    const validation = validateSampleSnapshot(candidate);
    if (validation.invalidFields.length > 0) {
      return NextResponse.json({ ok: false, error: "invalid_sample_values", fields: validation.invalidFields }, { status: 400 });
    }
    const requiresCompleteSnapshot = [
      "READY_FOR_CUSTOMER_CONFIRMATION",
      "AWAITING_CONFIRMATION",
      "CUSTOMER_CONFIRMED",
      "HANDED_TO_FACTORY",
    ].includes(targetStatus);
    if (requiresCompleteSnapshot && validation.missingFields.length > 0) {
      return NextResponse.json({ ok: false, error: "sample_incomplete", fields: validation.missingFields }, { status: 409 });
    }

    const sample = await prisma.sampleConfirmation.update({
      where: { id },
      data: {
        ...samplePayloadToDatabase(fields),
        status: targetStatus,
        customerConfirmedAt: targetStatus === "CUSTOMER_CONFIRMED" && !existing.customerConfirmedAt ? new Date() : undefined,
        handedToFactoryAt: targetStatus === "HANDED_TO_FACTORY" && !existing.handedToFactoryAt ? new Date() : undefined,
      },
    });
    return NextResponse.json({ ok: true, sample: sampleRecordToData(sample) });
  } catch (error) {
    const inputError = requestBodyErrorResponse(error);
    if (inputError) return inputError;
    return NextResponse.json({ ok: false, error: "sample_update_failed" }, { status: 500 });
  }
}
