import { getInquiryService } from "@/composition/server/inquiries";

export async function salesInquiryExists(id: string): Promise<boolean> {
  return getInquiryService().exists(id);
}
