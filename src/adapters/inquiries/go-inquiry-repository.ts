import {
  createInquiryGo,
  getInquiryGo,
  listInquiriesGo,
} from "@/lib/go-backend";
import type {
  InquiryCreateInput,
  InquiryListResult,
  InquiryRecord,
  InquiryRepository,
} from "@/domain/inquiries/inquiry-repository";

function normalizeOptional(value: string | null | undefined): string {
  return value ?? "";
}

function normalizeRecord(record: Awaited<ReturnType<typeof getInquiryGo>>): InquiryRecord | null {
  if (!record) return null;
  return {
    ...record,
    company: record.company || null,
    phone: record.phone || null,
    country: record.country || null,
    port: record.port || null,
    product: record.product || null,
    volume: record.volume || null,
    incoterms: record.incoterms || null,
    message: record.message || null,
    notes: record.notes || null,
    sessionId: record.sessionId || null,
    ipAddress: record.ipAddress || null,
    userAgent: record.userAgent || null,
    referrer: record.referrer || null,
    utmSource: record.utmSource || null,
    utmMedium: record.utmMedium || null,
    utmCampaign: record.utmCampaign || null,
  };
}

export class GoInquiryRepository implements InquiryRepository {
  readonly source = "go-backend" as const;

  create(input: InquiryCreateInput): Promise<string> {
    return createInquiryGo({
      name: input.name,
      email: input.email,
      company: normalizeOptional(input.company),
      phone: normalizeOptional(input.phone),
      country: normalizeOptional(input.country),
      port: normalizeOptional(input.port),
      product: normalizeOptional(input.product),
      volume: normalizeOptional(input.volume),
      incoterms: normalizeOptional(input.incoterms),
      message: normalizeOptional(input.message),
      sessionId: normalizeOptional(input.sessionId),
      ipAddress: normalizeOptional(input.ipAddress),
      userAgent: normalizeOptional(input.userAgent),
      referrer: normalizeOptional(input.referrer),
      utmSource: normalizeOptional(input.utmSource),
      utmMedium: normalizeOptional(input.utmMedium),
      utmCampaign: normalizeOptional(input.utmCampaign),
    });
  }

  async exists(id: string): Promise<boolean> {
    return Boolean(await getInquiryGo(id));
  }

  async get(id: string): Promise<InquiryRecord | null> {
    return normalizeRecord(await getInquiryGo(id));
  }

  async list(
    status?: string,
    limit = 100,
    orderBy: "createdAt" | "updatedAt" = "createdAt",
  ): Promise<InquiryListResult> {
    const result = await listInquiriesGo(status, limit, orderBy);
    return {
      inquiries: result.inquiries
        .map((inquiry) => normalizeRecord(inquiry))
        .filter((inquiry): inquiry is InquiryRecord => inquiry !== null),
      counts: result.counts,
    };
  }
}
