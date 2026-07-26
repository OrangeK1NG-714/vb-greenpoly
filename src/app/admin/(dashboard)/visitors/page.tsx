import Link from "next/link";
import { prisma } from "@/lib/db";
import PageHeader from "@/components/ui/PageHeader";
import { format, formatDistanceToNow } from "date-fns";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 50;

export default async function VisitorsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; country?: string; page?: string; only?: string }>;
}) {
  const { q, country, page, only } = await searchParams;
  const pageNum = Math.max(1, parseInt(page ?? "1", 10) || 1);
  const skip = (pageNum - 1) * PAGE_SIZE;

  type Where = {
    OR?: Array<Record<string, { contains: string }>>;
    country?: string;
    inquired?: boolean;
  };
  const where: Where = {};
  if (q) {
    where.OR = [
      { ipAddress: { contains: q } },
      { city: { contains: q } },
      { country: { contains: q } },
      { isp: { contains: q } },
      { id: { contains: q } },
    ];
  }
  if (country) where.country = country;
  if (only === "inquired") where.inquired = true;

  const [sessions, total, countries] = await Promise.all([
    prisma.session.findMany({
      where,
      orderBy: { lastSeen: "desc" },
      take: PAGE_SIZE,
      skip,
    }),
    prisma.session.count({ where }),
    prisma.session.groupBy({
      by: ["country"],
      where: { country: { not: null } },
      _count: { country: true },
      orderBy: { _count: { country: "desc" } },
      take: 12,
    }),
  ]);

  // Get last page viewed per session
  const sessionIds = sessions.map((s) => s.id);
  const lastEvents = sessionIds.length
    ? await prisma.event.findMany({
        where: { sessionId: { in: sessionIds }, eventName: "page_view" },
        orderBy: { createdAt: "desc" },
        distinct: ["sessionId"],
        select: { sessionId: true, page: true, createdAt: true },
      })
    : [];
  const lastPageBySession = new Map(lastEvents.map((e) => [e.sessionId, e]));

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Visitors"
        subtitle="IP, edge-provided location and recent activity. Location is approximate."
        meta={`${total} total · page ${pageNum}/${totalPages}`}
      />

      {/* Filters */}
      <form className="admin-card flex flex-wrap items-center gap-2 p-3">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Search IP, city, country, ISP, session id…"
          className="input-field flex-1 min-w-[200px] text-sm !py-2"
        />
        <select
          name="country"
          defaultValue={country ?? ""}
          className="input-field w-auto text-sm !px-2 !py-2"
        >
          <option value="">All countries</option>
          {countries.map((c) => (
            <option key={c.country} value={c.country ?? ""}>
              {c.country} ({c._count.country})
            </option>
          ))}
        </select>
        <select
          name="only"
          defaultValue={only ?? ""}
          className="input-field w-auto text-sm !px-2 !py-2"
        >
          <option value="">All visitors</option>
          <option value="inquired">Inquired only</option>
        </select>
        <button type="submit" className="bg-emerald-700 hover:bg-emerald-800 transition-colors text-white font-semibold px-4 py-2 rounded-lg text-sm">
          Search
        </button>
        {(q || country || only) && (
          <Link href="/admin/visitors" className="text-slate-500 text-sm hover:underline">
            Reset
          </Link>
        )}
      </form>

      {sessions.length === 0 ? (
        <div className="admin-card p-12 text-center">
          <div className="text-4xl mb-3">👥</div>
          <p className="text-slate-600">No visitor sessions match. Visit the public site to generate data.</p>
        </div>
      ) : (
        <div className="admin-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Last seen</th>
                  <th>Location</th>
                  <th>IP</th>
                  <th>ISP</th>
                  <th>Last page</th>
                  <th>Activity</th>
                  <th>Source</th>
                  <th></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sessions.map((s) => {
                  const last = lastPageBySession.get(s.id);
                  const flag = countryToFlag(s.countryCode);
                  return (
                    <tr key={s.id} className="transition-colors hover:bg-slate-50">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-slate-700">{formatDistanceToNow(s.lastSeen, { addSuffix: true })}</div>
                        <div className="text-xs text-slate-400">{format(s.lastSeen, "MMM d, HH:mm")}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-slate-800 flex items-center gap-1.5">
                          {flag && <span className="text-base">{flag}</span>}
                          <span className="font-semibold">{s.country ?? "—"}</span>
                        </div>
                        <div className="text-xs text-slate-500">
                          {[s.region, s.city].filter(Boolean).join(", ") || "—"}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">
                          {s.ipAddress ?? "—"}
                        </code>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600 max-w-[180px] truncate" title={s.isp ?? ""}>
                        {s.isp ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-700 max-w-[180px] truncate" title={last?.page ?? ""}>
                        {last?.page ?? "—"}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-slate-700">{s.pageViews} pv</span>
                        <span className="text-xs text-slate-400 ml-2">{Math.round(s.totalDwellMs / 1000)}s</span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500">
                        {s.utmSource ? (
                          <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded">
                            {s.utmSource}
                          </span>
                        ) : (
                          "direct"
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {s.inquired && (
                          <span className="bg-emerald-100 text-emerald-700 text-xs font-semibold px-2 py-0.5 rounded mr-2">
                            ✉ inquired
                          </span>
                        )}
                        <Link
                          href={`/admin/visitors/${s.id}`}
                          className="text-emerald-700 hover:underline text-xs font-semibold"
                        >
                          View →
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50 text-sm">
              <span className="text-slate-600">
                Showing {skip + 1}–{Math.min(skip + PAGE_SIZE, total)} of {total}
              </span>
              <div className="flex gap-2">
                {pageNum > 1 && (
                  <Link
                    href={buildHref({ q, country, only, page: pageNum - 1 })}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white transition-colors hover:bg-slate-100 text-slate-700"
                  >
                    ← Prev
                  </Link>
                )}
                {pageNum < totalPages && (
                  <Link
                    href={buildHref({ q, country, only, page: pageNum + 1 })}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white transition-colors hover:bg-slate-100 text-slate-700"
                  >
                    Next →
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function buildHref(params: { q?: string; country?: string; only?: string; page: number }) {
  const sp = new URLSearchParams();
  if (params.q) sp.set("q", params.q);
  if (params.country) sp.set("country", params.country);
  if (params.only) sp.set("only", params.only);
  if (params.page > 1) sp.set("page", String(params.page));
  const qs = sp.toString();
  return `/admin/visitors${qs ? `?${qs}` : ""}`;
}

function countryToFlag(code: string | null | undefined): string | null {
  if (!code || code.length !== 2) return null;
  const cc = code.toUpperCase();
  const A = 0x1f1e6;
  return String.fromCodePoint(A + (cc.charCodeAt(0) - 65), A + (cc.charCodeAt(1) - 65));
}
