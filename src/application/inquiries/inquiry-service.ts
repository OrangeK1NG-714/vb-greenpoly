import type {
  InquiryCreateInput,
  InquiryListResult,
  InquiryListOrder,
  InquiryRecord,
  InquiryRepository,
  InquirySource,
} from "../../domain/inquiries/inquiry-repository";

/**
 * 询盘应用边界。页面和 Route Handler 只调用这里，不选择 Go 或 Prisma。
 * 业务扩展（通知、审计等）应在用例中组合，不能回流到 delivery。
 */
export class InquiryService {
  constructor(private readonly repository: InquiryRepository) {}

  get source(): InquirySource {
    return this.repository.source;
  }

  create(input: InquiryCreateInput): Promise<string> {
    return this.repository.create(input);
  }

  exists(id: string): Promise<boolean> {
    return this.repository.exists(id);
  }

  get(id: string): Promise<InquiryRecord | null> {
    return this.repository.get(id);
  }

  list(
    status?: string,
    limit = 100,
    orderBy: InquiryListOrder = "createdAt",
  ): Promise<InquiryListResult> {
    return this.repository.list(status, limit, orderBy);
  }
}
