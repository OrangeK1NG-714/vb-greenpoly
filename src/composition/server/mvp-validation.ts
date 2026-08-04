import { MvpProspectService } from "@/application/mvp/prospect-service";
import { PrismaMvpProspectRepository } from "@/adapters/mvp/prisma-mvp-prospect-repository";

const globalForMvp = globalThis as unknown as { mvpProspectService?: MvpProspectService };

export function getMvpProspectService() {
  if (!globalForMvp.mvpProspectService) {
    globalForMvp.mvpProspectService = new MvpProspectService(new PrismaMvpProspectRepository());
  }
  return globalForMvp.mvpProspectService;
}
