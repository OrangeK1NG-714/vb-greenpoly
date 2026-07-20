import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentAdmin } from "@/lib/auth";

export const runtime = "nodejs";

const PatchSchema = z.object({
  status: z.enum(["NEW", "CONTACTED", "QUOTED", "NEGOTIATING", "WON", "LOST"]).optional(),
  notes: z.string().max(4000).optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const parsed = PatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "invalid_payload" }, { status: 400 });
  }

  try {
    const inquiry = await prisma.inquiry.update({
      where: { id },
      data: parsed.data,
    });
    return NextResponse.json({ ok: true, inquiry });
  } catch {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }
}
