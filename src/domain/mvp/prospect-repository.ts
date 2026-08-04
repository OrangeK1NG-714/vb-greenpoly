import type { MvpProspectStage, ProspectScoringInput } from "@/domain/mvp/validation";

export type MvpProspect = ProspectScoringInput & {
  id: string;
  company: string;
  contactName: string | null;
  sourceChannel: string;
  stage: MvpProspectStage;
  score: number;
  scoreReasons: string[];
  targetPriceUsd: number | null;
  estimatedMonthlySets: number | null;
  nextAction: string | null;
  nextActionAt: Date | null;
  lastContactedAt: Date | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateMvpProspect = ProspectScoringInput & {
  company: string;
  contactName?: string | null;
  sourceChannel: string;
  stage?: MvpProspectStage;
  targetPriceUsd?: number | null;
  estimatedMonthlySets?: number | null;
  nextAction?: string | null;
  nextActionAt?: Date | null;
  lastContactedAt?: Date | null;
  notes?: string | null;
};

export type UpdateMvpProspect = Partial<
  Omit<MvpProspect, "id" | "score" | "scoreReasons" | "createdAt" | "updatedAt">
>;

export interface MvpProspectRepository {
  list(): Promise<MvpProspect[]>;
  findById(id: string): Promise<MvpProspect | null>;
  create(input: CreateMvpProspect & { score: number; scoreReasons: string[] }): Promise<MvpProspect>;
  update(id: string, input: UpdateMvpProspect & { score: number; scoreReasons: string[] }): Promise<MvpProspect>;
}
