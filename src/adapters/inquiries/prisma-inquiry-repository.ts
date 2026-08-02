import { prisma } from "@/lib/db";
import type {
  InquiryCreateInput,
  InquiryListResult,
  InquiryRecord,
  InquiryRepository,
} from "@/domain/inquiries/inquiry-repository";

const STATUSES = ["NEW", "CONTACTED", "QUOTED", "NEGOTIATING", "WON", "LOST"] as const;

function validStatus(status?: string): string | undefined {
  return status && STATUSES.includes(status as (typeof STATUSES)[number])
    ? status
    : undefined;
}

export class PrismaInquiryRepository implements InquiryRepository {
  readonly source = "local" as const;

  async create(input: InquiryCreateInput): Promise<string> {
    const inquiry = await prisma.inquiry.create({ data: input });
    return inquiry.id;
  }

  async exists(id: string): Promise<boolean> {
    return Boolean(
      await prisma.inquiry.findUnique({
        where: { id },
        select: { id: true },
      }),
    );
  }

  get(id: string): Promise<InquiryRecord | null> {
    return prisma.inquiry.findUnique({ where: { id } });
  }

  async list(
    status?: string,
    limit = 100,
    orderBy: "createdAt" | "updatedAt" = "createdAt",
  ): Promise<InquiryListResult> {
    const normalizedStatus = validStatus(status);
    const where = normalizedStatus ? { status: normalizedStatus } : {};
    const [inquiries, counts] = await Promise.all([
      prisma.inquiry.findMany({
        where,
        orderBy: { [orderBy]: "desc" },
        take: limit,
      }),
      prisma.inquiry.groupBy({
        by: ["status"],
        _count: { status: true },
      }),
    ]);
    const totalByStatus: Record<string, number> = {};
    for (const count of counts) {
      totalByStatus[count.status] = count._count.status;
    }
    return { inquiries, counts: totalByStatus };
  }
}
