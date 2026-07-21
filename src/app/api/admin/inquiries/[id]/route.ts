import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentAdmin } from "@/lib/auth";
import { apiLimiters, rejectCrossSite, rejectRateLimited, requestBodyErrorResponse } from "@/lib/api-security";
import { readJsonBody } from "@/lib/request-security";

export const runtime = "nodejs";

const PatchSchema = z.object({
  status: z.enum(["NEW", "CONTACTED", "QUOTED", "NEGOTIATING", "WON", "LOST"]).optional(),
  notes: z.string().max(4000).optional(),
}).strict().refine((body) => body.status !== undefined || body.notes !== undefined);

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const crossSite = rejectCrossSite(req);
  if (crossSite) return crossSite;
  const limited = rejectRateLimited(req, apiLimiters.admin);
  if (limited) return limited;

  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    if (!id || id.length > 64) {
      return NextResponse.json({ ok: false, error: "invalid_id" }, { status: 400 });
    }
    const body = await readJsonBody(req, 8 * 1024);
    const parsed = PatchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: "invalid_payload" }, { status: 400 });
    }
    const inquiry = await prisma.inquiry.update({
      where: { id },
      data: parsed.data,
    });
    return NextResponse.json({ ok: true, inquiry });
  } catch (error) {
    const inputError = requestBodyErrorResponse(error);
    if (inputError) return inputError;
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }
}
