import type { Metadata } from "next";
import Link from "next/link";
import { setRequestLocale } from "next-intl/server";
import { Boxes, Check, CircleDotDashed, Factory, Layers3, PackageCheck, Recycle, Ruler, ShieldCheck } from "lucide-react";
import MvpInterestForm from "@/components/marketing/MvpInterestForm";
import { localizedUrl } from "@/lib/seo";

export function generateStaticParams() {
  return [{ locale: "en" }];
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: "Modular 5-Inch Sanding Disc Organizer | Product Validation",
    description: "A development-stage, private-label modular organizer for 5-inch / 125 mm sanding discs.",
    alternates: { canonical: localizedUrl("en", "/mvp/sanding-disc-organizer") },
    robots: { index: locale === "en", follow: true },
  };
}

const GRITS = ["40", "60", "80", "120", "180", "220", "320", "+"];

export default async function SandingDiscOrganizerMvp({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="overflow-hidden bg-[#ece9df] text-slate-950">
      <section className="mvp-blueprint relative isolate border-b border-slate-950/20 px-4 py-16 sm:py-20 lg:py-28">
        <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[1.02fr_0.98fr]">
          <div className="relative z-10">
            <div className="mb-7 inline-flex items-center gap-2 border border-slate-950 bg-amber-300 px-3 py-1 font-mono text-xs font-bold uppercase tracking-[0.18em] shadow-[4px_4px_0_#0f172a]">
              <CircleDotDashed className="h-4 w-4" /> Product validation · not in stock
            </div>
            <p className="font-mono text-sm font-bold uppercase tracking-[0.22em] text-emerald-800">MVP / SD-125 / REV 0.1</p>
            <h1 className="mt-4 max-w-3xl text-5xl font-black leading-[0.94] tracking-[-0.055em] sm:text-6xl lg:text-7xl">
              8 grits.<br />1 repeatable module.
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-700">
              Four identical two-slot modules form a wall-mounted or desktop organizer for 5-inch / 125 mm sanding discs. Designed for private-label sellers who want a compact alternative to bulky wood and metal racks.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#validate" className="inline-flex h-12 items-center bg-slate-950 px-6 font-bold text-white transition hover:-translate-y-0.5 hover:bg-emerald-800" data-track="mvp_hero_validate">
                Evaluate the concept
              </a>
              <Link href="/contact" className="inline-flex h-12 items-center border-2 border-slate-950 px-6 font-bold transition hover:bg-white" data-track="mvp_hero_contact">
                Ask a technical question
              </Link>
            </div>
            <div className="mt-10 grid max-w-2xl grid-cols-3 divide-x divide-slate-950/20 border-y border-slate-950/20 py-4 font-mono text-xs uppercase tracking-wide">
              <div className="pr-4"><strong className="block text-xl font-black">125 mm</strong>disc format</div>
              <div className="px-4"><strong className="block text-xl font-black">4 × 2</strong>modular slots</div>
              <div className="pl-4"><strong className="block text-xl font-black">$8–10</strong>wholesale test</div>
            </div>
          </div>

          <ProductDiagram />
        </div>
      </section>

      <section className="border-b border-slate-950/20 bg-slate-950 px-4 py-14 text-white">
        <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-3">
          <ProofPoint icon={<Layers3 />} code="01" title="One tool, four repeats">
            The commercial hypothesis is a smaller mold and nested shipment, not a giant eight-bin body.
          </ProofPoint>
          <ProofPoint icon={<Recycle />} code="02" title="Material gate first">
            Black recycled HIPS is the candidate. Recycled ABS is the fallback if drop and mounting tests fail.
          </ProofPoint>
          <ProofPoint icon={<ShieldCheck />} code="03" title="Claims stay conditional">
            Capacity, impact performance and recycled content are confirmed only after a traceable physical sample.
          </ProofPoint>
        </div>
      </section>

      <section className="px-4 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="font-mono text-xs font-bold uppercase tracking-[0.22em] text-emerald-800">Validation specification</p>
              <h2 className="mt-3 text-4xl font-black tracking-tight">What the first sample must prove.</h2>
              <p className="mt-5 leading-7 text-slate-600">The sample is an experiment, not a smaller production run. Every claim below has a pass/fail condition.</p>
            </div>
            <div className="grid gap-px overflow-hidden border border-slate-950 bg-slate-950 sm:grid-cols-2">
              {[
                [Ruler, "Fit", "Accept standard 125 mm discs without edge curl or excessive clearance."],
                [PackageCheck, "Pack", "Four modules must nest into a parcel that keeps shipping economics viable."],
                [Factory, "Make", "One injection-molded part repeated four times; no brand-specific interface."],
                [Boxes, "Use", "Stable on a bench and ready for wall mounting with buyer-specified fasteners."],
              ].map(([Icon, title, body]) => {
                const ItemIcon = Icon as typeof Ruler;
                return (
                  <article key={String(title)} className="bg-[#ece9df] p-7">
                    <ItemIcon className="h-6 w-6 text-emerald-800" aria-hidden="true" />
                    <h3 className="mt-5 text-xl font-black">{String(title)}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{String(body)}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section id="validate" className="bg-emerald-900 px-4 py-16 text-white sm:py-24">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.82fr_1.18fr]">
          <div>
            <p className="font-mono text-xs font-bold uppercase tracking-[0.22em] text-amber-300">Buyer evidence gate</p>
            <h2 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">Help decide whether this gets made.</h2>
            <p className="mt-6 max-w-xl text-lg leading-8 text-emerald-100">We open no production mold from compliments. A physical sample starts only after concrete buyer evidence.</p>
            <ul className="mt-8 space-y-4 text-sm text-emerald-50">
              {[
                "A qualified seller requests a sample",
                "The USD 8–10 wholesale target is commercially acceptable",
                "A buyer states the first-order quantity and must-have test",
                "Final specifications are reviewed before any order commitment",
              ].map((item) => (
                <li key={item} className="flex gap-3"><Check className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" />{item}</li>
              ))}
            </ul>
          </div>
          <div className="border border-white/15 bg-emerald-950/50 p-6 shadow-[12px_12px_0_rgba(15,23,42,0.45)] sm:p-8">
            <MvpInterestForm />
          </div>
        </div>
      </section>
    </div>
  );
}

function ProductDiagram() {
  return (
    <div className="relative mx-auto w-full max-w-[590px] border-2 border-slate-950 bg-[#d9d4c7] p-5 shadow-[16px_16px_0_#0f172a] sm:p-8">
      <div className="mb-5 flex items-center justify-between border-b border-slate-950/30 pb-3 font-mono text-[10px] font-bold uppercase tracking-[0.16em]">
        <span>Exploded concept view</span><span>Scale: validation only</span>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {[0, 1, 2, 3].map((module) => (
          <div key={module} className="relative grid h-40 grid-cols-2 gap-2 border-2 border-slate-950 bg-emerald-950 p-3 shadow-[5px_5px_0_#fbbf24] sm:h-48">
            {[0, 1].map((slot) => {
              const grit = GRITS[module * 2 + slot];
              return (
                <div key={grit} className="relative overflow-hidden border border-emerald-300/40 bg-emerald-900">
                  <div className="absolute -right-8 top-4 h-24 w-24 rounded-full border-[10px] border-amber-300 bg-slate-700 shadow-inner sm:h-32 sm:w-32" />
                  <span className="absolute bottom-2 left-2 z-10 bg-[#ece9df] px-2 py-1 font-mono text-[10px] font-black text-slate-950">P{grit}</span>
                </div>
              );
            })}
            <span className="absolute -left-2 -top-3 bg-slate-950 px-2 py-1 font-mono text-[9px] font-bold text-white">M{module + 1}</span>
          </div>
        ))}
      </div>
      <div className="mt-6 flex items-center justify-between font-mono text-[10px] font-bold uppercase tracking-[0.16em]">
        <span>Candidate: recycled black HIPS</span><span>ABS fallback</span>
      </div>
    </div>
  );
}

function ProofPoint({ icon, code, title, children }: { icon: React.ReactNode; code: string; title: string; children: React.ReactNode }) {
  return (
    <article className="border-l border-emerald-500/50 pl-5">
      <div className="flex items-center justify-between text-emerald-300">{icon}<span className="font-mono text-xs">/{code}</span></div>
      <h2 className="mt-5 text-xl font-black">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-300">{children}</p>
    </article>
  );
}
