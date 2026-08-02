import { InquiryService } from "@/application/inquiries/inquiry-service";
import { GoInquiryRepository } from "@/adapters/inquiries/go-inquiry-repository";
import { PrismaInquiryRepository } from "@/adapters/inquiries/prisma-inquiry-repository";
import { goBackendEnabled } from "@/lib/go-backend";

let service: InquiryService | undefined;

/** 服务端唯一的询盘适配器选择点。 */
export function getInquiryService(): InquiryService {
  service ??= new InquiryService(
    goBackendEnabled
      ? new GoInquiryRepository()
      : new PrismaInquiryRepository(),
  );
  return service;
}
