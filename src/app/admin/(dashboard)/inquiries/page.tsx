import Link from "next/link";
import { prisma } from "@/lib/db";
import { goBackendEnabled, listInquiriesGo, type GoInquiry } from "@/lib/go-backend";
import type { Inquiry } from "@/generated/prisma/client";
import InquiryStatusSelect from "@/components/admin/InquiryStatusSelect";
import { format } from "date-fns";

export const dynamic = "force-dynamic";

const STATUSES = ["NEW", "CONTACTED", "QUOTED", "NEGOTIATING", "WON", "LOST"] as const;

async function loadInquiries(statusFilter?: string) {
  if (goBackendEnabled) {
    const { inquiries, counts } = await listInquiriesGo(statusFilter);
    return { inquiries: inquiries as (GoInquiry | Inquiry)[], totalByStatus: counts };
  }
  const where = statusFilter && STATUSES.includes(statusFilter as typeof STATUSES[number])
    ? { status: statusFilter }
    : {};
  const [inquiries, counts] = await Promise.all([
    prisma.inquiry.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.inquiry.groupBy({
      by: ["status"],
      _count: { status: true },
    }),
  ]);
  const totalByStatus: Record<string, number> = {};
  for (const c of counts) totalByStatus[c.status] = c._count.status;
  return { inquiries: inquiries as (GoInquiry | Inquiry)[], totalByStatus };
}

export default async function InquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status: statusFilter } = await searchParams;
  const { inquiries, totalByStatus } = await loadInquiries(statusFilter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-slate-900">Inquiries</h1>
        <span className="text-sm text-slate-500">{inquiries.length} shown</span>
      </div>

      {/* Status filter pills */}
      <div className="flex flex-wrap gap-2">
        <Link
          href="/admin/inquiries"
          className={`px-3 py-1.5 text-sm rounded-full border ${!statusFilter ? "bg-slate-900 text-white border-slate-900" : "bg-white border-slate-200 text-slate-700"}`}
        >
          All
        </Link>
        {STATUSES.map((s) => (
          <Link
            key={s}
            href={`/admin/inquiries?status=${s}`}
            className={`px-3 py-1.5 text-sm rounded-full border ${statusFilter === s ? statusActiveColor(s) : "bg-white border-slate-200 text-slate-700"}`}
          >
            {s} ({totalByStatus[s] ?? 0})
          </Link>
        ))}
      </div>

      {inquiries.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
          <div className="text-4xl mb-3">📭</div>
          <p className="text-slate-600">No inquiries yet. They will appear here once visitors submit the form.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">Date</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">Contact</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">Product</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">Volume</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">Country</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">Source</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">Status</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {inquiries.map((inq) => (
                  <tr key={inq.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                      {format(inq.createdAt, "MMM d, HH:mm")}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900">{inq.name}</div>
                      <div className="text-xs text-slate-500">{inq.email}</div>
                      {inq.company && <div className="text-xs text-slate-500">{inq.company}</div>}
                    </td>
                    <td className="px-4 py-3 text-slate-700">{inq.product || "—"}</td>
                    <td className="px-4 py-3 text-slate-700">{inq.volume || "—"}</td>
                    <td className="px-4 py-3 text-slate-700">{inq.country || "—"}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">{inq.utmSource || "direct"}</td>
                    <td className="px-4 py-3">
                      <InquiryStatusSelect id={inq.id} current={inq.status} />
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/admin/inquiries/${inq.id}`} className="text-emerald-700 hover:underline text-xs font-semibold">
                        View →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function statusActiveColor(s: string) {
  const map: Record<string, string> = {
    NEW: "bg-emerald-600 text-white border-emerald-600",
    CONTACTED: "bg-blue-600 text-white border-blue-600",
    QUOTED: "bg-purple-600 text-white border-purple-600",
    NEGOTIATING: "bg-amber-600 text-white border-amber-600",
    WON: "bg-green-600 text-white border-green-600",
    LOST: "bg-slate-600 text-white border-slate-600",
  };
  return map[s] ?? map.NEW;
}
