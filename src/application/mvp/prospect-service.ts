import type {
  CreateMvpProspect,
  MvpProspectRepository,
  UpdateMvpProspect,
} from "@/domain/mvp/prospect-repository";
import { scoreProspect } from "@/domain/mvp/validation";

export class MvpProspectService {
  constructor(private readonly repository: MvpProspectRepository) {}

  list() {
    return this.repository.list();
  }

  async create(input: CreateMvpProspect) {
    const scoring = scoreProspect(input);
    return this.repository.create({ ...input, score: scoring.score, scoreReasons: scoring.reasons });
  }

  async update(id: string, patch: UpdateMvpProspect) {
    const current = await this.repository.findById(id);
    if (!current) throw new Error("prospect_not_found");
    const next = { ...current, ...patch };
    const scoring = scoreProspect(next);
    return this.repository.update(id, { ...patch, score: scoring.score, scoreReasons: scoring.reasons });
  }
}
