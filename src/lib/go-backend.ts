/**
 * go-backend client — the BFF forwarding layer.
 *
 * When GO_BACKEND_URL + GO_BACKEND_PROJECT_KEY are set, inquiries are owned
 * by the Go unified backend and this module forwards them there. When unset,
 * callers fall back to the local Prisma database (legacy/dev mode), so local
 * development keeps working without the Go service running.
 *
 * Auth model: the public site never talks to go-backend directly. Only these
 * server-side callers do — ingestion uses the per-project key, admin reads
 * use the backend admin token. Both stay in server env, never NEXT_PUBLIC_*.
 */

const BASE = process.env.GO_BACKEND_URL?.replace(/\/+$/, "") ?? "";
const PROJECT_KEY = process.env.GO_BACKEND_PROJECT_KEY ?? "";
const ADMIN_TOKEN = process.env.GO_BACKEND_ADMIN_TOKEN ?? "";

export const goBackendEnabled = Boolean(BASE && PROJECT_KEY && ADMIN_TOKEN);

const TIMEOUT_MS = 5000;

export type GoInquiry = {
  id: string;
  name: string;
  email: string;
  company: string;
  phone: string;
  country: string;
  port: string;
  product: string;
  volume: string;
  incoterms: string;
  message: string;
  status: string;
  notes: string;
  sessionId: string;
  ipAddress: string;
  userAgent: string;
  referrer: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  createdAt: Date;
  updatedAt: Date;
};

export type InquiryPayload = Omit<GoInquiry, "id" | "status" | "notes" | "createdAt" | "updatedAt">;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toInquiry(raw: any): GoInquiry {
  return { ...raw, createdAt: new Date(raw.createdAt), updatedAt: new Date(raw.updatedAt) };
}

async function goFetch<T>(path: string, init: RequestInit, admin: boolean): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    signal: AbortSignal.timeout(TIMEOUT_MS),
    headers: {
      "content-type": "application/json",
      ...(admin
        ? { authorization: `Bearer ${ADMIN_TOKEN}` }
        : { "x-project-key": PROJECT_KEY }),
    },
    cache: "no-store",
  });
  const body = await res.json().catch(() => null);
  if (!res.ok || !body?.ok) {
    throw new Error(`go-backend ${path} failed: ${res.status} ${body?.error ?? "unknown"}`);
  }
  return body as T;
}

export async function createInquiryGo(payload: InquiryPayload): Promise<string> {
  const body = await goFetch<{ ok: true; id: string }>("/api/inquiries", {
    method: "POST",
    body: JSON.stringify(payload),
  }, false);
  return body.id;
}

export async function listInquiriesGo(
  status?: string,
  limit = 100,
  orderBy: "createdAt" | "updatedAt" = "createdAt",
): Promise<{
  inquiries: GoInquiry[];
  counts: Record<string, number>;
}> {
  const query = new URLSearchParams({
    limit: String(limit),
    orderBy,
  });
  if (status) query.set("status", status);
  const body = await goFetch<{ inquiries: unknown[]; counts: Record<string, number> }>(
    `/api/admin/inquiries?${query}`, { method: "GET" }, true,
  );
  return { inquiries: body.inquiries.map(toInquiry), counts: body.counts ?? {} };
}

export async function getInquiryGo(id: string): Promise<GoInquiry | null> {
  try {
    const body = await goFetch<{ inquiry: unknown }>(
      `/api/admin/inquiries/${encodeURIComponent(id)}`, { method: "GET" }, true,
    );
    return toInquiry(body.inquiry);
  } catch (err) {
    if (err instanceof Error && err.message.includes("404")) return null;
    throw err;
  }
}

export async function updateInquiryGo(
  id: string,
  patch: { status?: string; notes?: string },
): Promise<GoInquiry> {
  const body = await goFetch<{ inquiry: unknown }>(
    `/api/admin/inquiries/${encodeURIComponent(id)}`,
    { method: "PATCH", body: JSON.stringify(patch) },
    true,
  );
  return toInquiry(body.inquiry);
}

export type GoInquiryStats = {
  total: number;
  new: number;
  last7d: number;
  byStatus: Record<string, number>;
};

export async function inquiryStatsGo(): Promise<GoInquiryStats> {
  return goFetch<GoInquiryStats>("/api/admin/inquiries/stats", { method: "GET" }, true);
}
