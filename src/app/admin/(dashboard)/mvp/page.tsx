import MvpValidationWorkspace from "@/components/admin/MvpValidationWorkspace";
import { getMvpProspectService } from "@/composition/server/mvp-validation";
import { serializeMvpProspect } from "@/lib/mvp-api";

export const dynamic = "force-dynamic";

export default async function MvpValidationPage() {
  const prospects = await getMvpProspectService().list();
  return <MvpValidationWorkspace initialProspects={prospects.map(serializeMvpProspect)} />;
}
