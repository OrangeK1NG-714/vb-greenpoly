import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getInquiryGo, goBackendEnabled } from "@/lib/go-backend";
import { format } from "date-fns";
import InquiryStatusSelect from "@/components/admin/InquiryStatusSelect";
import InquiryNotes from "@/components/admin/InquiryNotes";

export const dynamic = "force-dynamic";

async function loadInquiry(id: string) {
  if (goBackendEnabled) return getInquiryGo(id);
  return prisma.inquiry.findUnique({ where: { id } });
}

export default async function InquiryDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const inquiry = await loadInquiry(id);
  if (!inquiry) notFound();

  // Pull the visitor's full session journey if we have a sessionId
  const sessionEvents = inquiry.sessionId
    ? await prisma.event.findMany({
        where: { sessionId: inquiry.sessionId },
        orderBy: { createdAt: "asc" },
        take: 200,
      })
    : [];

  return (
    <div className="space-y-6 max-w-5xl">
      <Link href="/admin/inquiries" className="text-emerald-700 text-sm font-semibold hover:underline">
        ← Back to inquiries
      </Link>

      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{inquiry.name}</h1>
            <p className="text-slate-500 mt-1">
              {inquiry.company} · <a href={`mailto:${inquiry.email}`} className="text-emerald-700 hover:underline">{inquiry.email}</a>
              {inquiry.phone && <> · <a href={`https://wa.me/${inquiry.phone.replace(/\D/g, '')}`} className="text-emerald-700 hover:underline">{inquiry.phone}</a></>}
            </p>
            <p className="text-xs text-slate-500 mt-1">Received {format(inquiry.createdAt, "PPpp")}</p>
          </div>
          <InquiryStatusSelect id={inquiry.id} current={inquiry.status} />
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          <Field label="Country" value={inquiry.country} />
          <Field label="Destination Port" value={inquiry.port} />
          <Field label="Product" value={inquiry.product} />
          <Field label="Volume" value={inquiry.volume} />
          <Field label="Incoterms" value={inquiry.incoterms} />
          <Field label="UTM Source" value={inquiry.utmSource || "direct"} />
        </div>

        {inquiry.message && (
          <div className="mb-6">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Message</div>
            <div className="bg-slate-50 rounded-lg p-4 text-slate-800 whitespace-pre-wrap">{inquiry.message}</div>
          </div>
        )}

        <InquiryNotes id={inquiry.id} initial={inquiry.notes ?? ""} />
      </div>

      {/* Visitor Journey */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <h2 className="font-bold text-slate-900 mb-1">Visitor journey</h2>
        <p className="text-xs text-slate-500 mb-4">Every page this lead viewed before submitting</p>
        {sessionEvents.length === 0 ? (
          <p className="text-slate-400 text-sm py-4 text-center">No session data linked — this inquiry came in before tracking was active or session was missing.</p>
        ) : (
          <div className="space-y-2">
            {sessionEvents.map((ev) => (
              <div key={ev.id} className="flex items-start gap-3 text-sm border-l-2 border-emerald-200 pl-3 py-1">
                <span className="font-mono text-xs text-slate-400 w-32 flex-shrink-0">
                  {format(ev.createdAt, "HH:mm:ss")}
                </span>
                <span className="font-semibold text-emerald-700 w-32 flex-shrink-0">{ev.eventName}</span>
                <span className="text-slate-700 truncate">{ev.page}</span>
                {ev.properties && (
                  <span className="text-xs text-slate-400 truncate">{ev.properties}</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</div>
      <div className="text-slate-900 mt-0.5">{value || "—"}</div>
    </div>
  );
}
