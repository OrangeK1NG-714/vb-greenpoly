"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  calculateQuote,
  createFollowUpDraft,
  getLeadAction,
  SALES_STATUSES,
  type DraftLanguage,
  type DraftTone,
  type QuoteInput,
  type SalesLead,
} from "@/lib/sales-tools";

type WorkspaceTab = "pipeline" | "quote" | "outreach";

type ProductOption = {
  value: string;
  label: string;
};

type Props = {
  leads: SalesLead[];
  products: ProductOption[];
  asOf: string;
  source: "local" | "go-backend";
};

const PRIORITY_ORDER = { high: 0, medium: 1, low: 2, done: 3 } as const;
const ACTIVE_STATUSES = new Set(["NEW", "CONTACTED", "QUOTED", "NEGOTIATING"]);

const INITIAL_QUOTE: QuoteInput = {
  quantityMt: 20,
  supplierCostCnyPerMt: 5600,
  inlandAndPortCny: 6500,
  documentsCny: 2500,
  exchangeRateCnyPerUsd: 7.2,
  targetMarginPercent: 12,
  oceanFreightUsd: 1200,
  insurancePercent: 0.3,
};

function blankLead(): SalesLead {
  const now = new Date(0).toISOString();
  return {
    id: "manual",
    name: "",
    email: "",
    company: "",
    country: "",
    port: "",
    product: "Recycled ABS Pellets",
    volume: "20 MT",
    incoterms: "CIF",
    status: "NEW",
    createdAt: now,
    updatedAt: now,
  };
}

export default function SalesWorkspace({ leads, products, asOf, source }: Props) {
  const [tab, setTab] = useState<WorkspaceTab>("pipeline");

  const counts = useMemo(() => {
    const next = Object.fromEntries(SALES_STATUSES.map((status) => [status, 0])) as Record<string, number>;
    for (const lead of leads) next[lead.status] = (next[lead.status] ?? 0) + 1;
    return next;
  }, [leads]);

  const actionQueue = useMemo(() => (
    leads
      .filter((lead) => ACTIVE_STATUSES.has(lead.status))
      .map((lead) => ({ lead, action: getLeadAction(lead, asOf) }))
      .sort((a, b) => (
        PRIORITY_ORDER[a.action.priority] - PRIORITY_ORDER[b.action.priority]
        || b.action.idleDays - a.action.idleDays
      ))
  ), [asOf, leads]);

  const activeCount = actionQueue.length;
  const highPriorityCount = actionQueue.filter(({ action }) => action.priority === "high").length;
  const wonCount = counts.WON ?? 0;
  const winRate = leads.length > 0 ? Math.round((wonCount / leads.length) * 100) : 0;

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase text-emerald-700">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Sales workspace
          </div>
          <h1 className="mt-2 text-2xl font-bold text-slate-950">Lead desk</h1>
          <p className="mt-1 text-sm text-slate-500">{activeCount} active leads · {highPriorityCount} need attention</p>
        </div>

        <div className="inline-flex w-full rounded-lg border border-slate-200 bg-white p-1 shadow-sm xl:w-auto" role="tablist" aria-label="Sales workspace views">
          <TabButton active={tab === "pipeline"} onClick={() => setTab("pipeline")}>Pipeline</TabButton>
          <TabButton active={tab === "quote"} onClick={() => setTab("quote")}>Quote builder</TabButton>
          <TabButton active={tab === "outreach"} onClick={() => setTab("outreach")}>Follow-up drafts</TabButton>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-slate-200 bg-slate-200 lg:grid-cols-4">
        <Metric label="Active leads" value={activeCount} detail={`${leads.length} total`} />
        <Metric label="Priority now" value={highPriorityCount} detail="response queue" />
        <Metric label="Quotes open" value={(counts.QUOTED ?? 0) + (counts.NEGOTIATING ?? 0)} detail="commercial stage" />
        <Metric label="Win rate" value={`${winRate}%`} detail={`${wonCount} won`} />
      </div>

      {tab === "pipeline" && (
        <PipelineView leads={leads} counts={counts} actionQueue={actionQueue} source={source} />
      )}
      {tab === "quote" && <QuoteBuilder products={products} />}
      {tab === "outreach" && <OutreachBuilder leads={leads} products={products} />}
    </div>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`min-h-9 flex-1 whitespace-nowrap rounded-md px-3 text-xs font-semibold transition xl:flex-none ${active ? "bg-slate-950 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"}`}
    >
      {children}
    </button>
  );
}

