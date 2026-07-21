import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { signAdminToken, setAdminCookie } from "@/lib/auth";
import { apiLimiters, rejectCrossSite, rejectRateLimited, requestBodyErrorResponse } from "@/lib/api-security";
import { getClientIp, readJsonBody } from "@/lib/request-security";

export const runtime = "nodejs";

const LoginSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(256),
  password: z.string().min(6).max(256),
}).strict();

const DUMMY_PASSWORD_HASH = "$2a$10$37jH2FxAWS2HDRj3qbLK0.GrZRJCLPHurKnm68.MmzWkAqtiiQSxG";

export async function POST(req: NextRequest) {
  const crossSite = rejectCrossSite(req);
  if (crossSite) return crossSite;
  const limited = rejectRateLimited(req, apiLimiters.login);
  if (limited) return limited;

  try {
    const body = await readJsonBody(req, 4 * 1024);
    const parsed = LoginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: "invalid_payload" }, { status: 400 });
    }

    const { email, password } = parsed.data;
    const user = await prisma.adminUser.findUnique({ where: { email } });
    const valid = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_PASSWORD_HASH);
    if (!user || !valid) {
      return NextResponse.json({ ok: false, error: "invalid_credentials" }, { status: 401 });
    }

    const token = await signAdminToken({ id: user.id, email: user.email, role: user.role });
    await setAdminCookie(token);
    apiLimiters.login.reset(getClientIp(req));

    return NextResponse.json({ ok: true });
  } catch (err) {
    const inputError = requestBodyErrorResponse(err);
    if (inputError) return inputError;
    console.error("login error", err);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
