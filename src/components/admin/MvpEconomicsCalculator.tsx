"use client";

import { useMemo, useState } from "react";
import { Calculator, CircleCheck, CircleX } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { calculateMvpUnitEconomics, type UnitEconomicsInput } from "@/domain/mvp/validation";

const DEFAULTS: UnitEconomicsInput = {
  modulesPerSet: 4,
  moduleWeightG: 55,
  recycledResinCnyPerKg: 7,
  moldingCnyPerModule: 0.75,
  labelsCnyPerSet: 0.8,
  packagingCnyPerSet: 2.2,
  assemblyCnyPerSet: 0.8,
  wastePercent: 5,
  exchangeRateCnyPerUsd: 7.2,
  wholesalePriceUsd: 9,
  retailPriceUsd: 24.99,
  landedCostUsd: 6.2,
  outboundShippingUsd: 5.5,
  platformFeePercent: 13.6,
  returnsReservePercent: 3,
};

export default function MvpEconomicsCalculator() {
  const [input, setInput] = useState(DEFAULTS);
  const result = useMemo(() => {
    try {
      return calculateMvpUnitEconomics(input);
    } catch {
      return null;
    }
  }, [input]);

  function setNumber(key: keyof UnitEconomicsInput, value: string) {
    setInput((current) => ({ ...current, [key]: Number(value) }));
  }

  return (
    <section className="admin-card overflow-hidden" aria-labelledby="economics-title">
      <div className="border-b border-slate-200 bg-slate-950 px-5 py-4 text-white">
        <div className="flex items-center gap-3">
          <Calculator className="text-amber-300" aria-hidden="true" />
          <div>
            <h2 id="economics-title" className="font-bold">Unit economics gate</h2>
            <p className="text-xs text-slate-400">Planning assumptions only — replace with factory and logistics quotes.</p>
          </div>
        </div>
      </div>

      <div className="grid gap-5 p-5 xl:grid-cols-[1.3fr_0.7fr]">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <NumberField label="Module weight" suffix="g" value={input.moduleWeightG} onChange={(value) => setNumber("moduleWeightG", value)} />
          <NumberField label="Recycled resin" suffix="¥/kg" value={input.recycledResinCnyPerKg} onChange={(value) => setNumber("recycledResinCnyPerKg", value)} />
          <NumberField label="Molding / module" suffix="¥" value={input.moldingCnyPerModule} onChange={(value) => setNumber("moldingCnyPerModule", value)} />
          <NumberField label="Labels / set" suffix="¥" value={input.labelsCnyPerSet} onChange={(value) => setNumber("labelsCnyPerSet", value)} />
          <NumberField label="Packaging / set" suffix="¥" value={input.packagingCnyPerSet} onChange={(value) => setNumber("packagingCnyPerSet", value)} />
          <NumberField label="Assembly / set" suffix="¥" value={input.assemblyCnyPerSet} onChange={(value) => setNumber("assemblyCnyPerSet", value)} />
          <NumberField label="Waste reserve" suffix="%" value={input.wastePercent} onChange={(value) => setNumber("wastePercent", value)} />
          <NumberField label="CNY / USD" suffix="rate" value={input.exchangeRateCnyPerUsd} onChange={(value) => setNumber("exchangeRateCnyPerUsd", value)} />
          <NumberField label="Wholesale price" suffix="$" value={input.wholesalePriceUsd} onChange={(value) => setNumber("wholesalePriceUsd", value)} />
          <NumberField label="Retail price" suffix="$" value={input.retailPriceUsd} onChange={(value) => setNumber("retailPriceUsd", value)} />
          <NumberField label="Landed cost" suffix="$" value={input.landedCostUsd} onChange={(value) => setNumber("landedCostUsd", value)} />
          <NumberField label="Outbound shipping" suffix="$" value={input.outboundShippingUsd} onChange={(value) => setNumber("outboundShippingUsd", value)} />
          <NumberField label="Platform fee" suffix="%" value={input.platformFeePercent} onChange={(value) => setNumber("platformFeePercent", value)} />
          <NumberField label="Returns reserve" suffix="%" value={input.returnsReservePercent} onChange={(value) => setNumber("returnsReservePercent", value)} />
        </div>

        <div className="grid content-start gap-3">
          {result ? (
            <>
              <Result label="Set weight" value={`${result.setWeightG.toFixed(0)} g`} />
              <Result label="EXW target cost" value={`¥${result.exwCostCny.toFixed(2)} / $${result.exwCostUsd.toFixed(2)}`} pass={result.passesExwGate} />
              <Result label="Wholesale gross profit" value={`$${result.wholesaleGrossProfitUsd.toFixed(2)} · ${result.wholesaleGrossMarginPercent.toFixed(1)}%`} />
              <Result label="D2C contribution" value={`$${result.d2cContributionUsd.toFixed(2)} · ${result.d2cContributionMarginPercent.toFixed(1)}%`} pass={result.d2cContributionUsd > 0} />
              <Result label="Landed ≤ $6.50" value={result.passesLandedGate ? "Pass" : "Fail"} pass={result.passesLandedGate} />
            </>
          ) : (
            <p className="rounded-lg bg-red-50 p-4 text-sm text-red-800">Enter valid non-negative assumptions.</p>
          )}
        </div>
      </div>
    </section>
  );
}

function NumberField({ label, suffix, value, onChange }: { label: string; suffix: string; value: number; onChange(value: string): void }) {
  const id = `economics-${label.toLowerCase().replaceAll(/[^a-z0-9]+/g, "-")}`;
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs text-slate-600">{label}</Label>
      <div className="relative">
        <Input id={id} type="number" min="0" step="any" value={value} onChange={(event) => onChange(event.target.value)} className="pr-12" />
        <span className="pointer-events-none absolute right-3 top-2 text-xs text-slate-400">{suffix}</span>
      </div>
    </div>
  );
}

function Result({ label, value, pass }: { label: string; value: string; pass?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
      <span className="text-xs text-slate-500">{label}</span>
      <span className="flex items-center gap-2 text-right text-sm font-bold text-slate-900">
        {pass === true && <CircleCheck className="h-4 w-4 text-emerald-600" aria-label="Pass" />}
        {pass === false && <CircleX className="h-4 w-4 text-red-600" aria-label="Fail" />}
        {value}
      </span>
    </div>
  );
}
