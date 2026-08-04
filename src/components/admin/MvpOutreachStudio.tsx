"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createMvpOutreachDraft } from "@/domain/mvp/validation";
import type { SerializedMvpProspect } from "@/lib/mvp-types";

export default function MvpOutreachStudio({ prospect }: { prospect: SerializedMvpProspect | null }) {
  const [price, setPrice] = useState(9);
  const [moq, setMoq] = useState(300);
  const [copied, setCopied] = useState(false);
  const draft = useMemo(() => prospect ? createMvpOutreachDraft({
    company: prospect.company,
    contactName: prospect.contactName,
    wholesalePriceUsd: price,
    moq,
  }) : null, [prospect, price, moq]);

  async function copyDraft() {
    if (!draft) return;
    await navigator.clipboard.writeText(`Subject: ${draft.subject}\n\n${draft.body}`);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <section className="admin-card p-5" aria-labelledby="outreach-title">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2"><Mail className="h-5 w-5 text-emerald-700" /><h2 id="outreach-title" className="font-bold text-slate-900">Outreach studio</h2></div>
          <p className="mt-1 text-xs text-slate-500">Generates a reviewable draft. It never sends automatically.</p>
        </div>
        {prospect && <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800">{prospect.company}</span>}
      </div>

      {!draft ? (
        <div className="mt-5 rounded-lg border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">Select a prospect from the pipeline to generate a personalized draft.</div>
      ) : (
        <div className="mt-5 grid gap-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <NumberInput id="outreach-price" label="Wholesale target (USD)" value={price} onChange={setPrice} />
            <NumberInput id="outreach-moq" label="Initial MOQ" value={moq} onChange={setMoq} />
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Subject</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">{draft.subject}</p>
            <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-700">{draft.body}</p>
          </div>
          <Button type="button" onClick={copyDraft} className="justify-self-start bg-slate-950 hover:bg-emerald-800">
            {copied ? <Check /> : <Copy />}{copied ? "Copied" : "Copy for manual review"}
          </Button>
        </div>
      )}
    </section>
  );
}

function NumberInput({ id, label, value, onChange }: { id: string; label: string; value: number; onChange(value: number): void }) {
  return <div className="space-y-1.5"><Label htmlFor={id}>{label}</Label><Input id={id} type="number" min="0" step="any" value={value} onChange={(event) => onChange(Number(event.target.value))} /></div>;
}
