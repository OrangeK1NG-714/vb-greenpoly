"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  calculateTradeQuote,
  compareSampleVersions,
  createFactoryHandoffSummary,
  createQuoteCustomerDraft,
  createSampleCustomerConfirmation,
  validateQuoteDraft,
  validateSampleSnapshot,
  type QuoteDraftData,
  type QuoteFieldName,
  type QuoteStatus,
  type SalesLead,
  type SampleFieldName,
  type SampleSnapshot,
  type SampleStatus,
  type TradeTodo,
} from "@/lib/sales-tools";

export type TradeProductOption = { value: string; label: string };

const fieldClass = "mt-1.5 min-h-10 w-full rounded-md border bg-white px-3 text-sm text-slate-950 outline-none transition disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500";
const normalBorder = "border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100";
const issueBorder = "border-amber-400 bg-amber-50/40 focus:border-amber-500 focus:ring-2 focus:ring-amber-100";
const primaryButton = "inline-flex min-h-10 items-center justify-center rounded-md bg-slate-950 px-4 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300";
const secondaryButton = "inline-flex min-h-10 items-center justify-center rounded-md border border-slate-300 bg-white px-4 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300";

const QUOTE_LABELS: Partial<Record<QuoteFieldName, string>> = {
  product: "Product",
  grade: "Grade",
  quantityMt: "Quantity",
  quantityUnit: "Unit",
  currency: "Currency",
  incoterm: "Incoterm",
  originPort: "Origin port",
  destinationPort: "Destination port",
  supplierCostCnyPerMt: "Supplier cost",
  inlandAndPortCny: "Inland + port",
  documentsCny: "Documents",
  exchangeRateCnyPerUsd: "FX rate",
  targetMarginPercent: "Gross margin",
  oceanFreightUsd: "Ocean freight",
  insurancePercent: "Insurance",
  paymentTerms: "Payment terms",
  packaging: "Packaging",
  leadTime: "Lead time",
  validUntil: "Valid until",
  followUpAt: "Follow-up time",
};

const SAMPLE_LABELS: Record<SampleFieldName, string> = {
  product: "Product",
  grade: "Grade",
  application: "Application",
  appearance: "Colour / appearance",
  technicalRequirements: "Technical requirements",
  quantity: "Sample quantity",
  quantityUnit: "Unit",
  packaging: "Packaging",
  acceptanceCriteria: "Acceptance focus",
  targetConfirmationDate: "Confirmation target",
};

type ApiEnvelope<T> = { ok: boolean; error?: string; fields?: string[] } & T;

async function mutate<T>(url: string, method: "POST" | "PATCH", body: unknown): Promise<T> {
  const response = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const payload = await response.json() as ApiEnvelope<T>;
  if (!response.ok) {
    const detail = payload.fields?.length ? `: ${payload.fields.join(", ")}` : "";
    throw new Error(`${(payload.error ?? "request_failed").replaceAll("_", " ")}${detail}`);
  }
  return payload;
}

function replaceRecord<T extends { id?: string }>(records: T[], next: T): T[] {
  return [next, ...records.filter((record) => record.id !== next.id)];
}

function leadName(leads: SalesLead[], inquiryId: string): string {
  const lead = leads.find((item) => item.id === inquiryId);
  return lead?.company || lead?.name || "Unknown inquiry";
}

