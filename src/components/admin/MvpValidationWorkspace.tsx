"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, FlaskConical, MessagesSquare, PackageSearch, Send, ShoppingCart } from "lucide-react";
import MvpEconomicsCalculator from "@/components/admin/MvpEconomicsCalculator";
import MvpOutreachStudio from "@/components/admin/MvpOutreachStudio";
import MvpProspectBoard from "@/components/admin/MvpProspectBoard";
import { getExperimentVerdict } from "@/domain/mvp/validation";
import type { SerializedMvpProspect } from "@/lib/mvp-types";

export default function MvpValidationWorkspace({ initialProspects }: { initialProspects: SerializedMvpProspect[] }) {
  const [prospects, setProspects] = useState(initialProspects);
  const [selectedId, setSelectedId] = useState<string | null>(initialProspects[0]?.id ?? null);
  const metrics = useMemo(() => ({
    contacted: prospects.filter((item) => ["CONTACTED", "REPLIED", "SAMPLE_REQUESTED", "CONDITIONAL_ORDER", "WON"].includes(item.stage)).length,
    replies: prospects.filter((item) => ["REPLIED", "SAMPLE_REQUESTED", "CONDITIONAL_ORDER", "WON"].includes(item.stage)).length,
    sampleRequests: prospects.filter((item) => ["SAMPLE_REQUESTED", "CONDITIONAL_ORDER", "WON"].includes(item.stage)).length,
    conditionalOrders: prospects.filter((item) => ["CONDITIONAL_ORDER", "WON"].includes(item.stage)).length,
  }), [prospects]);
  const verdict = getExperimentVerdict(metrics);
  const selected = prospects.find((item) => item.id === selectedId) ?? null;

  function upsertProspect(prospect: SerializedMvpProspect) {
    setProspects((current) => [prospect, ...current.filter((item) => item.id !== prospect.id)].sort((a, b) => b.score - a.score));
    setSelectedId(prospect.id);
  }

  return (
    <div className="space-y-6">
      <header className="mvp-blueprint overflow-hidden border-2 border-slate-950 bg-[#ece9df] p-6 shadow-[8px_8px_0_#0f172a] sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-[0.18em] text-emerald-800"><FlaskConical className="h-4 w-4" />14-day commercial experiment</div>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Sanding organizer validation OS</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">Research qualified buyers, record evidence, generate human-reviewed outreach and reject weak economics before opening a mold.</p>
          </div>
          <Link href="/mvp/sanding-disc-organizer" target="_blank" className="inline-flex h-10 items-center gap-2 border-2 border-slate-950 bg-white px-4 text-sm font-bold transition hover:bg-amber-300">Open buyer page <ArrowUpRight className="h-4 w-4" /></Link>
        </div>
        <div className="mt-7 grid gap-px border border-slate-950 bg-slate-950 sm:grid-cols-4">
          <Metric icon={<Send />} label="Contacted" value={`${metrics.contacted}/50`} />
          <Metric icon={<MessagesSquare />} label="Replies" value={`${metrics.replies}/8`} />
          <Metric icon={<PackageSearch />} label="Sample requests" value={`${metrics.sampleRequests}/3`} />
          <Metric icon={<ShoppingCart />} label="Conditional orders" value={`${metrics.conditionalOrders}/1`} />
        </div>
        <div className={`mt-5 flex flex-wrap items-center justify-between gap-3 border-l-4 p-4 ${verdict.status === "CONTINUE" ? "border-emerald-600 bg-emerald-50" : verdict.status === "STOP" ? "border-red-600 bg-red-50" : "border-amber-500 bg-amber-50"}`}>
          <div><p className="font-bold text-slate-950">{verdict.label}</p><p className="text-sm text-slate-600">{verdict.detail}</p></div>
          <span className="font-mono text-xs font-bold uppercase tracking-wider">Decision: {verdict.status}</span>
        </div>
      </header>

      <MvpProspectBoard prospects={prospects} selectedId={selectedId} onSelected={setSelectedId} onCreated={upsertProspect} onUpdated={upsertProspect} />
      <div className="grid gap-6 xl:grid-cols-2"><MvpOutreachStudio prospect={selected} /><ExperimentRules /></div>
      <MvpEconomicsCalculator />
    </div>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return <div className="bg-[#ece9df] p-4"><div className="flex items-center justify-between text-emerald-800">{icon}<span className="font-mono text-2xl font-black text-slate-950">{value}</span></div><p className="mt-2 text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p></div>;
}

function ExperimentRules() {
  return (
    <section className="admin-card p-5">
      <h2 className="font-bold text-slate-900">Experiment contract</h2>
      <p className="mt-1 text-xs text-slate-500">These rules prevent enthusiasm from becoming inventory.</p>
      <ol className="mt-5 space-y-4 text-sm text-slate-700">
        <li className="flex gap-3"><span className="font-mono font-black text-emerald-700">01</span><span>Collect public business evidence and contact no more than 10–20 qualified prospects per day.</span></li>
        <li className="flex gap-3"><span className="font-mono font-black text-emerald-700">02</span><span>Generate drafts here, then review and send manually through an authorized channel.</span></li>
        <li className="flex gap-3"><span className="font-mono font-black text-emerald-700">03</span><span>Order one physical prototype only after two sample requests or one conditional order.</span></li>
        <li className="flex gap-3"><span className="font-mono font-black text-emerald-700">04</span><span>Do not open an injection mold until a deposit, tooling contribution or aggregated pilot quantity exists.</span></li>
      </ol>
    </section>
  );
}
