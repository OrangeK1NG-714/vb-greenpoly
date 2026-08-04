import assert from "node:assert/strict";
import test from "node:test";
import {
  calculateMvpUnitEconomics,
  createMvpOutreachDraft,
  getExperimentVerdict,
  scoreProspect,
} from "../src/domain/mvp/validation";

test("prospect scoring prioritizes relevant sellers with a direct contact path", () => {
  const result = scoreProspect({
    sourceChannel: "ETSY",
    contactEmail: "buyer@example.com",
    shopUrl: "https://example.com/store",
    country: "US",
    sellsSandingDiscs: true,
    sellsToolStorage: true,
    evidence: "The store sells five-inch discs and workshop organizers.",
    targetPriceUsd: 9,
    estimatedMonthlySets: 120,
  });

  assert.equal(result.score, 100);
  assert.match(result.reasons.join(" "), /sanding discs/);
});

test("unit economics exposes EXW and landed cost gates", () => {
  const result = calculateMvpUnitEconomics({
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
  });

  assert.equal(result.setWeightG, 220);
  assert.equal(result.passesExwGate, true);
  assert.equal(result.passesLandedGate, true);
  assert.ok(result.wholesaleGrossProfitUsd > 7);
  assert.ok(result.d2cContributionUsd > 5);
});

test("outreach draft keeps uncertain product claims explicit", () => {
  const draft = createMvpOutreachDraft({
    contactName: "Maria",
    company: "Acme Abrasives",
    wholesalePriceUsd: 9,
    moq: 300,
  });

  assert.match(draft.body, /physical sample/);
  assert.match(draft.body, /before any production commitment/);
  assert.doesNotMatch(draft.body, /guaranteed|certified/i);
});

test("experiment gate stops weak demand and continues on purchase evidence", () => {
  assert.equal(getExperimentVerdict({ contacted: 50, replies: 2, sampleRequests: 0, conditionalOrders: 0 }).status, "STOP");
  assert.equal(getExperimentVerdict({ contacted: 12, replies: 3, sampleRequests: 1, conditionalOrders: 1 }).status, "CONTINUE");
  assert.equal(getExperimentVerdict({ contacted: 12, replies: 2, sampleRequests: 0, conditionalOrders: 0 }).status, "COLLECTING");
});
