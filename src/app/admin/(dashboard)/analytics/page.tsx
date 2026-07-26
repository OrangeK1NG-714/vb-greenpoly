import { prisma } from "@/lib/db";
import { subDays } from "date-fns";
import Panel from "@/components/ui/Panel";
import PageHeader from "@/components/ui/PageHeader";

export const dynamic = "force-dynamic";

async function getAnalytics(days: number) {
  const since = subDays(new Date(), days);

  const [productPages, ctaClicks, sessions, inquired, scrollDepths, dwellAvg] = await Promise.all([
    // Product page heat
    prisma.event.groupBy({
      by: ["page"],
      where: {
        eventName: "page_view",
        createdAt: { gte: since },
        page: { contains: "/products/" },
      },
      _count: { page: true },
      orderBy: { _count: { page: "desc" } },
    }),
    // Top CTA clicks
    prisma.event.groupBy({
      by: ["properties"],
      where: {
        eventName: "cta_click",
        createdAt: { gte: since },
      },
      _count: { properties: true },
      orderBy: { _count: { properties: "desc" } },
      take: 10,
    }),
    // Total sessions
    prisma.session.count({ where: { firstSeen: { gte: since } } }),
    // Sessions that inquired
    prisma.session.count({ where: { firstSeen: { gte: since }, inquired: true } }),
    // Scroll depth distribution
    prisma.event.findMany({
      where: { eventName: "scroll_depth", createdAt: { gte: since } },
      select: { properties: true },
    }),
    // Avg dwell time per session
    prisma.session.aggregate({
      where: { firstSeen: { gte: since } },
      _avg: { totalDwellMs: true, pageViews: true },
    }),
  ]);

  // Funnel
  const sessionsWithProductView = await prisma.event.groupBy({
    by: ["sessionId"],
    where: {
      eventName: "page_view",
      createdAt: { gte: since },
      page: { contains: "/products" },
    },
    _count: { sessionId: true },
  });
  const sessionsWithCta = await prisma.event.groupBy({
    by: ["sessionId"],
    where: { eventName: "cta_click", createdAt: { gte: since } },
    _count: { sessionId: true },
  });

  // Scroll depth aggregate
  const depthCount: Record<string, number> = { "25": 0, "50": 0, "75": 0, "100": 0 };
  for (const ev of scrollDepths) {
    try {
      const props = JSON.parse(ev.properties ?? "{}");
      const d = String(props.depth);
      if (d in depthCount) depthCount[d]++;
    } catch {}
  }

  return {
    productPages,
    ctaClicks,
    funnel: {
      sessions,
      productViewers: sessionsWithProductView.length,
      ctaClickers: sessionsWithCta.length,
      inquired,
    },
    scrollDepths: depthCount,
    avgDwellMs: dwellAvg._avg.totalDwellMs ?? 0,
    avgPageViews: dwellAvg._avg.pageViews ?? 0,
  };
}

export default async function AnalyticsPage() {
  const a = await getAnalytics(30);

  return (
    <div className="space-y-6">
      <PageHeader title="Analytics" meta="Last 30 days" />

      {/* Funnel */}
      <div className="admin-card p-6">
        <h2 className="font-bold text-slate-900 mb-1">Conversion funnel</h2>
        <p className="text-xs text-slate-500 mb-6">Where visitors drop off on the path to inquiry</p>

        {a.funnel.sessions === 0 ? (
          <p className="text-slate-400 text-center py-6 text-sm">No traffic data yet. Visit the public site to generate events.</p>
        ) : (
          <div className="space-y-3">
            {[
              { label: "All sessions", count: a.funnel.sessions, color: "bg-slate-400" },
              { label: "Viewed product page", count: a.funnel.productViewers, color: "bg-blue-500" },
              { label: "Clicked CTA", count: a.funnel.ctaClickers, color: "bg-amber-500" },
              { label: "Submitted inquiry", count: a.funnel.inquired, color: "bg-emerald-600" },
            ].map((step, i, arr) => {
              const pct = a.funnel.sessions > 0 ? (step.count / a.funnel.sessions) * 100 : 0;
              const dropFromPrev = i > 0 && arr[i - 1].count > 0
                ? Math.round((1 - step.count / arr[i - 1].count) * 100)
                : null;
              return (
                <div key={step.label}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="font-semibold text-slate-700">{step.label}</span>
                    <span className="text-slate-500">
                      {step.count} ({pct.toFixed(1)}%)
                      {dropFromPrev !== null && <span className="text-red-600 ml-2">−{dropFromPrev}%</span>}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                    <div className={`${step.color} h-full rounded-full transition-all`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Product heat */}
        <Panel title="Product page heat (30d)" subtitle="Which products people are looking at">
          {a.productPages.length === 0 ? (
            <p className="text-slate-400 text-sm py-6 text-center">No product page views yet</p>
          ) : (
            <ul className="space-y-2">
              {a.productPages.slice(0, 10).map((p) => (
                <li key={p.page} className="flex items-center justify-between gap-3">
                  <span className="text-sm text-slate-700 truncate">{p.page}</span>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="w-24 bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div className="bg-emerald-600 h-full" style={{ width: `${Math.min(100, (p._count.page / a.productPages[0]._count.page) * 100)}%` }} />
                    </div>
                    <span className="font-mono text-sm font-semibold text-emerald-700 w-12 text-right">{p._count.page}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        {/* Top CTAs */}
        <Panel title="Top CTA clicks (30d)" subtitle="Which buttons get clicked most">
          {a.ctaClicks.length === 0 ? (
            <p className="text-slate-400 text-sm py-6 text-center">No CTA clicks yet</p>
          ) : (
            <ul className="space-y-2">
              {a.ctaClicks.slice(0, 10).map((c, i) => {
                let label = "(unknown)";
                try {
                  const props = JSON.parse(c.properties ?? "{}");
                  label = props.ctaId || "(unknown)";
                } catch {}
                return (
                  <li key={i} className="flex items-center justify-between gap-3">
                    <code className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-700 truncate">{label}</code>
                    <span className="font-mono text-sm font-semibold text-emerald-700">{c._count.properties}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>

        {/* Scroll depth */}
        <Panel title="Scroll depth distribution (30d)" subtitle="How far visitors actually scroll">
          <ul className="space-y-2">
            {(["25", "50", "75", "100"] as const).map((d) => {
              const count = a.scrollDepths[d];
              const max = Math.max(...Object.values(a.scrollDepths), 1);
              return (
                <li key={d} className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-slate-700 w-12">{d}%</span>
                  <div className="flex-1 bg-slate-100 rounded-full h-3 overflow-hidden">
                    <div className="bg-blue-500 h-full" style={{ width: `${(count / max) * 100}%` }} />
                  </div>
                  <span className="font-mono text-sm text-slate-600 w-12 text-right">{count}</span>
                </li>
              );
            })}
          </ul>
        </Panel>

        {/* Engagement */}
        <Panel title="Engagement averages" subtitle="Per session">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Avg dwell time</div>
              <div className="text-2xl font-bold text-slate-900 mt-1">
                {Math.round((a.avgDwellMs ?? 0) / 1000)}s
              </div>
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Avg page views</div>
              <div className="text-2xl font-bold text-slate-900 mt-1">
                {(a.avgPageViews ?? 0).toFixed(1)}
              </div>
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}
