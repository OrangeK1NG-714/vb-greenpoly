import assert from "node:assert/strict";
import test from "node:test";
import {
  calculateQuote,
  calculateTradeQuote,
  canTransitionQuoteStatus,
  canTransitionSampleStatus,
  compareSampleVersions,
  createFactoryHandoffSummary,
  createFollowUpDraft,
  createQuoteCustomerDraft,
  createSampleCustomerConfirmation,
  getLeadAction,
  getTradeTodos,
  validateQuoteDraft,
  validateSampleSnapshot,
} from "../src/lib/sales-tools";
import {
  CHANGED_SAMPLE,
  CIF_QUOTE_WITHOUT_DESTINATION,
  COMPLETE_CIF_QUOTE,
  CONFIRMED_SAMPLE,
} from "./fixtures/trade-workspace";

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
  assert.throws(() => calculateQuote({ ...valid, oceanFreightUsd: Number.NaN }), /oceanFreight/);
  assert.throws(() => calculateQuote({ ...valid, insurancePercent: -0.1 }), /insurancePercent/);
});

test("quote guard accepts a complete CIF draft and exposes its formula result", () => {
  const validation = validateQuoteDraft(COMPLETE_CIF_QUOTE);
  const result = calculateTradeQuote(COMPLETE_CIF_QUOTE);

  assert.deepEqual(validation.missingFields, []);
  assert.deepEqual(validation.invalidFields, []);
  assert.equal(validation.canMarkReady, true);
  assert.equal(validation.canCalculateFob, true);
  assert.equal(validation.canCalculateCif, true);
  assert.equal(result.quotedTotalUsd, 26_679.8);
  assert.equal(result.quotedPerMtUsd, 1_333.99);
  assert.equal(result.incoterm, "CIF");
});

test("CIF quote keeps an unknown destination visible instead of assuming a value", () => {
  const validation = validateQuoteDraft(CIF_QUOTE_WITHOUT_DESTINATION);

  assert.deepEqual(validation.missingFields, ["destinationPort"]);
  assert.equal(validation.canMarkReady, false);
  assert.equal(validation.canCalculateFob, true);
  assert.equal(validation.canCalculateCif, false);
  assert.throws(() => calculateTradeQuote(CIF_QUOTE_WITHOUT_DESTINATION), /destinationPort/);
});

test("quote guard rejects illegal finite ranges without treating them as missing", () => {
  const validation = validateQuoteDraft({
    ...COMPLETE_CIF_QUOTE,
    quantityMt: -2,
    targetMarginPercent: 100,
    oceanFreightUsd: Number.POSITIVE_INFINITY,
  });

  assert.deepEqual(validation.missingFields, []);
  assert.deepEqual(validation.invalidFields, ["quantityMt", "targetMarginPercent", "oceanFreightUsd"]);
  assert.equal(validation.canMarkReady, false);
});

test("quote status transitions preserve a human review and send boundary", () => {
  assert.equal(canTransitionQuoteStatus("DRAFT", "READY_TO_REVIEW"), true);
  assert.equal(canTransitionQuoteStatus("DRAFT", "SENT_MANUALLY"), false);
  assert.equal(canTransitionQuoteStatus("READY_TO_REVIEW", "SENT_MANUALLY"), true);
  assert.equal(canTransitionQuoteStatus("SENT_MANUALLY", "DRAFT"), false);
  assert.equal(canTransitionQuoteStatus("ARCHIVED", "DRAFT"), false);
});

test("customer quote draft contains confirmed terms and no send action", () => {
  const draft = createQuoteCustomerDraft(COMPLETE_CIF_QUOTE, calculateTradeQuote(COMPLETE_CIF_QUOTE));

  assert.match(draft, /CIF Santos/);
  assert.match(draft, /USD 1,333.99\/MT/);
  assert.match(draft, /30% deposit/);
  assert.doesNotMatch(draft, /send|sent/i);
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

test("sample comparison requires a new version for confirmed critical changes", () => {
  const comparison = compareSampleVersions(CONFIRMED_SAMPLE, CHANGED_SAMPLE);

  assert.deepEqual(comparison.changedFields, ["quantity", "acceptanceCriteria"]);
  assert.equal(comparison.requiresNewVersion, true);
});

test("sample validation and transitions enforce customer confirmation order", () => {
  assert.deepEqual(validateSampleSnapshot(CHANGED_SAMPLE), { missingFields: [], invalidFields: [] });
  assert.equal(canTransitionSampleStatus("NEEDS_INFORMATION", "AWAITING_CONFIRMATION"), false);
  assert.equal(canTransitionSampleStatus("READY_FOR_CUSTOMER_CONFIRMATION", "AWAITING_CONFIRMATION"), true);
  assert.equal(canTransitionSampleStatus("AWAITING_CONFIRMATION", "CUSTOMER_CONFIRMED"), true);
  assert.equal(canTransitionSampleStatus("CUSTOMER_CONFIRMED", "HANDED_TO_FACTORY"), true);
  assert.equal(canTransitionSampleStatus("HANDED_TO_FACTORY", "READY_FOR_CUSTOMER_CONFIRMATION"), false);
});

test("sample drafts create customer confirmation and internal factory summaries", () => {
  const customer = createSampleCustomerConfirmation(CHANGED_SAMPLE);
  const factory = createFactoryHandoffSummary({ ...CHANGED_SAMPLE, status: "CUSTOMER_CONFIRMED" });

  assert.match(customer, /Version 2/);
  assert.match(customer, /3 kg/);
  assert.match(customer, /Delta E below 1.5/);
  assert.match(factory, /CUSTOMER CONFIRMED/);
  assert.match(factory, /ABS-750A/);
});

test("trade todos surface missing quote data, due follow-up, and overdue sample confirmation", () => {
  const todos = getTradeTodos({
    quotes: [
      CIF_QUOTE_WITHOUT_DESTINATION,
      {
        ...COMPLETE_CIF_QUOTE,
        inquiryId: "inquiry-follow-up",
        status: "SENT_MANUALLY",
        sentAt: "2026-07-24T09:00:00.000Z",
        followUpAt: "2026-07-25T09:00:00.000Z",
      },
    ],
    samples: [{
      ...CHANGED_SAMPLE,
      status: "AWAITING_CONFIRMATION",
      targetConfirmationDate: "2026-07-23",
    }],
    asOf: "2026-07-26T09:00:00.000Z",
  });

  assert.deepEqual(todos.map((todo) => todo.kind), [
    "QUOTE_MISSING_FIELDS",
    "QUOTE_FOLLOW_UP_DUE",
    "SAMPLE_CONFIRMATION_OVERDUE",
  ]);
  assert.match(todos[0].detail, /Destination port/);
});
