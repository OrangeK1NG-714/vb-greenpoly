export type InquirySource = "go-backend" | "local";

export type InquiryCreateInput = {
  name: string;
  email: string;
  company?: string | null;
  phone?: string | null;
  country?: string | null;
  port?: string | null;
  product?: string | null;
  volume?: string | null;
  incoterms?: string | null;
  message?: string | null;
  sessionId?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  referrer?: string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
};

export type InquiryRecord = {
  id: string;
  name: string;
  email: string;
  company: string | null;
  phone: string | null;
  country: string | null;
  port: string | null;
  product: string | null;
  volume: string | null;
  incoterms: string | null;
  message: string | null;
  status: string;
  notes: string | null;
  sessionId: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  referrer: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type InquiryListResult = {
  inquiries: InquiryRecord[];
  counts: Record<string, number>;
};

export type InquiryListOrder = "createdAt" | "updatedAt";

export interface InquiryRepository {
  readonly source: InquirySource;
  create(input: InquiryCreateInput): Promise<string>;
  exists(id: string): Promise<boolean>;
  get(id: string): Promise<InquiryRecord | null>;
  list(
    status?: string,
    limit?: number,
    orderBy?: InquiryListOrder,
  ): Promise<InquiryListResult>;
}
