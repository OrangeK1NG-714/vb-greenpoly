// Minimal admin auth: JWT in HTTP-only cookie. Verified at admin layout level.
// For production, rotate AUTH_SECRET and use HTTPS.

import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET ?? "dev-secret-change-me-in-production"
);
const COOKIE_NAME = "gp_admin";
const TOKEN_TTL = 60 * 60 * 24 * 7; // 7 days

export type AdminToken = {
  id: string;
  email: string;
  role: string;
};

export async function signAdminToken(payload: AdminToken): Promise<string> {
  return new SignJWT(payload as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${TOKEN_TTL}s`)
    .sign(SECRET);
}

export async function verifyAdminToken(token: string): Promise<AdminToken | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    if (!payload.id || !payload.email) return null;
    return {
      id: String(payload.id),
      email: String(payload.email),
      role: String(payload.role ?? "ADMIN"),
    };
  } catch {
    return null;
  }
}

export async function getCurrentAdmin(): Promise<AdminToken | null> {
  const c = await cookies();
  const token = c.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyAdminToken(token);
}

export async function setAdminCookie(token: string) {
  const c = await cookies();
  c.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: TOKEN_TTL,
  });
}

export async function clearAdminCookie() {
  const c = await cookies();
  c.delete(COOKIE_NAME);
}

export const ADMIN_COOKIE_NAME = COOKIE_NAME;
