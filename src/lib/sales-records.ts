import type { QuoteDraft, SampleConfirmation } from "@/generated/prisma/client";
import type { QuoteDraftData, QuoteStatus, SampleSnapshot, SampleStatus } from "@/lib/sales-tools";

export function quoteRecordToData(record: QuoteDraft): QuoteDraftData {
  return {
    id: record.id,
    inquiryId: record.inquiryId,
    status: record.status as QuoteStatus,
    product: record.product ?? "",
    grade: record.grade ?? "",
    quantityMt: record.quantityMt,
    quantityUnit: record.quantityUnit ?? "",
    currency: record.currency ?? "",
    incoterm: record.incoterm ?? "",
    originPort: record.originPort ?? "",
    destinationPort: record.destinationPort ?? "",
    supplierCostCnyPerMt: record.supplierCostCnyPerMt,
    inlandAndPortCny: record.inlandAndPortCny,
    documentsCny: record.documentsCny,
    exchangeRateCnyPerUsd: record.exchangeRateCnyPerUsd,
    targetMarginPercent: record.targetMarginPercent,
    oceanFreightUsd: record.oceanFreightUsd,
    insurancePercent: record.insurancePercent,
    paymentTerms: record.paymentTerms ?? "",
    packaging: record.packaging ?? "",
    leadTime: record.leadTime ?? "",
    validUntil: record.validUntil?.toISOString() ?? null,
    followUpAt: record.followUpAt?.toISOString() ?? null,
    sentAt: record.sentAt?.toISOString() ?? null,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

export function sampleRecordToData(record: SampleConfirmation): SampleSnapshot {
  return {
    id: record.id,
    inquiryId: record.inquiryId,
    version: record.version,
    status: record.status as SampleStatus,
    product: record.product ?? "",
    grade: record.grade ?? "",
    application: record.application ?? "",
    appearance: record.appearance ?? "",
    technicalRequirements: record.technicalRequirements ?? "",
    quantity: record.quantity,
    quantityUnit: record.quantityUnit ?? "",
    packaging: record.packaging ?? "",
    acceptanceCriteria: record.acceptanceCriteria ?? "",
    targetConfirmationDate: record.targetConfirmationDate?.toISOString() ?? null,
    customerConfirmedAt: record.customerConfirmedAt?.toISOString() ?? null,
    handedToFactoryAt: record.handedToFactoryAt?.toISOString() ?? null,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}
