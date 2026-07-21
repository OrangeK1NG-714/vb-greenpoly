import { prisma } from "@/lib/db";
import { subDays } from "date-fns";

export const dynamic = "force-dynamic";

async function getTraffic(days: number) {
  const since = subDays(new Date(), days);

  const [byCountry, byUtmSource, byUtmCampaign, byReferrer, byLocale] = await Promise.all([
    prisma.session.groupBy({
      by: ["country"],
      where: { firstSeen: { gte: since } },
      _count: { country: true },
      orderBy: { _count: { country: "desc" } },
      take: 20,
    }),
    prisma.session.groupBy({
      by: ["utmSource"],
      where: { firstSeen: { gte: since } },
      _count: { utmSource: true },
      orderBy: { _count: { utmSource: "desc" } },
      take: 10,
    }),
    prisma.session.groupBy({
      by: ["utmCampaign"],
      where: { firstSeen: { gte: since }, utmCampaign: { not: null } },
      _count: { utmCampaign: true },
      orderBy: { _count: { utmCampaign: "desc" } },
      take: 10,
    }),
    prisma.session.groupBy({
      by: ["referrer"],
      where: { firstSeen: { gte: since }, referrer: { not: null } },
      _count: { referrer: true },
      orderBy: { _count: { referrer: "desc" } },
      take: 10,
    }),
    prisma.session.groupBy({
      by: ["locale"],
      where: { firstSeen: { gte: since } },
      _count: { locale: true },
      orderBy: { _count: { locale: "desc" } },
    }),
  ]);

  return { byCountry, byUtmSource, byUtmCampaign, byReferrer, byLocale };
}

export default async function TrafficPage() {
  const t = await getTraffic(30);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Traffic Sources</h1>
        <span className="text-sm text-slate-500">Last 30 days</span>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Panel title="By country (edge location)">
          <SimpleList items={t.byCountry.map(c => ({ key: c.country ?? "Unknown", count: c._count.country }))} />
        </Panel>

        <Panel title="By language">
          <SimpleList items={t.byLocale.map(l => ({ key: l.locale ?? "default", count: l._count.locale }))} />
        </Panel>

        <Panel title="By UTM source">
          <SimpleList items={t.byUtmSource.map(s => ({ key: s.utmSource ?? "(direct)", count: s._count.utmSource }))} />
        </Panel>

        <Panel title="By UTM campaign">
          <SimpleList items={t.byUtmCampaign.map(c => ({ key: c.utmCampaign ?? "—", count: c._count.utmCampaign }))} />
        </Panel>

        <Panel title="By referrer" wide>
          {t.byReferrer.length === 0 ? (
            <p className="text-slate-400 text-sm py-4 text-center">No referrer data yet</p>
          ) : (
            <ul className="space-y-2">
              {t.byReferrer.map((r) => (
                <li key={r.referrer} className="flex items-center justify-between gap-3 py-1.5 border-b border-slate-100 last:border-0">
                  <span className="text-xs text-slate-700 truncate max-w-md">{r.referrer}</span>
                  <span className="font-mono text-sm font-semibold text-emerald-700">{r._count.referrer}</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}

function Panel({ title, children, wide }: { title: string; children: React.ReactNode; wide?: boolean }) {
  return (
    <div className={`bg-white rounded-xl border border-slate-200 p-5 ${wide ? "lg:col-span-2" : ""}`}>
      <h3 className="font-bold text-slate-900 mb-3">{title}</h3>
      {children}
    </div>
  );
}

function SimpleList({ items }: { items: { key: string; count: number }[] }) {
  if (items.length === 0) {
    return <p className="text-slate-400 text-sm py-4 text-center">No data yet</p>;
  }
  const max = Math.max(...items.map(i => i.count), 1);
  return (
    <ul className="space-y-2">
      {items.map((it) => (
        <li key={it.key} className="flex items-center gap-3">
          <span className="text-sm text-slate-700 w-32 truncate flex-shrink-0">{it.key}</span>
          <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
            <div className="bg-emerald-500 h-full" style={{ width: `${(it.count / max) * 100}%` }} />
          </div>
          <span className="font-mono text-sm font-semibold text-slate-700 w-12 text-right">{it.count}</span>
        </li>
      ))}
    </ul>
  );
}