export function TradeTodoPanel({ todos, leads }: { todos: TradeTodo[]; leads: SalesLead[] }) {
  return (
    <section className="overflow-hidden rounded-lg border border-slate-800 bg-slate-950 text-white shadow-sm">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-800 px-5 py-4">
        <div>
          <div className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400">Operator guardrails</div>
          <h2 className="mt-1 font-bold">Commercial next steps</h2>
          <p className="mt-1 text-xs text-slate-400">Only missing, due, or human-confirmation work appears here.</p>
        </div>
        <span className="rounded border border-slate-700 px-2 py-1 font-mono text-xs text-slate-300">{todos.length} OPEN</span>
      </div>
      {todos.length === 0 ? (
        <div className="px-5 py-8 text-sm text-slate-300">No quote or sample guardrail tasks are currently due.</div>
      ) : (
        <div className="grid divide-y divide-slate-800 lg:grid-cols-2 lg:divide-x lg:divide-y-0">
          {todos.slice(0, 8).map((todo, index) => (
            <div key={`${todo.kind}-${todo.inquiryId}-${index}`} className="grid grid-cols-[auto_minmax(0,1fr)_auto] gap-3 px-5 py-4 even:border-t even:border-slate-800 lg:[&:nth-child(n+3)]:border-t lg:[&:nth-child(n+3)]:border-slate-800">
              <span className={`mt-1 h-2 w-2 rounded-full ${todo.priority === "high" ? "bg-rose-400" : "bg-amber-300"}`} />
              <div className="min-w-0">
                <div className="truncate text-sm font-bold">{todo.title}</div>
                <div className="mt-1 truncate text-xs text-slate-400">{leadName(leads, todo.inquiryId)} · {todo.detail}</div>
              </div>
              <Link href={`/admin/inquiries/${todo.inquiryId}`} className="text-xs font-bold text-emerald-400 hover:text-emerald-300">Inquiry</Link>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function blankQuote(lead?: SalesLead): QuoteDraftData {
  const knownIncoterm = lead?.incoterms?.trim().toUpperCase();
  return {
    inquiryId: lead?.id ?? "",
    status: "DRAFT",
    product: lead?.product ?? "",
    grade: "",
    quantityMt: null,
    quantityUnit: "",
    currency: "",
    incoterm: knownIncoterm === "FOB" || knownIncoterm === "CIF" ? knownIncoterm : "",
    originPort: "",
    destinationPort: lead?.port ?? "",
    supplierCostCnyPerMt: null,
    inlandAndPortCny: null,
    documentsCny: null,
    exchangeRateCnyPerUsd: null,
    targetMarginPercent: null,
    oceanFreightUsd: null,
    insurancePercent: null,
    paymentTerms: "",
    packaging: "",
    leadTime: "",
    validUntil: null,
    followUpAt: null,
    sentAt: null,
  };
}

function quotePayload(draft: QuoteDraftData) {
  return {
    product: draft.product,
    grade: draft.grade,
    quantityMt: draft.quantityMt,
    quantityUnit: draft.quantityUnit,
    currency: draft.currency,
    incoterm: draft.incoterm,
    originPort: draft.originPort,
    destinationPort: draft.destinationPort,
    supplierCostCnyPerMt: draft.supplierCostCnyPerMt,
    inlandAndPortCny: draft.inlandAndPortCny,
    documentsCny: draft.documentsCny,
    exchangeRateCnyPerUsd: draft.exchangeRateCnyPerUsd,
    targetMarginPercent: draft.targetMarginPercent,
    oceanFreightUsd: draft.oceanFreightUsd,
    insurancePercent: draft.insurancePercent,
    paymentTerms: draft.paymentTerms,
    packaging: draft.packaging,
    leadTime: draft.leadTime,
    validUntil: draft.validUntil,
    followUpAt: draft.followUpAt,
  };
}

export function QuoteWorkbench({
  leads,
  products,
  quotes,
  onQuotesChange,
}: {
  leads: SalesLead[];
  products: TradeProductOption[];
  quotes: QuoteDraftData[];
  onQuotesChange: (quotes: QuoteDraftData[]) => void;
}) {
  const initialLead = leads[0];
  const initialRecord = quotes.find((quote) => quote.inquiryId === initialLead?.id);
  const [inquiryId, setInquiryId] = useState(initialLead?.id ?? "");
  const [selectedId, setSelectedId] = useState(initialRecord?.id ?? "new");
  const [draft, setDraft] = useState<QuoteDraftData>(initialRecord ?? blankQuote(initialLead));
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ tone: "ok" | "error"; text: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const currentLead = leads.find((lead) => lead.id === inquiryId);
  const inquiryQuotes = quotes.filter((quote) => quote.inquiryId === inquiryId);
  const existing = selectedId === "new" ? undefined : quotes.find((quote) => quote.id === selectedId);
  const validation = useMemo(() => validateQuoteDraft(draft), [draft]);
  const missing = new Set(validation.missingFields);
  const invalid = new Set(validation.invalidFields);
  const result = useMemo(() => {
    try {
      return calculateTradeQuote(draft);
    } catch {
      return null;
    }
  }, [draft]);
  const fobPreview = useMemo(() => {
    if (!validation.canCalculateFob || draft.incoterm === "FOB") return result;
    try {
      return calculateTradeQuote({ ...draft, incoterm: "FOB" });
    } catch {
      return null;
    }
  }, [draft, result, validation.canCalculateFob]);
  const commercialLocked = existing?.status === "SENT_MANUALLY" || existing?.status === "ARCHIVED";

  function issue(field: QuoteFieldName) {
    return missing.has(field) ? "Required" : invalid.has(field) ? "Invalid" : undefined;
  }

  function update<K extends keyof QuoteDraftData>(key: K, value: QuoteDraftData[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
    setDirty(true);
    setMessage(null);
  }

  function chooseInquiry(nextId: string) {
    const lead = leads.find((item) => item.id === nextId);
    const record = quotes.find((quote) => quote.inquiryId === nextId);
    setInquiryId(nextId);
    setSelectedId(record?.id ?? "new");
    setDraft(record ?? blankQuote(lead));
    setDirty(false);
    setMessage(null);
  }

  function chooseQuote(id: string) {
    const record = quotes.find((quote) => quote.id === id);
    setSelectedId(id);
    setDraft(record ?? blankQuote(currentLead));
    setDirty(false);
    setMessage(null);
  }

  async function save() {
    if (!inquiryId) return;
    setBusy(true);
    setMessage(null);
    try {
      const payload = existing
        ? await mutate<{ quote: QuoteDraftData }>(`/api/admin/sales/quotes/${existing.id}`, "PATCH", quotePayload(draft))
        : await mutate<{ quote: QuoteDraftData }>("/api/admin/sales/quotes", "POST", { inquiryId, ...quotePayload(draft) });
      onQuotesChange(replaceRecord(quotes, payload.quote));
      setSelectedId(payload.quote.id ?? "new");
      setDraft(payload.quote);
      setDirty(false);
      setMessage({ tone: "ok", text: existing ? "Quote changes saved." : "Draft created and linked to this inquiry." });
    } catch (error) {
      setMessage({ tone: "error", text: error instanceof Error ? error.message : "Quote save failed" });
    } finally {
      setBusy(false);
    }
  }

  async function changeStatus(status: QuoteStatus) {
    if (!existing?.id) return;
    setBusy(true);
    setMessage(null);
    try {
      const payload = await mutate<{ quote: QuoteDraftData }>(`/api/admin/sales/quotes/${existing.id}`, "PATCH", { status });
      onQuotesChange(replaceRecord(quotes, payload.quote));
      setDraft(payload.quote);
      setDirty(false);
      setMessage({ tone: "ok", text: status === "SENT_MANUALLY" ? "Recorded as manually sent. No message was sent by this workspace." : `Status changed to ${status}.` });
    } catch (error) {
      setMessage({ tone: "error", text: error instanceof Error ? error.message : "Status update failed" });
    } finally {
      setBusy(false);
    }
  }

  async function copyCustomerDraft() {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(createQuoteCustomerDraft(draft, result));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  if (leads.length === 0) return <EmptyWorkbench title="No inquiries available" detail="A quote draft must stay linked to an existing inquiry." />;

  return (
    <div className="space-y-5">
      <WorkbenchHeader
        eyebrow="Commercial control sheet"
        title="Quote guardrail"
        detail="Unknown values stay blank. Review status and manual sending are separate operator actions."
        badge="NO AUTO-SEND"
      />

      <div className="grid gap-4 rounded-lg border border-slate-200 bg-white p-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] lg:items-end">
        <SelectInput label="Inquiry" value={inquiryId} onChange={chooseInquiry} options={leads.map((lead) => ({ value: lead.id, label: `${lead.company || lead.name} · ${lead.status}` }))} />
        <SelectInput label="Saved quote" value={selectedId} onChange={chooseQuote} options={[
          ...inquiryQuotes.map((quote, index) => ({ value: quote.id ?? "", label: `${index + 1}. ${quote.status} · ${quote.updatedAt?.slice(0, 10) ?? "unsaved"}` })),
          { value: "new", label: "New quote draft" },
        ]} />
        <button type="button" className={secondaryButton} onClick={() => chooseQuote("new")}>New draft</button>
      </div>

      <div className="grid overflow-hidden rounded-lg border border-slate-200 bg-white 2xl:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
            <div>
              <div className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Input ledger</div>
              <div className="mt-1 text-sm text-slate-600">{currentLead?.company || currentLead?.name} · prefilled inquiry values still require review</div>
            </div>
            <StatusPill status={draft.status} />
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <TextInput label="Product" value={draft.product} onChange={(value) => update("product", value)} issue={issue("product")} disabled={commercialLocked} list="trade-products" />
            <datalist id="trade-products">{products.map((product) => <option key={product.value} value={product.value} />)}</datalist>
            <TextInput label="Grade / code" value={draft.grade} onChange={(value) => update("grade", value)} issue={issue("grade")} disabled={commercialLocked} />
            <NumberInput label="Quantity" value={draft.quantityMt} suffix="MT basis" onChange={(value) => update("quantityMt", value)} issue={issue("quantityMt")} disabled={commercialLocked} />
            <SelectInput label="Quantity unit" value={draft.quantityUnit} onChange={(value) => update("quantityUnit", value)} issue={issue("quantityUnit")} disabled={commercialLocked} options={[{ value: "", label: "Select unit" }, { value: "MT", label: "Metric ton (MT)" }]} />
            <SelectInput label="Currency" value={draft.currency} onChange={(value) => update("currency", value)} issue={issue("currency")} disabled={commercialLocked} options={[{ value: "", label: "Select currency" }, { value: "USD", label: "USD" }]} />
            <SelectInput label="Incoterm" value={draft.incoterm} onChange={(value) => update("incoterm", value)} issue={issue("incoterm")} disabled={commercialLocked} options={[{ value: "", label: "Select term" }, { value: "FOB", label: "FOB" }, { value: "CIF", label: "CIF" }]} />
            <TextInput label="Origin port" value={draft.originPort} onChange={(value) => update("originPort", value)} issue={issue("originPort")} disabled={commercialLocked} />
            <TextInput label="Destination port" value={draft.destinationPort} onChange={(value) => update("destinationPort", value)} issue={draft.incoterm === "CIF" ? issue("destinationPort") : undefined} disabled={commercialLocked || draft.incoterm !== "CIF"} />
            <NumberInput label="Supplier cost" value={draft.supplierCostCnyPerMt} suffix="CNY/MT" onChange={(value) => update("supplierCostCnyPerMt", value)} issue={issue("supplierCostCnyPerMt")} disabled={commercialLocked} />
            <NumberInput label="Inland + port" value={draft.inlandAndPortCny} suffix="CNY" onChange={(value) => update("inlandAndPortCny", value)} issue={issue("inlandAndPortCny")} disabled={commercialLocked} allowZero />
            <NumberInput label="Documents" value={draft.documentsCny} suffix="CNY" onChange={(value) => update("documentsCny", value)} issue={issue("documentsCny")} disabled={commercialLocked} allowZero />
            <NumberInput label="Exchange rate" value={draft.exchangeRateCnyPerUsd} suffix="CNY/USD" onChange={(value) => update("exchangeRateCnyPerUsd", value)} issue={issue("exchangeRateCnyPerUsd")} disabled={commercialLocked} />
            <NumberInput label="Gross margin" value={draft.targetMarginPercent} suffix="%" onChange={(value) => update("targetMarginPercent", value)} issue={issue("targetMarginPercent")} disabled={commercialLocked} allowZero />
            <NumberInput label="Ocean freight" value={draft.oceanFreightUsd} suffix="USD" onChange={(value) => update("oceanFreightUsd", value)} issue={draft.incoterm === "CIF" ? issue("oceanFreightUsd") : undefined} disabled={commercialLocked || draft.incoterm !== "CIF"} allowZero />
            <NumberInput label="Insurance" value={draft.insurancePercent} suffix="%" onChange={(value) => update("insurancePercent", value)} issue={draft.incoterm === "CIF" ? issue("insurancePercent") : undefined} disabled={commercialLocked || draft.incoterm !== "CIF"} allowZero />
            <TextInput label="Payment terms" value={draft.paymentTerms} onChange={(value) => update("paymentTerms", value)} issue={issue("paymentTerms")} disabled={commercialLocked} />
            <TextInput label="Packaging" value={draft.packaging} onChange={(value) => update("packaging", value)} issue={issue("packaging")} disabled={commercialLocked} />
            <TextInput label="Lead time" value={draft.leadTime} onChange={(value) => update("leadTime", value)} issue={issue("leadTime")} disabled={commercialLocked} />
            <DateInput label="Valid until" value={draft.validUntil} onChange={(value) => update("validUntil", value)} issue={issue("validUntil")} disabled={commercialLocked} />
            <DateTimeInput label="Manual follow-up" value={draft.followUpAt} onChange={(value) => update("followUpAt", value)} issue={issue("followUpAt")} disabled={existing?.status === "ARCHIVED"} />
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-slate-200 pt-5">
            <button type="button" onClick={save} disabled={busy || !dirty && Boolean(existing) || existing?.status === "ARCHIVED"} className={primaryButton}>{busy ? "Saving…" : existing ? "Save changes" : "Create draft"}</button>
            {existing?.status === "DRAFT" && <button type="button" onClick={() => changeStatus("READY_TO_REVIEW")} disabled={busy || dirty || !validation.canMarkReady} className={secondaryButton}>Mark ready for review</button>}
            {existing?.status === "READY_TO_REVIEW" && <button type="button" onClick={() => changeStatus("SENT_MANUALLY")} disabled={busy || dirty} className={secondaryButton}>Record manual send</button>}
            {existing && existing.status !== "ARCHIVED" && <button type="button" onClick={() => changeStatus("ARCHIVED")} disabled={busy || dirty} className="min-h-10 px-2 text-sm font-bold text-slate-500 hover:text-slate-950 disabled:text-slate-300">Archive</button>}
            {dirty && existing?.status !== "ARCHIVED" && <span className="text-xs font-semibold text-amber-700">Save changes before a status action.</span>}
          </div>
          {message && <InlineMessage {...message} />}
        </div>

        <aside className="flex min-h-[38rem] flex-col bg-slate-950 p-6 text-white">
          <div className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400">Formula & release gate</div>
          <div className="mt-5">
            <div className="text-xs text-slate-400">{result ? `${result.incoterm} unit price` : fobPreview ? "FOB preview" : "Quoted unit price"}</div>
            <div className="mt-1 font-mono text-3xl font-bold">{result ? usd(result.quotedPerMtUsd) : fobPreview ? usd(fobPreview.fobPerMtUsd) : "—"}</div>
            <div className="mt-1 text-xs text-slate-500">No field is substituted with a market default.</div>
          </div>

          {(result || fobPreview) && (
            <dl className="mt-6 space-y-3 border-y border-slate-800 py-5 text-sm">
              <FormulaRow label="CNY cost base / FX" value={usd((result ?? fobPreview)!.costBaseUsd)} />
              <FormulaRow label="FOB total" value={usd((result ?? fobPreview)!.fobTotalUsd)} />
              <FormulaRow label="Gross profit" value={usd((result ?? fobPreview)!.expectedGrossProfitUsd)} accent />
              {result?.incoterm === "CIF" && <>
                <FormulaRow label="Ocean freight" value={usd(result.oceanFreightUsd)} />
                <FormulaRow label="Insurance" value={usd(result.insuranceUsd)} />
                <FormulaRow label="CIF total" value={usd(result.cifTotalUsd)} strong />
              </>}
            </dl>
          )}

          <div className="mt-5">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wide text-slate-400"><span>Release checklist</span><span>{validation.canMarkReady ? "COMPLETE" : "HOLD"}</span></div>
            {validation.canMarkReady ? (
              <div className="mt-3 rounded border border-emerald-800 bg-emerald-950/40 p-3 text-sm text-emerald-200">All required terms are present. Human review is still required.</div>
            ) : (
              <div className="mt-3 flex flex-wrap gap-2">
                {[...validation.missingFields, ...validation.invalidFields].map((field) => <span key={field} className="rounded border border-amber-800 bg-amber-950/40 px-2 py-1 text-xs text-amber-200">{QUOTE_LABELS[field] ?? field}</span>)}
              </div>
            )}
          </div>

          <button type="button" onClick={copyCustomerDraft} disabled={!result || !validation.canMarkReady} className="mt-auto min-h-10 rounded-md bg-emerald-400 px-4 text-sm font-bold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:bg-slate-800 disabled:text-slate-500">
            {copied ? "Customer draft copied" : "Copy English quote draft"}
          </button>
          <p className="mt-2 text-center text-[11px] text-slate-500">Copy only. This action never sends a message.</p>
        </aside>
      </div>
    </div>
  );
}

function blankSample(lead?: SalesLead): SampleSnapshot {
  return {
    inquiryId: lead?.id ?? "",
    version: 1,
    status: "NEEDS_INFORMATION",
    product: lead?.product ?? "",
    grade: "",
    application: "",
    appearance: "",
    technicalRequirements: "",
    quantity: null,
    quantityUnit: "",
    packaging: "",
    acceptanceCriteria: "",
    targetConfirmationDate: null,
    customerConfirmedAt: null,
    handedToFactoryAt: null,
  };
}

function samplePayload(draft: SampleSnapshot) {
  return {
    product: draft.product,
    grade: draft.grade,
    application: draft.application,
    appearance: draft.appearance,
    technicalRequirements: draft.technicalRequirements,
    quantity: draft.quantity,
    quantityUnit: draft.quantityUnit,
    packaging: draft.packaging,
    acceptanceCriteria: draft.acceptanceCriteria,
    targetConfirmationDate: draft.targetConfirmationDate,
  };
}

export function SampleWorkbench({
  leads,
  products,
  samples,
  onSamplesChange,
}: {
  leads: SalesLead[];
  products: TradeProductOption[];
  samples: SampleSnapshot[];
  onSamplesChange: (samples: SampleSnapshot[]) => void;
}) {
  const initialLead = leads[0];
  const initialRecord = samples.find((sample) => sample.inquiryId === initialLead?.id);
  const [inquiryId, setInquiryId] = useState(initialLead?.id ?? "");
  const [selectedId, setSelectedId] = useState(initialRecord?.id ?? "new");
  const [draft, setDraft] = useState<SampleSnapshot>(initialRecord ?? blankSample(initialLead));
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ tone: "ok" | "error"; text: string } | null>(null);
  const [copied, setCopied] = useState<"customer" | "factory" | null>(null);

  const currentLead = leads.find((lead) => lead.id === inquiryId);
  const inquirySamples = samples.filter((sample) => sample.inquiryId === inquiryId).sort((a, b) => b.version - a.version);
  const latest = inquirySamples[0];
  const existing = selectedId === "new" ? undefined : samples.find((sample) => sample.id === selectedId);
  const historical = Boolean(existing && latest && existing.id !== latest.id);
  const validation = useMemo(() => validateSampleSnapshot(draft), [draft]);
  const comparison = useMemo(() => existing ? compareSampleVersions(existing, draft) : null, [draft, existing]);
  const missing = new Set(validation.missingFields);
  const invalid = new Set(validation.invalidFields);
  const complete = validation.missingFields.length === 0 && validation.invalidFields.length === 0;

  function issue(field: SampleFieldName) {
    return missing.has(field) ? "Required" : invalid.has(field) ? "Invalid" : undefined;
  }

  function update<K extends keyof SampleSnapshot>(key: K, value: SampleSnapshot[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
    setDirty(true);
    setMessage(null);
  }

  function chooseInquiry(nextId: string) {
    const lead = leads.find((item) => item.id === nextId);
    const record = samples.filter((sample) => sample.inquiryId === nextId).sort((a, b) => b.version - a.version)[0];
    setInquiryId(nextId);
    setSelectedId(record?.id ?? "new");
    setDraft(record ?? blankSample(lead));
    setDirty(false);
    setMessage(null);
  }

  function chooseVersion(id: string) {
    const record = samples.find((sample) => sample.id === id);
    setSelectedId(id);
    setDraft(record ?? blankSample(currentLead));
    setDirty(false);
    setMessage(null);
  }

  async function createVersion(sourceId?: string) {
    setBusy(true);
    setMessage(null);
    try {
      const payload = await mutate<{ sample: SampleSnapshot }>("/api/admin/sales/samples", "POST", {
        inquiryId,
        sourceVersionId: sourceId,
        ...samplePayload(draft),
      });
      onSamplesChange(replaceRecord(samples, payload.sample));
      setSelectedId(payload.sample.id ?? "new");
      setDraft(payload.sample);
      setDirty(false);
      setMessage({ tone: "ok", text: sourceId ? `Version ${payload.sample.version} created; customer confirmation was reset.` : "Sample card created." });
    } catch (error) {
      setMessage({ tone: "error", text: error instanceof Error ? error.message : "Sample create failed" });
    } finally {
      setBusy(false);
    }
  }

  async function save() {
    if (!existing?.id) return createVersion();
    if (comparison?.requiresNewVersion) return createVersion(existing.id);
    setBusy(true);
    setMessage(null);
    try {
      const payload = await mutate<{ sample: SampleSnapshot }>(`/api/admin/sales/samples/${existing.id}`, "PATCH", samplePayload(draft));
      onSamplesChange(replaceRecord(samples, payload.sample));
      setDraft(payload.sample);
      setDirty(false);
      setMessage({ tone: "ok", text: "Sample card changes saved." });
    } catch (error) {
      setMessage({ tone: "error", text: error instanceof Error ? error.message : "Sample save failed" });
    } finally {
      setBusy(false);
    }
  }

  async function changeStatus(status: SampleStatus) {
    if (!existing?.id) return;
    setBusy(true);
    setMessage(null);
    try {
      const payload = await mutate<{ sample: SampleSnapshot }>(`/api/admin/sales/samples/${existing.id}`, "PATCH", { status });
      onSamplesChange(replaceRecord(samples, payload.sample));
      setDraft(payload.sample);
      setDirty(false);
      setMessage({ tone: "ok", text: status === "AWAITING_CONFIRMATION" ? "Recorded as awaiting customer confirmation. No message was sent." : `Status changed to ${status}.` });
    } catch (error) {
      setMessage({ tone: "error", text: error instanceof Error ? error.message : "Status update failed" });
    } finally {
      setBusy(false);
    }
  }

  async function copy(kind: "customer" | "factory") {
    try {
      const text = kind === "customer" ? createSampleCustomerConfirmation(draft) : createFactoryHandoffSummary(draft);
      await navigator.clipboard.writeText(text);
      setCopied(kind);
      window.setTimeout(() => setCopied(null), 1600);
    } catch {
      setCopied(null);
    }
  }

  if (leads.length === 0) return <EmptyWorkbench title="No inquiries available" detail="A sample version must stay linked to an existing inquiry." />;
  const confirmedAndChanged = Boolean(comparison?.requiresNewVersion);
  const contentReadOnly = historical || existing?.status === "CANCELLED";

  return (
    <div className="space-y-5">
      <WorkbenchHeader
        eyebrow="Version-controlled specification"
        title="Sample confirmation cards"
        detail="Customer-confirmed product, quantity, packaging, technical, or acceptance changes create a new version."
        badge="TRACEABLE"
      />

      <div className="grid gap-4 rounded-lg border border-slate-200 bg-white p-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] lg:items-end">
        <SelectInput label="Inquiry" value={inquiryId} onChange={chooseInquiry} options={leads.map((lead) => ({ value: lead.id, label: `${lead.company || lead.name} · ${lead.status}` }))} />
        <SelectInput label="Version" value={selectedId} onChange={chooseVersion} options={[
          ...inquirySamples.map((sample) => ({ value: sample.id ?? "", label: `Version ${sample.version} · ${sample.status}` })),
          ...(inquirySamples.length === 0 ? [{ value: "new", label: "New sample card" }] : []),
        ]} />
        {latest?.id ? <button type="button" className={secondaryButton} disabled={busy || historical || dirty} onClick={() => createVersion(latest.id)}>Create next version</button> : <span className="text-xs text-slate-500">Version 1 starts blank</span>}
      </div>

      <div className="grid overflow-hidden rounded-lg border border-slate-200 bg-white 2xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
            <div>
              <div className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Specification snapshot</div>
              <div className="mt-1 text-sm text-slate-600">Version {draft.version} · {currentLead?.company || currentLead?.name}</div>
            </div>
            <div className="flex items-center gap-2">
              {historical && <span className="rounded bg-slate-100 px-2 py-1 text-xs font-bold text-slate-500">HISTORICAL · READ ONLY</span>}
              <StatusPill status={draft.status} />
            </div>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <TextInput label="Product" value={draft.product} onChange={(value) => update("product", value)} issue={issue("product")} disabled={contentReadOnly} list="sample-products" />
            <datalist id="sample-products">{products.map((product) => <option key={product.value} value={product.value} />)}</datalist>
            <TextInput label="Grade / code" value={draft.grade} onChange={(value) => update("grade", value)} issue={issue("grade")} disabled={contentReadOnly} />
            <TextAreaInput label="Application" value={draft.application} onChange={(value) => update("application", value)} issue={issue("application")} disabled={contentReadOnly} />
            <TextAreaInput label="Colour / appearance" value={draft.appearance} onChange={(value) => update("appearance", value)} issue={issue("appearance")} disabled={contentReadOnly} />
            <TextAreaInput label="Technical requirements" value={draft.technicalRequirements} onChange={(value) => update("technicalRequirements", value)} issue={issue("technicalRequirements")} disabled={contentReadOnly} />
            <TextAreaInput label="Customer acceptance focus" value={draft.acceptanceCriteria} onChange={(value) => update("acceptanceCriteria", value)} issue={issue("acceptanceCriteria")} disabled={contentReadOnly} />
            <NumberInput label="Sample quantity" value={draft.quantity} suffix={draft.quantityUnit || "unit"} onChange={(value) => update("quantity", value)} issue={issue("quantity")} disabled={contentReadOnly} />
            <SelectInput label="Quantity unit" value={draft.quantityUnit} onChange={(value) => update("quantityUnit", value)} issue={issue("quantityUnit")} disabled={contentReadOnly} options={[{ value: "", label: "Select unit" }, { value: "g", label: "gram (g)" }, { value: "kg", label: "kilogram (kg)" }, { value: "bag", label: "bag" }]} />
            <TextAreaInput label="Packaging" value={draft.packaging} onChange={(value) => update("packaging", value)} issue={issue("packaging")} disabled={contentReadOnly} />
            <DateInput label="Customer confirmation target" value={draft.targetConfirmationDate} onChange={(value) => update("targetConfirmationDate", value)} issue={issue("targetConfirmationDate")} disabled={contentReadOnly} />
          </div>

          {confirmedAndChanged && (
            <div className="mt-5 rounded-md border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
              <strong>New version required.</strong> Changed confirmed fields: {comparison?.changedFields.map((field) => SAMPLE_LABELS[field]).join(", ")}. Saving will create version {draft.version + 1} and reset customer confirmation.
            </div>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-slate-200 pt-5">
            <button type="button" onClick={save} disabled={busy || historical || !dirty && Boolean(existing) || existing?.status === "CANCELLED"} className={primaryButton}>{busy ? "Saving…" : confirmedAndChanged ? "Create new version" : existing ? "Save card" : "Create card"}</button>
            {existing?.status === "READY_FOR_CUSTOMER_CONFIRMATION" && <button type="button" onClick={() => changeStatus("AWAITING_CONFIRMATION")} disabled={busy || dirty || !complete} className={secondaryButton}>Record awaiting customer</button>}
            {existing?.status === "AWAITING_CONFIRMATION" && <button type="button" onClick={() => changeStatus("CUSTOMER_CONFIRMED")} disabled={busy || dirty || !complete} className={secondaryButton}>Mark customer confirmed</button>}
            {existing?.status === "CUSTOMER_CONFIRMED" && <button type="button" onClick={() => changeStatus("HANDED_TO_FACTORY")} disabled={busy || dirty} className={secondaryButton}>Mark handed to factory</button>}
            {existing && existing.status !== "CANCELLED" && <button type="button" onClick={() => changeStatus("CANCELLED")} disabled={busy || dirty || historical} className="min-h-10 px-2 text-sm font-bold text-slate-500 hover:text-slate-950 disabled:text-slate-300">Cancel card</button>}
            {dirty && existing && <span className="text-xs font-semibold text-amber-700">Save this snapshot before a status action.</span>}
          </div>
          {message && <InlineMessage {...message} />}
        </div>

        <aside className="flex min-h-[36rem] flex-col bg-amber-50 p-6">
          <div className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-amber-800">Confirmation packet</div>
          <div className="mt-4 border-y border-amber-200 py-5">
            <div className="text-xs font-bold uppercase text-amber-800">Version {draft.version}</div>
            <div className="mt-2 text-xl font-bold text-slate-950">{draft.grade || "Grade pending"}</div>
            <div className="mt-1 text-sm text-slate-600">{draft.product || "Product pending"}</div>
          </div>

          <div className="mt-5">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wide text-slate-500"><span>Snapshot completeness</span><span>{complete ? "READY" : "HOLD"}</span></div>
            {complete ? (
              <div className="mt-3 rounded border border-emerald-200 bg-white p-3 text-sm text-emerald-800">The customer confirmation text is ready for human review and copying.</div>
            ) : (
              <div className="mt-3 flex flex-wrap gap-2">{[...validation.missingFields, ...validation.invalidFields].map((field) => <span key={field} className="rounded border border-amber-300 bg-white px-2 py-1 text-xs text-amber-900">{SAMPLE_LABELS[field]}</span>)}</div>
            )}
          </div>

          <div className="mt-auto space-y-3 pt-8">
            <button type="button" onClick={() => copy("customer")} disabled={!complete} className={primaryButton + " w-full"}>{copied === "customer" ? "Customer text copied" : "Copy customer confirmation"}</button>
            <button type="button" onClick={() => copy("factory")} disabled={draft.status !== "CUSTOMER_CONFIRMED" && draft.status !== "HANDED_TO_FACTORY"} className={secondaryButton + " w-full"}>{copied === "factory" ? "Factory summary copied" : "Copy factory handoff"}</button>
            <p className="text-center text-[11px] text-slate-500">Copy only. Customer and factory communication remains manual.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function WorkbenchHeader({ eyebrow, title, detail, badge }: { eyebrow: string; title: string; detail: string; badge: string }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <div className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-700">{eyebrow}</div>
        <h2 className="mt-1 text-xl font-bold text-slate-950">{title}</h2>
        <p className="mt-1 max-w-3xl text-sm text-slate-500">{detail}</p>
      </div>
      <span className="w-fit rounded border border-emerald-200 bg-emerald-50 px-2 py-1 font-mono text-[10px] font-bold text-emerald-800">{badge}</span>
    </div>
  );
}

function EmptyWorkbench({ title, detail }: { title: string; detail: string }) {
  return <div className="rounded-lg border border-dashed border-slate-300 bg-white px-6 py-16 text-center"><div className="font-bold text-slate-800">{title}</div><p className="mt-1 text-sm text-slate-500">{detail}</p></div>;
}

function InlineMessage({ tone, text }: { tone: "ok" | "error"; text: string }) {
  return <div role="status" className={`mt-4 rounded-md border px-3 py-2 text-sm ${tone === "ok" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-rose-200 bg-rose-50 text-rose-800"}`}>{text}</div>;
}

function FieldLabel({ label, issue }: { label: string; issue?: string }) {
  return <span className="flex items-center justify-between gap-2 text-xs font-semibold text-slate-600"><span>{label}</span>{issue && <span className="font-mono text-[9px] font-bold uppercase text-amber-700">{issue}</span>}</span>;
}

function TextInput({ label, value, onChange, issue, disabled, list }: { label: string; value: string; onChange: (value: string) => void; issue?: string; disabled?: boolean; list?: string }) {
  return <label className="block"><FieldLabel label={label} issue={issue} /><input type="text" list={list} value={value} disabled={disabled} onChange={(event) => onChange(event.target.value)} className={`${fieldClass} ${issue ? issueBorder : normalBorder}`} /></label>;
}

function TextAreaInput({ label, value, onChange, issue, disabled }: { label: string; value: string; onChange: (value: string) => void; issue?: string; disabled?: boolean }) {
  return <label className="block"><FieldLabel label={label} issue={issue} /><textarea rows={3} value={value} disabled={disabled} onChange={(event) => onChange(event.target.value)} className={`${fieldClass} resize-y py-2 ${issue ? issueBorder : normalBorder}`} /></label>;
}

function NumberInput({ label, value, suffix, onChange, issue, disabled, allowZero = false }: { label: string; value: number | null; suffix: string; onChange: (value: number | null) => void; issue?: string; disabled?: boolean; allowZero?: boolean }) {
  return (
    <label className="block">
      <FieldLabel label={label} issue={issue} />
      <div className="relative">
        <input type="number" value={value ?? ""} disabled={disabled} min={allowZero ? "0" : "0.0001"} step="any" onChange={(event) => onChange(event.target.value === "" ? null : Number(event.target.value))} className={`${fieldClass} pr-20 ${issue ? issueBorder : normalBorder}`} />
        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center font-mono text-[9px] font-bold text-slate-400">{suffix}</span>
      </div>
    </label>
  );
}

function SelectInput({ label, value, onChange, options, issue, disabled }: { label: string; value: string; onChange: (value: string) => void; options: Array<{ value: string; label: string }>; issue?: string; disabled?: boolean }) {
  return <label className="block"><FieldLabel label={label} issue={issue} /><select value={value} disabled={disabled} onChange={(event) => onChange(event.target.value)} className={`${fieldClass} ${issue ? issueBorder : normalBorder}`}>{options.map((option) => <option key={`${option.value}-${option.label}`} value={option.value}>{option.label}</option>)}</select></label>;
}

function DateInput({ label, value, onChange, issue, disabled }: { label: string; value: string | null; onChange: (value: string | null) => void; issue?: string; disabled?: boolean }) {
  return <label className="block"><FieldLabel label={label} issue={issue} /><input type="date" value={value?.slice(0, 10) ?? ""} disabled={disabled} onChange={(event) => onChange(event.target.value || null)} className={`${fieldClass} ${issue ? issueBorder : normalBorder}`} /></label>;
}

function DateTimeInput({ label, value, onChange, issue, disabled }: { label: string; value: string | null; onChange: (value: string | null) => void; issue?: string; disabled?: boolean }) {
  const localValue = value ? localDateTimeValue(value) : "";
  return <label className="block"><FieldLabel label={label} issue={issue} /><input type="datetime-local" value={localValue} disabled={disabled} onChange={(event) => onChange(event.target.value ? new Date(event.target.value).toISOString() : null)} className={`${fieldClass} ${issue ? issueBorder : normalBorder}`} /></label>;
}

function localDateTimeValue(value: string): string {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "";
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

function FormulaRow({ label, value, strong = false, accent = false }: { label: string; value: string; strong?: boolean; accent?: boolean }) {
  return <div className="flex items-center justify-between gap-4"><dt className="text-slate-400">{label}</dt><dd className={`font-mono ${strong ? "font-bold text-white" : "text-slate-200"} ${accent ? "text-emerald-400" : ""}`}>{value}</dd></div>;
}

function StatusPill({ status }: { status: string }) {
  const color = status.includes("CONFIRMED") || status === "READY_TO_REVIEW" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : status.includes("SENT") || status.includes("AWAITING") ? "border-sky-200 bg-sky-50 text-sky-800" : status.includes("CANCEL") || status === "ARCHIVED" ? "border-slate-200 bg-slate-100 text-slate-600" : "border-amber-200 bg-amber-50 text-amber-800";
  return <span className={`rounded border px-2 py-1 font-mono text-[10px] font-bold ${color}`}>{status}</span>;
}

function usd(value: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(value);
}
