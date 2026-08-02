import Link from "next/link";
import { getInquiryService } from "@/composition/server/inquiries";
import InquiryStatusSelect from "@/components/admin/InquiryStatusSelect";
import PageHeader from "@/components/ui/PageHeader";
import { STATUS_SOLID, statusClass } from "@/components/ui/status";
import { format } from "date-fns";

export const dynamic = "force-dynamic";

const STATUSES = ["NEW", "CONTACTED", "QUOTED", "NEGOTIATING", "WON", "LOST"] as const;

export default async function InquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status: statusFilter } = await searchParams;
  const { inquiries, counts: totalByStatus } = await getInquiryService().list(statusFilter);

  return (
    <div className="space-y-6">
      <PageHeader title="Inquiries" meta={`${inquiries.length} shown`} />

      {/* Status filter pills */}
      <div className="flex flex-wrap gap-2">
        <Link
          href="/admin/inquiries"
          className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${!statusFilter ? "bg-slate-900 text-white border-slate-900" : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"}`}
        >
          All
        </Link>
        {STATUSES.map((s) => (
          <Link
            key={s}
            href={`/admin/inquiries?status=${s}`}
            className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${statusFilter === s ? statusClass(STATUS_SOLID, s) : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"}`}
          >
            {s} ({totalByStatus[s] ?? 0})
          </Link>
        ))}
      </div>

      {inquiries.length === 0 ? (
        <div className="admin-card p-12 text-center">
          <div className="text-4xl mb-3">📭</div>
          <p className="text-slate-600">No inquiries yet. They will appear here once visitors submit the form.</p>
        </div>
      ) : (
        <div className="admin-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Contact</th>
                  <th>Product</th>
                  <th>Volume</th>
                  <th>Country</th>
                  <th>Source</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {inquiries.map((inq) => (
                  <tr key={inq.id} className="transition-colors hover:bg-slate-50">
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
