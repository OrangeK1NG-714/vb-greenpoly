export const MVP_PRODUCT_NAME = "Modular 5-Inch Sanding Disc Organizer";

export const MVP_PROSPECT_STAGES = [
  "RESEARCH",
  "QUALIFIED",
  "CONTACTED",
  "REPLIED",
  "SAMPLE_REQUESTED",
  "CONDITIONAL_ORDER",
  "WON",
  "DISQUALIFIED",
] as const;

export type MvpProspectStage = (typeof MVP_PROSPECT_STAGES)[number];

export type ProspectScoringInput = {
  sourceChannel: string;
  contactEmail?: string | null;
  contactUrl?: string | null;
  shopUrl?: string | null;
  country?: string | null;
  sellsSandingDiscs: boolean;
  sellsToolStorage: boolean;
  evidence?: string | null;
  targetPriceUsd?: number | null;
  estimatedMonthlySets?: number | null;
};

export type ProspectScore = {
  score: number;
  reasons: string[];
};

const BUYER_CHANNELS = new Set(["ETSY", "EBAY", "AMAZON", "INDEPENDENT_STORE", "DISTRIBUTOR"]);

export function scoreProspect(input: ProspectScoringInput): ProspectScore {
  let score = 0;
  const reasons: string[] = [];

  if (input.sellsSandingDiscs) {
    score += 30;
    reasons.push("Already sells sanding discs");
  }
  if (input.sellsToolStorage) {
    score += 18;
    reasons.push("Already sells tool storage");
  }
  if (BUYER_CHANNELS.has(input.sourceChannel.toUpperCase())) {
    score += 12;
    reasons.push("Channel can validate or distribute the product");
  }
  if (input.contactEmail || input.contactUrl) {
    score += 12;
    reasons.push("Direct contact path found");
  }
  if (input.shopUrl) {
    score += 6;
    reasons.push("Storefront evidence saved");
  }
  if (input.country) {
    score += 4;
    reasons.push("Target market identified");
  }
  if ((input.evidence?.trim().length ?? 0) >= 20) {
    score += 6;
    reasons.push("Qualification evidence recorded");
  }
  if ((input.estimatedMonthlySets ?? 0) >= 100) {
    score += 8;
    reasons.push("Potential volume is at least 100 sets/month");
  } else if ((input.estimatedMonthlySets ?? 0) >= 30) {
    score += 4;
    reasons.push("Potential volume is at least 30 sets/month");
  }
  if ((input.targetPriceUsd ?? 0) >= 8) {
    score += 4;
    reasons.push("Target price meets the initial wholesale gate");
  }

  return { score: Math.min(score, 100), reasons };
}

export type UnitEconomicsInput = {
  modulesPerSet: number;
  moduleWeightG: number;
  recycledResinCnyPerKg: number;
  moldingCnyPerModule: number;
  labelsCnyPerSet: number;
  packagingCnyPerSet: number;
  assemblyCnyPerSet: number;
  wastePercent: number;
  exchangeRateCnyPerUsd: number;
  wholesalePriceUsd: number;
  retailPriceUsd: number;
  landedCostUsd: number;
  outboundShippingUsd: number;
  platformFeePercent: number;
  returnsReservePercent: number;
};

export type UnitEconomicsResult = {
  setWeightG: number;
  exwCostCny: number;
  exwCostUsd: number;
  wholesaleGrossProfitUsd: number;
  wholesaleGrossMarginPercent: number;
  d2cContributionUsd: number;
  d2cContributionMarginPercent: number;
  passesExwGate: boolean;
  passesLandedGate: boolean;
};

function assertFinitePositive(name: string, value: number, allowZero = false) {
  if (!Number.isFinite(value) || (allowZero ? value < 0 : value <= 0)) {
    throw new Error(`${name} must be ${allowZero ? "non-negative" : "positive"}`);
  }
}

