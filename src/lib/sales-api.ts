import { z } from "zod";

const id = z.string().trim().min(1).max(64);
const shortText = z.string().trim().max(200).optional();
const longText = z.string().trim().max(2000).optional();
const nullableFiniteNumber = z.number().finite().nullable().optional();
const nullableDate = z.string().trim().max(40).refine(
  (value) => Number.isFinite(new Date(value).getTime()),
  "invalid date",
).nullable().optional();

export const QUOTE_FIELD_SHAPE = {
  product: shortText,
  grade: shortText,
  quantityMt: nullableFiniteNumber,
  quantityUnit: z.string().trim().max(20).optional(),
  currency: z.string().trim().max(10).optional(),
  incoterm: z.string().trim().max(10).optional(),
  originPort: shortText,
  destinationPort: shortText,
  supplierCostCnyPerMt: nullableFiniteNumber,
  inlandAndPortCny: nullableFiniteNumber,
  documentsCny: nullableFiniteNumber,
  exchangeRateCnyPerUsd: nullableFiniteNumber,
  targetMarginPercent: nullableFiniteNumber,
  oceanFreightUsd: nullableFiniteNumber,
  insurancePercent: nullableFiniteNumber,
  paymentTerms: longText,
  packaging: longText,
  leadTime: z.string().trim().max(500).optional(),
  validUntil: nullableDate,
  followUpAt: nullableDate,
} as const;

export const CreateQuoteSchema = z.object({
  inquiryId: id,
  ...QUOTE_FIELD_SHAPE,
}).strict();

export const PatchQuoteSchema = z.object({
  ...QUOTE_FIELD_SHAPE,
  status: z.enum(["DRAFT", "READY_TO_REVIEW", "SENT_MANUALLY", "ARCHIVED"]).optional(),
}).strict().refine((body) => Object.keys(body).length > 0);

export type CreateQuotePayload = z.infer<typeof CreateQuoteSchema>;
export type PatchQuotePayload = z.infer<typeof PatchQuoteSchema>;

export const SAMPLE_FIELD_SHAPE = {
  product: shortText,
  grade: shortText,
  application: longText,
  appearance: longText,
  technicalRequirements: longText,
  quantity: nullableFiniteNumber,
  quantityUnit: z.string().trim().max(20).optional(),
  packaging: longText,
  acceptanceCriteria: longText,
  targetConfirmationDate: nullableDate,
} as const;

export const CreateSampleSchema = z.object({
  inquiryId: id,
  sourceVersionId: id.optional(),
  ...SAMPLE_FIELD_SHAPE,
}).strict();

export const PatchSampleSchema = z.object({
  ...SAMPLE_FIELD_SHAPE,
  status: z.enum([
    "NEEDS_INFORMATION",
    "READY_FOR_CUSTOMER_CONFIRMATION",
    "AWAITING_CONFIRMATION",
    "CUSTOMER_CONFIRMED",
    "HANDED_TO_FACTORY",
    "CANCELLED",
  ]).optional(),
}).strict().refine((body) => Object.keys(body).length > 0);

export type CreateSamplePayload = z.infer<typeof CreateSampleSchema>;
export type PatchSamplePayload = z.infer<typeof PatchSampleSchema>;

export function nullableDatabaseText(value: string | undefined): string | null | undefined {
  if (value === undefined) return undefined;
  return value.length > 0 ? value : null;
}

export function nullableDatabaseDate(value: string | null | undefined): Date | null | undefined {
  if (value === undefined) return undefined;
  return value ? new Date(value) : null;
}

export function quotePayloadToDatabase(payload: CreateQuotePayload | PatchQuotePayload) {
  return {
    product: nullableDatabaseText(payload.product),
    grade: nullableDatabaseText(payload.grade),
    quantityMt: payload.quantityMt,
    quantityUnit: nullableDatabaseText(payload.quantityUnit),
    currency: nullableDatabaseText(payload.currency),
    incoterm: nullableDatabaseText(payload.incoterm),
    originPort: nullableDatabaseText(payload.originPort),
    destinationPort: nullableDatabaseText(payload.destinationPort),
    supplierCostCnyPerMt: payload.supplierCostCnyPerMt,
    inlandAndPortCny: payload.inlandAndPortCny,
    documentsCny: payload.documentsCny,
    exchangeRateCnyPerUsd: payload.exchangeRateCnyPerUsd,
    targetMarginPercent: payload.targetMarginPercent,
    oceanFreightUsd: payload.oceanFreightUsd,
    insurancePercent: payload.insurancePercent,
    paymentTerms: nullableDatabaseText(payload.paymentTerms),
    packaging: nullableDatabaseText(payload.packaging),
    leadTime: nullableDatabaseText(payload.leadTime),
    validUntil: nullableDatabaseDate(payload.validUntil),
    followUpAt: nullableDatabaseDate(payload.followUpAt),
  };
}

export function samplePayloadToDatabase(payload: CreateSamplePayload | PatchSamplePayload) {
  return {
    product: nullableDatabaseText(payload.product),
    grade: nullableDatabaseText(payload.grade),
    application: nullableDatabaseText(payload.application),
    appearance: nullableDatabaseText(payload.appearance),
    technicalRequirements: nullableDatabaseText(payload.technicalRequirements),
    quantity: payload.quantity,
    quantityUnit: nullableDatabaseText(payload.quantityUnit),
    packaging: nullableDatabaseText(payload.packaging),
    acceptanceCriteria: nullableDatabaseText(payload.acceptanceCriteria),
    targetConfirmationDate: nullableDatabaseDate(payload.targetConfirmationDate),
  };
}
