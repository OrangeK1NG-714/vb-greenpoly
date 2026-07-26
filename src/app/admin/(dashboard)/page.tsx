import Link from "next/link";
import { prisma } from "@/lib/db";
import { goBackendEnabled, inquiryStatsGo } from "@/lib/go-backend";
import { subDays, startOfDay } from "date-fns";
import Panel from "@/components/ui/Panel";
import PageHeader from "@/components/ui/PageHeader";
import { STATUS_BADGE, statusClass } from "@/components/ui/status";

export const dynamic = "force-dynamic";

type StatusBreakdown = { status: string; _count: { status: number } }[];

async function getInquiryStats(): Promise<{
  totalInquiries: number;
  newInquiries: number;
  last7Inquiries: number;
  statusBreakdown: StatusBreakdown;
}> {
  if (goBackendEnabled) {
    const stats = await inquiryStatsGo();
    return {
      totalInquiries: stats.total,
      newInquiries: stats.new,
      last7Inquiries: stats.last7d,
      statusBreakdown: Object.entries(stats.byStatus ?? {}).map(([status, count]) => ({
        status,
        _count: { status: count },
      })),
    };
  }
  const last7Start = startOfDay(subDays(new Date(), 7));
  const [totalInquiries, newInquiries, last7Inquiries, statusBreakdown] = await Promise.all([
    prisma.inquiry.count(),
    prisma.inquiry.count({ where: { status: "NEW" } }),
    prisma.inquiry.count({ where: { createdAt: { gte: last7Start } } }),
    prisma.inquiry.groupBy({ by: ["status"], _count: { status: true } }),
  ]);
  return { totalInquiries, newInquiries, last7Inquiries, statusBreakdown };
}

async function getStats() {
  const now = new Date();
  const today = startOfDay(now);
  const last7Start = startOfDay(subDays(now, 7));
  const last30Start = startOfDay(subDays(now, 30));

  const [
    inquiryStats,
    last7Sessions,
    last7PageViews,
    last7Conversions,
    topPages,
    topCountries,
  ] = await Promise.all([
    getInquiryStats(),
    prisma.session.count({ where: { firstSeen: { gte: last7Start } } }),
    prisma.event.count({ where: { eventName: "page_view", createdAt: { gte: last7Start } } }),
    prisma.session.count({ where: { firstSeen: { gte: last7Start }, inquired: true } }),
    prisma.event.groupBy({
      by: ["page"],
      where: { eventName: "page_view", createdAt: { gte: last7Start } },
      _count: { page: true },
      orderBy: { _count: { page: "desc" } },
      take: 5,
    }),
    prisma.session.groupBy({
      by: ["country"],
      where: { firstSeen: { gte: last30Start }, country: { not: null } },
      _count: { country: true },
      orderBy: { _count: { country: "desc" } },
      take: 5,
    }),
  ]);

  const { totalInquiries, newInquiries, last7Inquiries, statusBreakdown } = inquiryStats;
  const conversionRate = last7Sessions > 0 ? ((last7Conversions / last7Sessions) * 100).toFixed(1) : "0";

  return {
    totalInquiries,
    newInquiries,
    last7Inquiries,
    last7Sessions,
    last7PageViews,
    conversionRate,
    topPages,
    topCountries,
    statusBreakdown,
    today: today.toLocaleDateString(),
  };
}

