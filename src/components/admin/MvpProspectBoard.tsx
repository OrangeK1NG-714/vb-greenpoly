"use client";

import { useState } from "react";
import { ExternalLink, Loader2, Plus, Radio, UserRoundSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { MVP_PROSPECT_STAGES, type MvpProspectStage } from "@/domain/mvp/validation";
import type { SerializedMvpProspect } from "@/lib/mvp-types";

const CHANNELS = ["ETSY", "EBAY", "AMAZON", "INDEPENDENT_STORE", "DISTRIBUTOR", "TIKTOK", "OTHER"];
const STAGE_LABELS: Record<MvpProspectStage, string> = {
  RESEARCH: "Research",
  QUALIFIED: "Qualified",
  CONTACTED: "Contacted",
  REPLIED: "Replied",
  SAMPLE_REQUESTED: "Sample request",
  CONDITIONAL_ORDER: "Conditional order",
  WON: "Won",
  DISQUALIFIED: "Disqualified",
};

export default function MvpProspectBoard({
  prospects,
  selectedId,
  onSelected,
  onCreated,
  onUpdated,
}: {
  prospects: SerializedMvpProspect[];
  selectedId: string | null;
  onSelected(id: string): void;
  onCreated(prospect: SerializedMvpProspect): void;
  onUpdated(prospect: SerializedMvpProspect): void;
}) {
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  async function createProspect(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCreating(true);
    setError("");
    const form = event.currentTarget;
    const data = new FormData(form);
    const payload = {
      company: String(data.get("company") ?? ""),
      contactName: String(data.get("contactName") ?? "") || null,
      contactEmail: String(data.get("contactEmail") ?? "") || null,
      contactUrl: String(data.get("contactUrl") ?? "") || null,
      country: String(data.get("country") ?? "") || null,
      sourceChannel: String(data.get("sourceChannel") ?? "OTHER"),
      shopUrl: String(data.get("shopUrl") ?? "") || null,
      sellsSandingDiscs: data.get("sellsSandingDiscs") === "on",
      sellsToolStorage: data.get("sellsToolStorage") === "on",
      evidence: String(data.get("evidence") ?? "") || null,
      targetPriceUsd: nullableNumber(data.get("targetPriceUsd")),
      estimatedMonthlySets: nullableNumber(data.get("estimatedMonthlySets")),
      nextAction: "Review storefront and personalize first contact",
      nextActionAt: null,
      lastContactedAt: null,
      notes: null,
    };
    try {
      const response = await fetch("/api/admin/mvp/prospects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "create_failed");
      onCreated(result.prospect);
      form.reset();
    } catch {
      setError("Could not save this prospect. Check URLs, email and required fields.");
    } finally {
      setCreating(false);
    }
  }

  async function updateProspect(id: string, patch: Record<string, unknown>) {
    setError("");
    try {
      const response = await fetch(`/api/admin/mvp/prospects/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "update_failed");
      onUpdated(result.prospect);
    } catch {
      setError("Could not update the prospect. Refresh and try again.");
    }
  }

  return (
    <section className="grid gap-5 xl:grid-cols-[0.72fr_1.28fr]" aria-labelledby="prospects-title">
      <form onSubmit={createProspect} className="admin-card h-fit p-5">
        <div className="flex items-center gap-2"><Plus className="h-5 w-5 text-emerald-700" /><h2 className="font-bold text-slate-900">Add qualified prospect</h2></div>
        <p className="mt-1 text-xs text-slate-500">Start with public business information. Do not import private or credential-gated data.</p>
        <div className="mt-5 grid gap-4">
          <Field name="company" label="Company / shop" required />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field name="contactName" label="Contact name" />
            <Field name="country" label="Market" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field name="contactEmail" type="email" label="Work email" />
            <Field name="contactUrl" type="url" label="Contact page" placeholder="https://" />
          </div>
          <Field name="shopUrl" type="url" label="Storefront evidence" placeholder="https://" />
          <div className="space-y-1.5">
            <Label htmlFor="mvp-source">Source channel</Label>
            <select id="mvp-source" name="sourceChannel" className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm">
              {CHANNELS.map((channel) => <option key={channel}>{channel}</option>)}
            </select>
          </div>
          <div className="grid gap-3 rounded-lg bg-slate-50 p-3 text-sm sm:grid-cols-2">
            <CheckField name="sellsSandingDiscs" label="Sells sanding discs" />
            <CheckField name="sellsToolStorage" label="Sells tool storage" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field name="targetPriceUsd" type="number" label="Buyer target USD" min="0" step="0.01" />
            <Field name="estimatedMonthlySets" type="number" label="Potential sets / month" min="0" step="1" />
          </div>
          <div className="space-y-1.5"><Label htmlFor="mvp-evidence">Qualification evidence</Label><Textarea id="mvp-evidence" name="evidence" placeholder="What exactly makes this business relevant?" /></div>
          <Button type="submit" disabled={creating} className="bg-emerald-700 hover:bg-emerald-800">{creating ? <Loader2 className="animate-spin" /> : <Plus />}{creating ? "Saving…" : "Add to pipeline"}</Button>
          {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
        </div>
      </form>

      <div className="admin-card overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
          <div><div className="flex items-center gap-2"><UserRoundSearch className="h-5 w-5 text-emerald-700" /><h2 id="prospects-title" className="font-bold text-slate-900">Buyer pipeline</h2></div><p className="mt-1 text-xs text-slate-500">Sorted by fit score, then latest evidence.</p></div>
          <span className="font-mono text-xs font-bold text-slate-500">{prospects.length}/100 researched</span>
        </div>
        {prospects.length === 0 ? (
          <div className="p-12 text-center"><Radio className="mx-auto h-8 w-8 text-slate-300" /><p className="mt-3 text-sm text-slate-500">No prospects yet. Add the first qualified store instead of importing a bulk list.</p></div>
        ) : (
          <div className="divide-y divide-slate-200">
            {prospects.map((prospect) => (
              <article key={prospect.id} className={`grid gap-4 p-5 transition sm:grid-cols-[1fr_auto] ${selectedId === prospect.id ? "bg-emerald-50" : "hover:bg-slate-50"}`}>
                <button type="button" onClick={() => onSelected(prospect.id)} className="min-w-0 text-left">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-slate-900">{prospect.company}</span>
                    <span className="rounded bg-slate-950 px-2 py-0.5 font-mono text-[10px] font-bold text-white">FIT {prospect.score}</span>
                    <span className="rounded bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-600 ring-1 ring-slate-200">{prospect.sourceChannel}</span>
                  </div>
                  <p className="mt-1 truncate text-xs text-slate-500">{[prospect.contactName, prospect.country, prospect.contactEmail].filter(Boolean).join(" · ") || "Contact path not recorded"}</p>
                  <p className="mt-2 line-clamp-2 text-sm text-slate-700">{prospect.evidence || prospect.scoreReasons.join(" · ") || "Qualification evidence missing"}</p>
                </button>
                <div className="flex min-w-48 flex-col items-stretch gap-2">
                  <Select value={prospect.stage} onValueChange={(stage) => updateProspect(prospect.id, { stage })}>
                    <SelectTrigger aria-label={`Stage for ${prospect.company}`} className="bg-white"><SelectValue /></SelectTrigger>
                    <SelectContent>{MVP_PROSPECT_STAGES.map((stage) => <SelectItem key={stage} value={stage}>{STAGE_LABELS[stage]}</SelectItem>)}</SelectContent>
                  </Select>
                  <Button type="button" variant="outline" size="sm" onClick={() => updateProspect(prospect.id, { stage: "CONTACTED", lastContactedAt: new Date().toISOString() })}>Mark contacted</Button>
                  {prospect.shopUrl && <a href={prospect.shopUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-1 text-xs font-semibold text-emerald-700 hover:underline">Open evidence <ExternalLink className="h-3 w-3" /></a>}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function nullableNumber(value: FormDataEntryValue | null) {
  const raw = String(value ?? "").trim();
  return raw ? Number(raw) : null;
}

function Field({ name, label, type = "text", required, placeholder, min, step }: { name: string; label: string; type?: string; required?: boolean; placeholder?: string; min?: string; step?: string }) {
  return <div className="space-y-1.5"><Label htmlFor={`mvp-${name}`}>{label}{required ? " *" : ""}</Label><Input id={`mvp-${name}`} name={name} type={type} required={required} placeholder={placeholder} min={min} step={step} /></div>;
}

function CheckField({ name, label }: { name: string; label: string }) {
  return <label className="flex items-center gap-2"><input type="checkbox" name={name} className="h-4 w-4 rounded border-slate-300 accent-emerald-700" /><span>{label}</span></label>;
}
