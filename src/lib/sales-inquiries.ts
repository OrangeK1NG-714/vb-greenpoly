import { prisma } from "@/lib/db";
import { getInquiryGo, goBackendEnabled } from "@/lib/go-backend";

export async function salesInquiryExists(id: string): Promise<boolean> {
  if (goBackendEnabled) return Boolean(await getInquiryGo(id));
  return Boolean(await prisma.inquiry.findUnique({ where: { id }, select: { id: true } }));
}