function Metric({ label, value, detail }: { label: string; value: string | number; detail: string }) {
  return (
    <div className="min-h-24 bg-white p-4 sm:p-5">
      <div className="text-xs font-semibold uppercase text-slate-500">{label}</div>
      <div className="mt-2 text-2xl font-bold text-slate-950">{value}</div>
      <div className="mt-1 text-xs text-slate-500">{detail}</div>
    </div>
  );
}

function PipelineView({
  leads,
  counts,
  actionQueue,
  source,
}: {
  leads: SalesLead[];
  counts: Record<string, number>;
  actionQueue: Array<{ lead: SalesLead; action: ReturnType<typeof getLeadAction> }>;
  source: Props["source"];
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_18rem]">
      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <h2 className="font-bold text-slate-950">Action queue</h2>
            <p className="mt-0.5 text-xs text-slate-500">Oldest open conversations are ranked first</p>
          </div>
          <span className="rounded bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">{source === "go-backend" ? "GO SOURCE" : "LOCAL SOURCE"}</span>
        </div>

        {actionQueue.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <div className="text-sm font-semibold text-slate-700">No active follow-ups</div>
            <p className="mt-1 text-sm text-slate-500">New inquiries will enter this queue automatically.</p>
            <Link href="/admin/inquiries" className="mt-4 inline-block text-sm font-semibold text-emerald-700 hover:underline">Open inquiries</Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {actionQueue.map(({ lead, action }) => (
              <div key={lead.id} className="grid gap-3 px-5 py-4 transition hover:bg-slate-50 sm:grid-cols-[minmax(0,1fr)_10rem_auto] sm:items-center">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 flex-none rounded-full ${priorityDot(action.priority)}`} />
                    <span className="truncate font-semibold text-slate-950">{lead.company || lead.name}</span>
                    <StatusBadge status={lead.status} />
                  </div>
                  <div className="mt-1 truncate text-xs text-slate-500">
                    {lead.product || "Product not specified"}{lead.volume ? ` · ${lead.volume}` : ""}{lead.country ? ` · ${lead.country}` : ""}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-800">{action.label}</div>
                  <div className="mt-0.5 text-xs text-slate-500">{action.detail}</div>
                </div>
                <Link href={`/admin/inquiries/${lead.id}`} className="text-sm font-semibold text-emerald-700 hover:underline">
                  Review
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-slate-950">Pipeline</h2>
          <span className="text-xs text-slate-500">{leads.length} leads</span>
        </div>
        <div className="mt-5 space-y-4">
          {SALES_STATUSES.map((status) => {
            const count = counts[status] ?? 0;
            const percent = leads.length > 0 ? Math.max(count > 0 ? 6 : 0, (count / leads.length) * 100) : 0;
            return (
              <Link key={status} href={`/admin/inquiries?status=${status}`} className="block group">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-600 group-hover:text-slate-950">{status}</span>
                  <span className="font-mono font-semibold text-slate-950">{count}</span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100">
                  <div className={`h-full rounded-full ${statusBar(status)}`} style={{ width: `${percent}%` }} />
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function QuoteBuilder({ products }: { products: ProductOption[] }) {
  const [product, setProduct] = useState(products[0]?.value ?? "Recycled plastic pellets");
  const [input, setInput] = useState(INITIAL_QUOTE);
  const [copied, setCopied] = useState(false);

  const quote = useMemo(() => {
    try {
      return calculateQuote(input);
    } catch {
      return null;
    }
  }, [input]);

  function update<K extends keyof QuoteInput>(key: K, value: string) {
    setInput((current) => ({ ...current, [key]: Number(value) }));
  }

  const summary = quote
    ? [
        `${product} quotation draft`,
        `Quantity: ${input.quantityMt} MT`,
        `FOB: ${usd(quote.fobPerMtUsd)}/MT (${usd(quote.fobTotalUsd)} total)`,
        `Ocean freight: ${usd(quote.oceanFreightUsd)}`,
        `Insurance: ${usd(quote.insuranceUsd)}`,
        `CIF: ${usd(quote.cifPerMtUsd)}/MT (${usd(quote.cifTotalUsd)} total)`,
        `Gross margin target: ${input.targetMarginPercent}%`,
      ].join("\n")
    : "";

  async function copySummary() {
    if (!summary) return;
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <section className="grid overflow-hidden rounded-lg border border-slate-200 bg-white xl:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-bold text-slate-950">FOB / CIF quote builder</h2>
            <p className="mt-1 text-xs text-slate-500">Internal calculation · values are not sent or stored</p>
          </div>
          <span className="rounded bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700">MANUAL FX</span>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <SelectField label="Product" value={product} onChange={setProduct} options={products} />
          <NumberField label="Quantity" suffix="MT" value={input.quantityMt} onChange={(value) => update("quantityMt", value)} min="0.01" step="0.01" />
          <NumberField label="Supplier cost" suffix="CNY/MT" value={input.supplierCostCnyPerMt} onChange={(value) => update("supplierCostCnyPerMt", value)} min="0" step="1" />
          <NumberField label="Inland + port" suffix="CNY" value={input.inlandAndPortCny} onChange={(value) => update("inlandAndPortCny", value)} min="0" step="1" />
          <NumberField label="Documents" suffix="CNY" value={input.documentsCny} onChange={(value) => update("documentsCny", value)} min="0" step="1" />
          <NumberField label="CNY per USD" suffix="FX" value={input.exchangeRateCnyPerUsd} onChange={(value) => update("exchangeRateCnyPerUsd", value)} min="0.01" step="0.01" />
          <NumberField label="Gross margin" suffix="%" value={input.targetMarginPercent} onChange={(value) => update("targetMarginPercent", value)} min="0" max="99" step="0.1" />
          <NumberField label="Ocean freight" suffix="USD" value={input.oceanFreightUsd} onChange={(value) => update("oceanFreightUsd", value)} min="0" step="1" />
          <NumberField label="Insurance" suffix="%" value={input.insurancePercent} onChange={(value) => update("insurancePercent", value)} min="0" step="0.1" />
        </div>
      </div>

      <div className="flex min-h-[26rem] flex-col bg-slate-950 p-6 text-white">
        <div className="text-xs font-semibold uppercase text-emerald-400">Draft result</div>
        {quote ? (
          <>
            <div className="mt-5 border-b border-slate-800 pb-5">
              <div className="text-xs text-slate-400">CIF unit price</div>
              <div className="mt-1 text-3xl font-bold">{usd(quote.cifPerMtUsd)}</div>
              <div className="mt-1 text-xs text-slate-400">per metric ton</div>
            </div>
            <dl className="mt-5 space-y-3 text-sm">
              <ResultRow label="Cost base" value={usd(quote.costBaseUsd)} />
              <ResultRow label="FOB total" value={usd(quote.fobTotalUsd)} />
              <ResultRow label="Freight + insurance" value={usd(quote.oceanFreightUsd + quote.insuranceUsd)} />
              <ResultRow label="CIF total" value={usd(quote.cifTotalUsd)} strong />
              <ResultRow label="Gross profit" value={usd(quote.expectedGrossProfitUsd)} accent />
            </dl>
            <button type="button" onClick={copySummary} className="mt-auto min-h-10 rounded-md bg-emerald-500 px-4 text-sm font-bold text-slate-950 transition hover:bg-emerald-400">
              {copied ? "Copied" : "Copy quote summary"}
            </button>
          </>
        ) : (
          <div className="mt-8 rounded-md border border-rose-900 bg-rose-950/50 p-4 text-sm text-rose-200">Check quantity, exchange rate, margin, and cost values.</div>
        )}
      </div>
    </section>
  );
}

function OutreachBuilder({ leads, products }: { leads: SalesLead[]; products: ProductOption[] }) {
  const initialLead = leads[0] ?? { ...blankLead(), product: products[0]?.value ?? "Recycled plastic pellets" };
  const [selectedId, setSelectedId] = useState(initialLead.id);
  const [lead, setLead] = useState<SalesLead>(initialLead);
  const [language, setLanguage] = useState<DraftLanguage>("en");
  const [tone, setTone] = useState<DraftTone>("professional");
  const [copied, setCopied] = useState<"subject" | "body" | null>(null);

  const draft = useMemo(() => createFollowUpDraft({ lead, language, tone }), [language, lead, tone]);

  function selectLead(id: string) {
    setSelectedId(id);
    if (id === "manual") {
      setLead({ ...blankLead(), product: products[0]?.value ?? "Recycled plastic pellets" });
      return;
    }
    const selected = leads.find((item) => item.id === id);
    if (selected) setLead(selected);
  }

  function updateLead(key: keyof SalesLead, value: string) {
    setLead((current) => ({ ...current, [key]: value }));
  }

  async function copy(kind: "subject" | "body", value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(kind);
      window.setTimeout(() => setCopied(null), 1600);
    } catch {
      setCopied(null);
    }
  }

  const mailto = lead.email
    ? `mailto:${encodeURIComponent(lead.email)}?subject=${encodeURIComponent(draft.subject)}&body=${encodeURIComponent(draft.body)}`
    : "";

  return (
    <section className="grid overflow-hidden rounded-lg border border-slate-200 bg-white xl:grid-cols-[22rem_minmax(0,1fr)]">
      <div className="border-b border-slate-200 p-5 sm:p-6 xl:border-b-0 xl:border-r">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-bold text-slate-950">Draft context</h2>
            <p className="mt-1 text-xs text-slate-500">Manual template · no provider call</p>
          </div>
          <span className="rounded bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">HUMAN SEND</span>
        </div>

        <div className="mt-5 space-y-4">
          <label className="block">
            <span className="text-xs font-semibold text-slate-600">Inquiry</span>
            <select value={selectedId} onChange={(event) => selectLead(event.target.value)} className={inputClassName}>
              {leads.map((item) => <option key={item.id} value={item.id}>{item.company || item.name} · {item.status}</option>)}
              <option value="manual">Manual prospect</option>
            </select>
          </label>
          <TextField label="Contact name" value={lead.name} onChange={(value) => updateLead("name", value)} />
          <TextField label="Company" value={lead.company} onChange={(value) => updateLead("company", value)} />
          <TextField label="Email" type="email" value={lead.email} onChange={(value) => updateLead("email", value)} />
          <SelectField label="Product" value={lead.product} onChange={(value) => updateLead("product", value)} options={products} includeCurrent />
          <div className="grid grid-cols-2 gap-3">
            <TextField label="Volume" value={lead.volume} onChange={(value) => updateLead("volume", value)} />
            <TextField label="Port" value={lead.port} onChange={(value) => updateLead("port", value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <SelectField label="Language" value={language} onChange={(value) => setLanguage(value as DraftLanguage)} options={[
              { value: "en", label: "English" },
              { value: "fr", label: "French" },
              { value: "pt", label: "Portuguese" },
            ]} />
            <SelectField label="Tone" value={tone} onChange={(value) => setTone(value as DraftTone)} options={[
              { value: "professional", label: "Professional" },
              { value: "warm", label: "Warm" },
              { value: "concise", label: "Concise" },
            ]} />
          </div>
        </div>
      </div>

      <div className="flex min-h-[42rem] flex-col bg-slate-50 p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-xs font-semibold uppercase text-slate-500">Follow-up draft</div>
            <div className="mt-1 text-sm text-slate-500">{lead.status} stage · {language.toUpperCase()}</div>
          </div>
          <div className="flex gap-2">
            {lead.id !== "manual" && (
              <Link href={`/admin/inquiries/${lead.id}`} className="inline-flex min-h-9 items-center rounded-md border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-100">
                Open inquiry
              </Link>
            )}
            {mailto && (
              <a href={mailto} className="inline-flex min-h-9 items-center rounded-md bg-slate-950 px-3 text-xs font-semibold text-white hover:bg-slate-800">
                Open in mail
              </a>
            )}
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-lg border border-slate-200 bg-white">
          <div className="flex items-center gap-3 border-b border-slate-200 px-4 py-3">
            <span className="w-14 text-xs font-semibold text-slate-500">Subject</span>
            <span className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-950">{draft.subject}</span>
            <button type="button" onClick={() => copy("subject", draft.subject)} className="text-xs font-semibold text-emerald-700 hover:underline">
              {copied === "subject" ? "Copied" : "Copy"}
            </button>
          </div>
          <div className="relative min-h-[29rem] p-5">
            <pre className="whitespace-pre-wrap font-sans text-sm leading-7 text-slate-700">{draft.body}</pre>
            <button type="button" onClick={() => copy("body", draft.body)} className="absolute bottom-4 right-4 rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50">
              {copied === "body" ? "Copied" : "Copy body"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

const inputClassName = "mt-1.5 min-h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100";

function NumberField({ label, suffix, value, onChange, min, max, step }: { label: string; suffix: string; value: number; onChange: (value: string) => void; min?: string; max?: string; step?: string }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-slate-600">{label}</span>
      <div className="relative mt-1.5">
        <input type="number" value={value} min={min} max={max} step={step} onChange={(event) => onChange(event.target.value)} className="min-h-10 w-full rounded-md border border-slate-300 bg-white px-3 pr-16 text-sm text-slate-950 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" />
        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[10px] font-bold text-slate-400">{suffix}</span>
      </div>
    </label>
  );
}

function TextField({ label, type = "text", value, onChange }: { label: string; type?: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-slate-600">{label}</span>
      <input type={type} value={value} onChange={(event) => onChange(event.target.value)} className={inputClassName} />
    </label>
  );
}

function SelectField({ label, value, onChange, options, includeCurrent = false }: { label: string; value: string; onChange: (value: string) => void; options: ProductOption[]; includeCurrent?: boolean }) {
  const hasValue = options.some((option) => option.value === value);
  return (
    <label className="block">
      <span className="text-xs font-semibold text-slate-600">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className={inputClassName}>
        {includeCurrent && value && !hasValue && <option value={value}>{value}</option>}
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </label>
  );
}

function ResultRow({ label, value, strong = false, accent = false }: { label: string; value: string; strong?: boolean; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-slate-400">{label}</dt>
      <dd className={`${strong ? "font-bold text-white" : "font-semibold"} ${accent ? "text-emerald-400" : "text-slate-200"}`}>{value}</dd>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    NEW: "bg-emerald-50 text-emerald-700",
    CONTACTED: "bg-sky-50 text-sky-700",
    QUOTED: "bg-violet-50 text-violet-700",
    NEGOTIATING: "bg-amber-50 text-amber-700",
    WON: "bg-green-50 text-green-700",
    LOST: "bg-slate-100 text-slate-600",
  };
  return <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${colors[status] ?? colors.LOST}`}>{status}</span>;
}

function priorityDot(priority: ReturnType<typeof getLeadAction>["priority"]) {
  if (priority === "high") return "bg-rose-500";
  if (priority === "medium") return "bg-amber-400";
  if (priority === "done") return "bg-emerald-500";
  return "bg-slate-400";
}

function statusBar(status: string) {
  const colors: Record<string, string> = {
    NEW: "bg-emerald-500",
    CONTACTED: "bg-sky-500",
    QUOTED: "bg-violet-500",
    NEGOTIATING: "bg-amber-500",
    WON: "bg-green-600",
    LOST: "bg-slate-400",
  };
  return colors[status] ?? colors.LOST;
}

function usd(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}
