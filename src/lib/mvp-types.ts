import type { MvpProspectStage } from "@/domain/mvp/validation";

export type SerializedMvpProspect = {
  id: string;
  company: string;
  contactName: string | null;
  contactEmail?: string | null;
  contactUrl?: string | null;
  country?: string | null;
  sourceChannel: string;
  shopUrl?: string | null;
  sellsSandingDiscs: boolean;
  sellsToolStorage: boolean;
  evidence?: string | null;
  stage: MvpProspectStage;
  score: number;
  scoreReasons: string[];
  targetPriceUsd: number | null;
  estimatedMonthlySets: number | null;
  nextAction: string | null;
  nextActionAt: string | null;
  lastContactedAt: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};
