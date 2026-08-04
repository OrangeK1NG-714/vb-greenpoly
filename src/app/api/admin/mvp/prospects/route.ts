import { NextRequest, NextResponse } from "next/server";
import { getMvpProspectService } from "@/composition/server/mvp-validation";
import { getCurrentAdmin } from "@/lib/auth";
import { apiLimiters, rejectCrossSite, rejectRateLimited, requestBodyErrorResponse } from "@/lib/api-security";
import { CreateMvpProspectSchema, serializeMvpProspect } from "@/lib/mvp-api";
import { readJsonBody } from "@/lib/request-security";

export const runtime = "nodejs";

async function requireAdmin() {
  return await getCurrentAdmin()
    ? null
    : NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
}

export async function GET(req: NextRequest) {
  const limited = rejectRateLimited(req, apiLimiters.admin);
  if (limited) return limited;
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const prospects = await getMvpProspectService().list();
  return NextResponse.json({ ok: true, prospects: prospects.map(serializeMvpProspect) });
}

export async function POST(req: NextRequest) {
  const crossSite = rejectCrossSite(req);
  if (crossSite) return crossSite;
  const limited = rejectRateLimited(req, apiLimiters.admin);
  if (limited) return limited;
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const parsed = CreateMvpProspectSchema.safeParse(await readJsonBody(req, 16 * 1024));
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: "invalid_payload" }, { status: 400 });
    }
    const prospect = await getMvpProspectService().create(parsed.data);
    return NextResponse.json({ ok: true, prospect: serializeMvpProspect(prospect) }, { status: 201 });
  } catch (error) {
    const inputError = requestBodyErrorResponse(error);
    if (inputError) return inputError;
    return NextResponse.json({ ok: false, error: "prospect_create_failed" }, { status: 500 });
  }
}
