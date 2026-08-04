import { NextRequest, NextResponse } from "next/server";
import { getMvpProspectService } from "@/composition/server/mvp-validation";
import { getCurrentAdmin } from "@/lib/auth";
import { apiLimiters, rejectCrossSite, rejectRateLimited, requestBodyErrorResponse } from "@/lib/api-security";
import { serializeMvpProspect, UpdateMvpProspectSchema } from "@/lib/mvp-api";
import { readJsonBody } from "@/lib/request-security";

export const runtime = "nodejs";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const crossSite = rejectCrossSite(req);
  if (crossSite) return crossSite;
  const limited = rejectRateLimited(req, apiLimiters.admin);
  if (limited) return limited;
  if (!await getCurrentAdmin()) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    if (!id || id.length > 64) {
      return NextResponse.json({ ok: false, error: "invalid_id" }, { status: 400 });
    }
    const parsed = UpdateMvpProspectSchema.safeParse(await readJsonBody(req, 16 * 1024));
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: "invalid_payload" }, { status: 400 });
    }
    const prospect = await getMvpProspectService().update(id, parsed.data);
    return NextResponse.json({ ok: true, prospect: serializeMvpProspect(prospect) });
  } catch (error) {
    const inputError = requestBodyErrorResponse(error);
    if (inputError) return inputError;
    const status = error instanceof Error && error.message === "prospect_not_found" ? 404 : 500;
    return NextResponse.json(
      { ok: false, error: status === 404 ? "prospect_not_found" : "prospect_update_failed" },
      { status }
    );
  }
}
