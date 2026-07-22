import assert from "node:assert/strict";
import test from "node:test";
import { calculateQuote, createFollowUpDraft, getLeadAction } from "../src/lib/sales-tools.ts";

test("quote calculator derives margin-based FOB and landed CIF totals", () => {
  const result = calculateQuote({
    quantityMt: 20,
    supplierCostCnyPerMt: 7200,
    inlandAndPortCny: 6000,
    documentsCny: 3000,
    exchangeRateCnyPerUsd: 7.2,
    targetMarginPercent: 15,
    oceanFreightUsd: 1600,
    insurancePercent: 0.3,
  });

  assert.equal(result.costBaseUsd, 21_250);
  assert.equal(result.fobTotalUsd, 25_000);
  assert.equal(result.fobPerMtUsd, 1_250);
  assert.equal(result.insuranceUsd, 79.8);
  assert.equal(result.cifTotalUsd, 26_679.8);
  assert.equal(result.cifPerMtUsd, 1_333.99);
  assert.equal(result.expectedGrossProfitUsd, 3_750);
});

test("quote calculator rejects unusable quantities, rates, and margins", () => {
  const valid = {
    quantityMt: 20,
    supplierCostCnyPerMt: 7200,
    inlandAndPortCny: 6000,
    documentsCny: 3000,
    exchangeRateCnyPerUsd: 7.2,
    targetMarginPercent: 15,
    oceanFreightUsd: 1600,
    insurancePercent: 0.3,
  };

  assert.throws(() => calculateQuote({ ...valid, quantityMt: 0 }), /quantityMt/);
  assert.throws(() => calculateQuote({ ...valid, exchangeRateCnyPerUsd: 0 }), /exchangeRate/);
  assert.throws(() => calculateQuote({ ...valid, targetMarginPercent: 100 }), /targetMargin/);
});

test("lead actions prioritize fresh inquiries and stale quotes", () => {
  const asOf = "2026-07-22T12:00:00.000Z";
  const fresh = getLeadAction({ status: "NEW", updatedAt: "2026-07-22T08:00:00.000Z" }, asOf);
  const staleQuote = getLeadAction({ status: "QUOTED", updatedAt: "2026-07-17T08:00:00.000Z" }, asOf);
  const won = getLeadAction({ status: "WON", updatedAt: "2026-07-01T08:00:00.000Z" }, asOf);

  assert.deepEqual(fresh, {
    label: "Reply to inquiry",
    detail: "New today",
    priority: "high",
    idleDays: 0,
  });
  assert.equal(staleQuote.priority, "high");
  assert.equal(staleQuote.idleDays, 5);
  assert.equal(won.priority, "done");
});

test("follow-up drafts use lead context and pipeline stage without sending", () => {
  const draft = createFollowUpDraft({
    lead: {
      name: "Maria",
      company: "Acme Plastics",
      country: "Brazil",
      port: "Santos",
      product: "Recycled ABS",
      volume: "20 MT",
      incoterms: "CIF",
      status: "QUOTED",
    },
    language: "pt",
    tone: "professional",
  });

  assert.match(draft.subject, /Recycled ABS/);
  assert.match(draft.body, /Maria/);
  assert.match(draft.body, /20 MT, CIF para Santos/);
  assert.match(draft.body, /cotação/);
});