export function calculateMvpUnitEconomics(input: UnitEconomicsInput): UnitEconomicsResult {
  assertFinitePositive("modulesPerSet", input.modulesPerSet);
  assertFinitePositive("moduleWeightG", input.moduleWeightG);
  assertFinitePositive("recycledResinCnyPerKg", input.recycledResinCnyPerKg);
  assertFinitePositive("moldingCnyPerModule", input.moldingCnyPerModule, true);
  assertFinitePositive("labelsCnyPerSet", input.labelsCnyPerSet, true);
  assertFinitePositive("packagingCnyPerSet", input.packagingCnyPerSet, true);
  assertFinitePositive("assemblyCnyPerSet", input.assemblyCnyPerSet, true);
  assertFinitePositive("exchangeRateCnyPerUsd", input.exchangeRateCnyPerUsd);
  assertFinitePositive("wholesalePriceUsd", input.wholesalePriceUsd);
  assertFinitePositive("retailPriceUsd", input.retailPriceUsd);
  assertFinitePositive("landedCostUsd", input.landedCostUsd, true);
  assertFinitePositive("outboundShippingUsd", input.outboundShippingUsd, true);
  if (input.wastePercent < 0 || input.wastePercent >= 100) throw new Error("wastePercent out of range");
  if (input.platformFeePercent < 0 || input.platformFeePercent >= 100) throw new Error("platformFeePercent out of range");
  if (input.returnsReservePercent < 0 || input.returnsReservePercent >= 100) throw new Error("returnsReservePercent out of range");

  const setWeightG = input.modulesPerSet * input.moduleWeightG;
  const materialCny = (setWeightG / 1000) * input.recycledResinCnyPerKg;
  const baseManufacturingCny =
    materialCny +
    input.modulesPerSet * input.moldingCnyPerModule +
    input.labelsCnyPerSet +
    input.packagingCnyPerSet +
    input.assemblyCnyPerSet;
  const exwCostCny = baseManufacturingCny * (1 + input.wastePercent / 100);
  const exwCostUsd = exwCostCny / input.exchangeRateCnyPerUsd;
  const wholesaleGrossProfitUsd = input.wholesalePriceUsd - exwCostUsd;
  const platformFeeUsd = input.retailPriceUsd * input.platformFeePercent / 100;
  const returnsReserveUsd = input.retailPriceUsd * input.returnsReservePercent / 100;
  const d2cContributionUsd =
    input.retailPriceUsd -
    platformFeeUsd -
    returnsReserveUsd -
    input.landedCostUsd -
    input.outboundShippingUsd;

  return {
    setWeightG,
    exwCostCny,
    exwCostUsd,
    wholesaleGrossProfitUsd,
    wholesaleGrossMarginPercent: wholesaleGrossProfitUsd / input.wholesalePriceUsd * 100,
    d2cContributionUsd,
    d2cContributionMarginPercent: d2cContributionUsd / input.retailPriceUsd * 100,
    passesExwGate: exwCostUsd <= 3.5,
    passesLandedGate: input.landedCostUsd <= 6.5,
  };
}

export function createMvpOutreachDraft(input: {
  contactName?: string | null;
  company: string;
  wholesalePriceUsd: number;
  moq: number;
}) {
  const greeting = input.contactName?.trim() ? `Hi ${input.contactName.trim()},` : "Hi there,";
  return {
    subject: "A modular 5-inch sanding disc organizer for your customers",
    body: `${greeting}\n\nI noticed that ${input.company} serves sanding or workshop customers. We are validating an original modular organizer for 5-inch / 125 mm sanding discs: four identical two-slot modules form an eight-grit wall or desktop system.\n\nOur current development target is a private-label wholesale price below USD ${input.wholesalePriceUsd.toFixed(2)} per set at an initial MOQ of ${input.moq}. Material, fit, capacity and drop performance will be confirmed on the physical sample before any production commitment.\n\nWould this fit your current customer base? If yes, which matters more to you: target price, wall mounting, disc capacity, or private-label packaging?\n\nBest regards,\nGreenPoly Product Validation Team`,
  };
}

export function getExperimentVerdict(input: {
  contacted: number;
  replies: number;
  sampleRequests: number;
  conditionalOrders: number;
}) {
  if (input.conditionalOrders >= 1 || (input.replies >= 8 && input.sampleRequests >= 3)) {
    return { status: "CONTINUE" as const, label: "Evidence gate passed", detail: "Proceed to a physical sample and factory quote." };
  }
  if (input.contacted >= 50 && input.replies < 3) {
    return { status: "STOP" as const, label: "Kill or reposition", detail: "Fewer than 3 replies after 50 qualified contacts." };
  }
  return { status: "COLLECTING" as const, label: "Collecting evidence", detail: "Do not open a mold yet. Continue targeted conversations." };
}
