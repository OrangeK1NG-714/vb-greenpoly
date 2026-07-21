import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { format, formatDistanceToNow } from "date-fns";
import { UAParser } from "ua-parser-js";

export const dynamic = "force-dynamic";

export default async function VisitorDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await prisma.session.findUnique({ where: { id } });
  if (!session) notFound();

  const [events, inquiries] = await Promise.all([
    prisma.event.findMany({
      where: { sessionId: id },
      orderBy: { createdAt: "asc" },
      take: 500,
    }),
    prisma.inquiry.findMany({
      where: { sessionId: id },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const ua = session.userAgent ? new UAParser(session.userAgent) : null;
  const browser = ua?.getBrowser();
  const os = ua?.getOS();
  const device = ua?.getDevice();

  const flag = countryToFlag(session.countryCode);
  const mapsUrl =
    session.latitude != null && session.longitude != null
      ? `https://www.openstreetmap.org/?mlat=${session.latitude}&mlon=${session.longitude}#map=10/${session.latitude}/${session.longitude}`
      : null;
  const ipLookupUrl = session.ipAddress ? `https://ipinfo.io/${session.ipAddress}` : null;

  // Pages visited (deduped, in order of first view)
  const pagesVisitedOrder: string[] = [];
  const pageViewCounts = new Map<string, number>();
  for (const e of events) {
    if (e.eventName === "page_view") {
      if (!pageViewCounts.has(e.page)) pagesVisitedOrder.push(e.page);
      pageViewCounts.set(e.page, (pageViewCounts.get(e.page) ?? 0) + 1);
    }
  }

  return (
    <div className="space-y-6 max-w-6xl">
      <Link href="/admin/visitors" className="text-emerald-700 text-sm font-semibold hover:underline">
        ← Back to visitors
      </Link>

      {/* Header card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              {flag && <span className="text-3xl">{flag}</span>}
              Visitor session
            </h1>
            <p className="text-xs text-slate-500 mt-1 font-mono">{session.id}</p>
            <p className="text-sm text-slate-600 mt-2">
              First seen {format(session.firstSeen, "PPpp")} ·{" "}
              <span className="text-slate-500">Last seen {formatDistanceToNow(session.lastSeen, { addSuffix: true })}</span>
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            {session.inquired ? (
              <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full">
                ✉ Submitted inquiry
              </span>
            ) : (
              <span className="bg-slate-100 text-slate-600 text-xs font-semibold px-3 py-1 rounded-full">
                Browsing
              </span>
            )}
            <div className="text-sm text-slate-700 font-semibold">
              {session.pageViews} page views · {Math.round(session.totalDwellMs / 1000)}s dwell
            </div>
          </div>
        </div>
      </div>

      {/* IP + Location */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <h2 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
          🌍 IP & edge location
        </h2>
        <p className="text-xs text-slate-500 mb-4">
          Country is provided by the trusted CDN edge. City, region and map coordinates appear only when the host forwards them; all IP-based locations are approximate.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Field label="IP address" value={session.ipAddress} mono />
          <Field
            label="Country"
            value={session.country ? `${flag ? flag + " " : ""}${session.country} (${session.countryCode ?? "—"})` : null}
          />
          <Field label="Region / State" value={session.region} />
          <Field label="City" value={session.city} />
          <Field label="Coordinates" value={session.latitude != null && session.longitude != null ? `${session.latitude}, ${session.longitude}` : null} />
          <Field label="Timezone" value={session.timezone} />
          <Field label="ISP / Carrier" value={session.isp} />
          <Field label="Language" value={session.locale ?? "—"} />
        </div>
        {(mapsUrl || ipLookupUrl) && (
          <div className="flex flex-wrap gap-2 mt-4">
            {mapsUrl && (
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold bg-slate-900 text-white px-3 py-1.5 rounded-lg hover:bg-slate-800"
              >
                View on map ↗
              </a>
            )}
            {ipLookupUrl && (
              <a
                href={ipLookupUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold border border-slate-200 text-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-50"
              >
                Open in ipinfo.io ↗
              </a>
            )}
          </div>
        )}
      </div>

      {/* Device + traffic source */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <h2 className="font-bold text-slate-900 mb-4">🖥️ Device</h2>
          <div className="space-y-3">
            <Field label="Browser" value={browser ? `${browser.name ?? "?"} ${browser.version ?? ""}`.trim() : null} />
            <Field label="OS" value={os ? `${os.name ?? "?"} ${os.version ?? ""}`.trim() : null} />
            <Field label="Device" value={device?.vendor || device?.model ? `${device.vendor ?? ""} ${device.model ?? ""}`.trim() : (device?.type ?? "desktop")} />
            <Field label="User agent" value={session.userAgent} mono small />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <h2 className="font-bold text-slate-900 mb-4">📈 Traffic source</h2>
          <div className="space-y-3">
            <Field label="Referrer" value={session.referrer} mono small />
            <Field label="UTM source" value={session.utmSource ?? "(direct)"} />
            <Field label="UTM medium" value={session.utmMedium} />
            <Field label="UTM campaign" value={session.utmCampaign} />
          </div>
        </div>
      </div>

      {/* Linked inquiries */}
      {inquiries.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <h2 className="font-bold text-slate-900 mb-4">📬 Linked inquiries</h2>
          <ul className="divide-y divide-slate-100">
            {inquiries.map((inq) => (
              <li key={inq.id} className="py-3 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-900">{inq.name}</div>
                  <div className="text-xs text-slate-500">
                    {inq.email} · {inq.product ?? "—"} · {format(inq.createdAt, "MMM d, HH:mm")}
                  </div>
                </div>
                <Link
                  href={`/admin/inquiries/${inq.id}`}
                  className="text-emerald-700 hover:underline text-sm font-semibold"
                >
                  Open →
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Pages visited */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <h2 className="font-bold text-slate-900 mb-1">📄 Pages visited</h2>
        <p className="text-xs text-slate-500 mb-4">In order of first view ({pagesVisitedOrder.length} unique)</p>
        {pagesVisitedOrder.length === 0 ? (
          <p className="text-slate-400 text-sm">No page views recorded.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {pagesVisitedOrder.map((p, i) => (
              <li key={p} className="py-2 flex items-center justify-between gap-3 text-sm">
                <span className="text-slate-400 font-mono text-xs w-6">{i + 1}.</span>
                <span className="flex-1 text-slate-700 truncate">{p}</span>
                <span className="text-emerald-700 font-mono text-xs">×{pageViewCounts.get(p)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Full timeline */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <h2 className="font-bold text-slate-900 mb-1">🕒 Full event timeline</h2>
        <p className="text-xs text-slate-500 mb-4">Every event recorded for this visitor ({events.length})</p>
        {events.length === 0 ? (
          <p className="text-slate-400 text-sm py-4 text-center">No events recorded.</p>
        ) : (
          <div className="space-y-1">
            {events.map((ev) => (
              <div
                key={ev.id}
                className="flex items-start gap-3 text-sm border-l-2 border-emerald-200 pl-3 py-1 hover:bg-slate-50"
              >
                <span className="font-mono text-xs text-slate-400 w-32 flex-shrink-0">
                  {format(ev.createdAt, "MMM d HH:mm:ss")}
                </span>
                <span className={`font-semibold w-32 flex-shrink-0 ${eventColor(ev.eventName)}`}>
                  {ev.eventName}
                </span>
                <span className="text-slate-700 truncate flex-1" title={ev.page}>
                  {ev.page}
                </span>
                {ev.properties && (
                  <span className="text-xs text-slate-400 font-mono truncate max-w-[240px]" title={ev.properties}>
                    {ev.properties}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  mono,
  small,
}: {
  label: string;
  value: string | null | undefined;
  mono?: boolean;
  small?: boolean;
}) {
  return (
    <div>
      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</div>
      <div
        className={`mt-0.5 text-slate-900 ${mono ? "font-mono" : ""} ${
          small ? "text-xs break-all" : ""
        }`}
      >
        {value || <span className="text-slate-400">—</span>}
      </div>
    </div>
  );
}

function eventColor(name: string): string {
  switch (name) {
    case "page_view":
      return "text-blue-700";
    case "cta_click":
    case "whatsapp_click":
      return "text-amber-700";
    case "form_submit":
    case "sample_request":
      return "text-emerald-700";
    case "scroll_depth":
      return "text-purple-700";
    case "dwell":
      return "text-slate-600";
    default:
      return "text-slate-700";
  }
}

function countryToFlag(code: string | null | undefined): string | null {
  if (!code || code.length !== 2) return null;
  const cc = code.toUpperCase();
  const A = 0x1f1e6;
  return String.fromCodePoint(A + (cc.charCodeAt(0) - 65), A + (cc.charCodeAt(1) - 65));
}