export default async function DashboardPage() {
  const s = await getStats();

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" meta="Last 7 days" />

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="New inquiries" value={s.newInquiries} sub={`${s.totalInquiries} total`} href="/admin/inquiries?status=NEW" accent="emerald" />
        <KpiCard label="Inquiries (7d)" value={s.last7Inquiries} sub="vs prev period" accent="blue" />
        <KpiCard label="Sessions (7d)" value={s.last7Sessions} sub={`${s.last7PageViews} page views`} accent="amber" />
        <KpiCard label="Conversion rate" value={`${s.conversionRate}%`} sub="sessions → inquiry" accent="purple" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top pages */}
        <Panel title="Top pages (7d)">
          {s.topPages.length === 0 ? (
            <p className="text-slate-400 text-sm py-6 text-center">No data yet</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {s.topPages.map((p) => (
                <li key={p.page} className="py-2.5 flex items-center justify-between">
                  <span className="truncate text-slate-700 text-sm">{p.page}</span>
                  <span className="font-mono text-sm font-semibold text-emerald-700">{p._count.page}</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        {/* Top countries */}
        <Panel title="Top countries (30d)">
          {s.topCountries.length === 0 ? (
            <p className="text-slate-400 text-sm py-6 text-center">No data yet</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {s.topCountries.map((c) => (
                <li key={c.country} className="py-2.5 flex items-center justify-between">
                  <span className="text-slate-700 text-sm">{c.country}</span>
                  <span className="font-mono text-sm font-semibold text-emerald-700">{c._count.country}</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        {/* Status breakdown */}
        <Panel title="Inquiry pipeline">
          {s.statusBreakdown.length === 0 ? (
            <p className="text-slate-400 text-sm py-6 text-center">No inquiries yet</p>
          ) : (
            <ul className="space-y-3">
              {s.statusBreakdown.map((b) => (
                <li key={b.status} className="flex items-center justify-between">
                  <span className={`inline-block px-2 py-0.5 text-xs font-semibold rounded ${statusClass(STATUS_BADGE, b.status)}`}>{b.status}</span>
                  <span className="font-mono text-sm font-semibold">{b._count.status}</span>
                </li>
              ))}
            </ul>
          )}
          <Link href="/admin/inquiries" className="block mt-4 text-emerald-700 text-sm font-semibold hover:underline">View all inquiries →</Link>
        </Panel>

        {/* Quick links */}
        <Panel title="Quick actions">
          <div className="grid grid-cols-2 gap-3">
            <Link href="/admin/inquiries?status=NEW" className="rounded-xl border border-slate-200 p-4 transition-colors hover:border-brand-200 hover:bg-brand-50/40">
              <div className="font-semibold text-sm">📬 New inquiries</div>
              <div className="text-xs text-slate-500 mt-1">{s.newInquiries} waiting</div>
            </Link>
            <Link href="/admin/sales" className="rounded-xl border border-slate-200 p-4 transition-colors hover:border-brand-200 hover:bg-brand-50/40">
              <div className="font-semibold text-sm">◆ Sales desk</div>
              <div className="text-xs text-slate-500 mt-1">Pipeline, quotes, follow-up</div>
            </Link>
            <Link href="/admin/analytics" className="rounded-xl border border-slate-200 p-4 transition-colors hover:border-brand-200 hover:bg-brand-50/40">
              <div className="font-semibold text-sm">📈 Funnel analysis</div>
              <div className="text-xs text-slate-500 mt-1">Conversion paths</div>
            </Link>
            <Link href="/admin/traffic" className="rounded-xl border border-slate-200 p-4 transition-colors hover:border-brand-200 hover:bg-brand-50/40">
              <div className="font-semibold text-sm">🌍 Traffic sources</div>
              <div className="text-xs text-slate-500 mt-1">UTM + referrers</div>
            </Link>
          </div>
        </Panel>
      </div>
    </div>
  );
}

function KpiCard({
  label,
  value,
  sub,
  accent,
  href,
}: {
  label: string;
  value: string | number;
  sub: string;
  accent: "emerald" | "blue" | "amber" | "purple";
  href?: string;
}) {
  const colors: Record<string, string> = {
    emerald: "from-emerald-50 to-emerald-100/50 text-emerald-700",
    blue: "from-blue-50 to-blue-100/50 text-blue-700",
    amber: "from-amber-50 to-amber-100/50 text-amber-700",
    purple: "from-purple-50 to-purple-100/50 text-purple-700",
  };
  const body = (
    <>
      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</div>
      <div className={`text-3xl font-bold mt-2 ${colors[accent].split(" ")[2]}`}>{value}</div>
      <div className="text-xs text-slate-500 mt-1">{sub}</div>
    </>
  );
  const cls = `bg-gradient-to-br ${colors[accent]} bg-white rounded-xl p-5 border border-slate-200 shadow-card`;
  return href ? (
    <Link href={href} className={cls + " transition-shadow hover:shadow-soft"}>{body}</Link>
  ) : (
    <div className={cls}>{body}</div>
  );
}
