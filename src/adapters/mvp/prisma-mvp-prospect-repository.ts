import type {
  CreateMvpProspect,
  MvpProspect,
  MvpProspectRepository,
  UpdateMvpProspect,
} from "@/domain/mvp/prospect-repository";
import type { MvpProspect as PrismaMvpProspect } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";

function parseScoreReasons(value: string | null) {
  if (!value) return [];
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) && parsed.every((item) => typeof item === "string") ? parsed : [];
  } catch {
    return [];
  }
}

function toDomain(record: PrismaMvpProspect): MvpProspect {
  return {
    ...record,
    stage: record.stage as MvpProspect["stage"],
    scoreReasons: parseScoreReasons(record.scoreReasons),
  };
}

export class PrismaMvpProspectRepository implements MvpProspectRepository {
  async list() {
    const records = await prisma.mvpProspect.findMany({
      orderBy: [{ score: "desc" }, { updatedAt: "desc" }],
      take: 500,
    });
    return records.map(toDomain);
  }

  async findById(id: string) {
    const record = await prisma.mvpProspect.findUnique({ where: { id } });
    return record ? toDomain(record) : null;
  }

  async create(input: CreateMvpProspect & { score: number; scoreReasons: string[] }) {
    const record = await prisma.mvpProspect.create({
      data: {
        ...input,
        stage: input.stage ?? "RESEARCH",
        scoreReasons: JSON.stringify(input.scoreReasons),
      },
    });
    return toDomain(record);
  }

  async update(id: string, input: UpdateMvpProspect & { score: number; scoreReasons: string[] }) {
    const record = await prisma.mvpProspect.update({
      where: { id },
      data: {
        ...input,
        scoreReasons: JSON.stringify(input.scoreReasons),
      },
    });
    return toDomain(record);
  }
}
