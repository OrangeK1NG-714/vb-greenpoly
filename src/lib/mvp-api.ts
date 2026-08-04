import { z } from "zod";
import { MVP_PROSPECT_STAGES } from "@/domain/mvp/validation";

const optionalText = (max: number) => z.string().trim().max(max).nullable().optional();
const optionalUrl = z.union([z.string().trim().url().max(1000), z.literal(""), z.null()]).optional()
  .transform((value) => value || null);
const optionalEmail = z.union([z.string().trim().email().max(256), z.literal(""), z.null()]).optional()
  .transform((value) => value || null);
const optionalNumber = z.number().finite().nonnegative().nullable().optional();
const optionalDate = z.union([z.string().datetime(), z.literal(""), z.null()]).optional()
  .transform((value) => value ? new Date(value) : null);

export const CreateMvpProspectSchema = z.object({
  company: z.string().trim().min(1).max(256),
  contactName: optionalText(128),
  contactEmail: optionalEmail,
  contactUrl: optionalUrl,
  country: optionalText(128),
  sourceChannel: z.string().trim().min(1).max(64),
  shopUrl: optionalUrl,
  sellsSandingDiscs: z.boolean(),
  sellsToolStorage: z.boolean(),
  evidence: optionalText(2000),
  targetPriceUsd: optionalNumber,
  estimatedMonthlySets: z.number().int().nonnegative().max(1_000_000).nullable().optional(),
  nextAction: optionalText(512),
  nextActionAt: optionalDate,
  lastContactedAt: optionalDate,
  notes: optionalText(4000),
}).strict();

export const UpdateMvpProspectSchema = CreateMvpProspectSchema.partial().extend({
  stage: z.enum(MVP_PROSPECT_STAGES).optional(),
}).strict().refine((value) => Object.keys(value).length > 0);

export function serializeMvpProspect<T extends {
  createdAt: Date;
  updatedAt: Date;
  nextActionAt: Date | null;
  lastContactedAt: Date | null;
}>(prospect: T) {
  return {
    ...prospect,
    createdAt: prospect.createdAt.toISOString(),
    updatedAt: prospect.updatedAt.toISOString(),
    nextActionAt: prospect.nextActionAt?.toISOString() ?? null,
    lastContactedAt: prospect.lastContactedAt?.toISOString() ?? null,
  };
}
