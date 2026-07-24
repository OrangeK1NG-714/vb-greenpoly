export const SALES_STATUSES = ["NEW", "CONTACTED", "QUOTED", "NEGOTIATING", "WON", "LOST"] as const;

export type SalesStatus = (typeof SALES_STATUSES)[number];
export type DraftLanguage = "en" | "fr" | "pt";
export type DraftTone = "professional" | "warm" | "concise";

export type SalesLead = {
  id: string;
  name: string;
  email: string;
  company: string;
  country: string;
  port: string;
  product: string;
  volume: string;
  incoterms: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

export type QuoteInput = {
  quantityMt: number;
  supplierCostCnyPerMt: number;
  inlandAndPortCny: number;
  documentsCny: number;
  exchangeRateCnyPerUsd: number;
  targetMarginPercent: number;
  oceanFreightUsd: number;
  insurancePercent: number;
};

export type QuoteResult = {
  costBaseUsd: number;
  fobTotalUsd: number;
  fobPerMtUsd: number;
  oceanFreightUsd: number;
  insuranceUsd: number;
  cifTotalUsd: number;
  cifPerMtUsd: number;
  expectedGrossProfitUsd: number;
};

export const QUOTE_STATUSES = ["DRAFT", "READY_TO_REVIEW", "SENT_MANUALLY", "ARCHIVED"] as const;
export type QuoteStatus = (typeof QUOTE_STATUSES)[number];

export const SAMPLE_STATUSES = [
  "NEEDS_INFORMATION",
  "READY_FOR_CUSTOMER_CONFIRMATION",
  "AWAITING_CONFIRMATION",
  "CUSTOMER_CONFIRMED",
  "HANDED_TO_FACTORY",
  "CANCELLED",
] as const;
export type SampleStatus = (typeof SAMPLE_STATUSES)[number];

export type QuoteDraftData = {
  id?: string;
  inquiryId: string;
  status: QuoteStatus;
  product: string;
  grade: string;
  quantityMt: number | null;
  quantityUnit: string;
  currency: string;
  incoterm: string;
  originPort: string;
  destinationPort: string;
  supplierCostCnyPerMt: number | null;
  inlandAndPortCny: number | null;
  documentsCny: number | null;
  exchangeRateCnyPerUsd: number | null;
  targetMarginPercent: number | null;
  oceanFreightUsd: number | null;
  insurancePercent: number | null;
  paymentTerms: string;
  packaging: string;
  leadTime: string;
  validUntil: string | null;
  followUpAt: string | null;
  sentAt: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type QuoteFieldName = Exclude<keyof QuoteDraftData, "id" | "inquiryId" | "status" | "sentAt" | "createdAt" | "updatedAt">;

export type QuoteValidation = {
  missingFields: QuoteFieldName[];
  invalidFields: QuoteFieldName[];
  canCalculateFob: boolean;
  canCalculateCif: boolean;
  canMarkReady: boolean;
};

export type TradeQuoteResult = QuoteResult & {
  incoterm: "FOB" | "CIF";
  quotedTotalUsd: number;
  quotedPerMtUsd: number;
};

export type SampleSnapshot = {
  id?: string;
  inquiryId: string;
  version: number;
  status: SampleStatus;
  product: string;
  grade: string;
  application: string;
  appearance: string;
  technicalRequirements: string;
  quantity: number | null;
  quantityUnit: string;
  packaging: string;
  acceptanceCriteria: string;
  targetConfirmationDate: string | null;
  customerConfirmedAt: string | null;
  handedToFactoryAt: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export const SAMPLE_CRITICAL_FIELDS = [
  "product",
  "grade",
  "application",
  "appearance",
  "technicalRequirements",
  "quantity",
  "quantityUnit",
  "packaging",
  "acceptanceCriteria",
] as const;

export type SampleCriticalField = (typeof SAMPLE_CRITICAL_FIELDS)[number];
export type SampleFieldName = SampleCriticalField | "targetConfirmationDate";

export type SampleValidation = {
  missingFields: SampleFieldName[];
  invalidFields: SampleFieldName[];
};

export type TradeTodo = {
  kind: "QUOTE_MISSING_FIELDS" | "QUOTE_REVIEW" | "QUOTE_FOLLOW_UP_MISSING" | "QUOTE_FOLLOW_UP_DUE" | "SAMPLE_MISSING_FIELDS" | "SAMPLE_CONFIRMATION" | "SAMPLE_CONFIRMATION_OVERDUE" | "SAMPLE_FACTORY_HANDOFF";
  inquiryId: string;
  priority: "high" | "medium";
  title: string;
  detail: string;
};

export type LeadAction = {
  label: string;
  detail: string;
  priority: "high" | "medium" | "low" | "done";
  idleDays: number;
};

function assertFiniteNonNegative(label: string, value: number) {
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(`${label} must be a finite non-negative number`);
  }
}

export function calculateQuote(input: QuoteInput): QuoteResult {
  assertFiniteNonNegative("supplierCostCnyPerMt", input.supplierCostCnyPerMt);
  assertFiniteNonNegative("inlandAndPortCny", input.inlandAndPortCny);
  assertFiniteNonNegative("documentsCny", input.documentsCny);
  assertFiniteNonNegative("oceanFreightUsd", input.oceanFreightUsd);
  assertFiniteNonNegative("insurancePercent", input.insurancePercent);

  if (!Number.isFinite(input.quantityMt) || input.quantityMt <= 0) {
    throw new Error("quantityMt must be greater than zero");
  }
  if (!Number.isFinite(input.exchangeRateCnyPerUsd) || input.exchangeRateCnyPerUsd <= 0) {
    throw new Error("exchangeRateCnyPerUsd must be greater than zero");
  }
  if (!Number.isFinite(input.targetMarginPercent) || input.targetMarginPercent < 0 || input.targetMarginPercent >= 100) {
    throw new Error("targetMarginPercent must be between zero and 100");
  }

  const totalCostCny = (
    input.supplierCostCnyPerMt * input.quantityMt
    + input.inlandAndPortCny
    + input.documentsCny
  );
  const costBaseUsd = totalCostCny / input.exchangeRateCnyPerUsd;
  const marginRatio = input.targetMarginPercent / 100;
  const fobTotalUsd = costBaseUsd / (1 - marginRatio);
  const insuranceUsd = (fobTotalUsd + input.oceanFreightUsd) * (input.insurancePercent / 100);
  const cifTotalUsd = fobTotalUsd + input.oceanFreightUsd + insuranceUsd;

  return {
    costBaseUsd,
    fobTotalUsd,
    fobPerMtUsd: fobTotalUsd / input.quantityMt,
    oceanFreightUsd: input.oceanFreightUsd,
    insuranceUsd,
    cifTotalUsd,
    cifPerMtUsd: cifTotalUsd / input.quantityMt,
    expectedGrossProfitUsd: fobTotalUsd - costBaseUsd,
  };
}

const QUOTE_REQUIRED_TEXT_FIELDS = [
  "product",
  "grade",
  "quantityUnit",
  "currency",
  "incoterm",
  "originPort",
  "paymentTerms",
  "packaging",
  "leadTime",
] as const satisfies readonly QuoteFieldName[];

const QUOTE_REQUIRED_NUMBER_FIELDS = [
  "quantityMt",
  "supplierCostCnyPerMt",
  "inlandAndPortCny",
  "documentsCny",
  "exchangeRateCnyPerUsd",
  "targetMarginPercent",
] as const satisfies readonly QuoteFieldName[];

const QUOTE_FIELD_LABELS: Partial<Record<QuoteFieldName, string>> = {
  product: "Product",
  grade: "Grade",
  quantityMt: "Quantity",
  quantityUnit: "Quantity unit",
  currency: "Currency",
  incoterm: "Trade term",
  originPort: "Origin port",
  destinationPort: "Destination port",
  supplierCostCnyPerMt: "Supplier cost",
  inlandAndPortCny: "Inland and port cost",
  documentsCny: "Document fees",
  exchangeRateCnyPerUsd: "Exchange rate",
  targetMarginPercent: "Target margin",
  oceanFreightUsd: "Ocean freight",
  insurancePercent: "Insurance",
  paymentTerms: "Payment terms",
  packaging: "Packaging",
  leadTime: "Lead time",
  validUntil: "Quote validity",
  followUpAt: "Follow-up time",
};

function isBlank(value: string | null | undefined): boolean {
  return !value || value.trim().length === 0;
}

function isMissingNumber(value: number | null | undefined): boolean {
  return value === null || value === undefined;
}

function pushOnce<T>(items: T[], value: T) {
  if (!items.includes(value)) items.push(value);
}

export function validateQuoteDraft(input: QuoteDraftData): QuoteValidation {
  const missingFields: QuoteFieldName[] = [];
  const invalidFields: QuoteFieldName[] = [];

  for (const field of QUOTE_REQUIRED_TEXT_FIELDS) {
    if (isBlank(input[field] as string)) missingFields.push(field);
  }
  for (const field of QUOTE_REQUIRED_NUMBER_FIELDS) {
    if (isMissingNumber(input[field] as number | null)) missingFields.push(field);
  }
  if (isBlank(input.validUntil)) missingFields.push("validUntil");

  const isCif = input.incoterm === "CIF";
  if (isCif) {
    if (isBlank(input.destinationPort)) missingFields.push("destinationPort");
    if (isMissingNumber(input.oceanFreightUsd)) missingFields.push("oceanFreightUsd");
    if (isMissingNumber(input.insurancePercent)) missingFields.push("insurancePercent");
  }

  const quantityMt = input.quantityMt;
  if (quantityMt !== null && quantityMt !== undefined && (!Number.isFinite(quantityMt) || quantityMt <= 0)) {
    invalidFields.push("quantityMt");
  }
  const supplierCostCnyPerMt = input.supplierCostCnyPerMt;
  if (supplierCostCnyPerMt !== null && supplierCostCnyPerMt !== undefined && (!Number.isFinite(supplierCostCnyPerMt) || supplierCostCnyPerMt <= 0)) {
    invalidFields.push("supplierCostCnyPerMt");
  }
  for (const field of ["inlandAndPortCny", "documentsCny"] as const) {
    const value = input[field];
    if (value !== null && value !== undefined && (!Number.isFinite(value) || value < 0)) invalidFields.push(field);
  }
  const exchangeRate = input.exchangeRateCnyPerUsd;
  if (exchangeRate !== null && exchangeRate !== undefined && (!Number.isFinite(exchangeRate) || exchangeRate <= 0)) {
    invalidFields.push("exchangeRateCnyPerUsd");
  }
  const margin = input.targetMarginPercent;
  if (margin !== null && margin !== undefined && (!Number.isFinite(margin) || margin < 0 || margin >= 100)) {
    invalidFields.push("targetMarginPercent");
  }
  const freight = input.oceanFreightUsd;
  if (freight !== null && freight !== undefined && (!Number.isFinite(freight) || freight < 0)) {
    invalidFields.push("oceanFreightUsd");
  }
  const insurance = input.insurancePercent;
  if (insurance !== null && insurance !== undefined && (!Number.isFinite(insurance) || insurance < 0)) {
    invalidFields.push("insurancePercent");
  }
  if (!isBlank(input.validUntil) && !Number.isFinite(new Date(input.validUntil as string).getTime())) {
    invalidFields.push("validUntil");
  }
  if (!isBlank(input.followUpAt) && !Number.isFinite(new Date(input.followUpAt as string).getTime())) {
    invalidFields.push("followUpAt");
  }
  if (!isBlank(input.currency) && input.currency !== "USD") pushOnce(invalidFields, "currency");
  if (!isBlank(input.incoterm) && input.incoterm !== "FOB" && input.incoterm !== "CIF") pushOnce(invalidFields, "incoterm");

  const baseCalculationFields: QuoteFieldName[] = [
    "quantityMt",
    "supplierCostCnyPerMt",
    "inlandAndPortCny",
    "documentsCny",
    "exchangeRateCnyPerUsd",
    "targetMarginPercent",
  ];
  const baseCalculationReady = input.currency === "USD"
    && baseCalculationFields.every((field) => !missingFields.includes(field) && !invalidFields.includes(field));
  const cifCalculationFields: QuoteFieldName[] = ["destinationPort", "oceanFreightUsd", "insurancePercent"];

  return {
    missingFields,
    invalidFields,
    canCalculateFob: baseCalculationReady,
    canCalculateCif: isCif && baseCalculationReady && cifCalculationFields.every((field) => !missingFields.includes(field) && !invalidFields.includes(field)),
    canMarkReady: missingFields.length === 0 && invalidFields.length === 0,
  };
}

export function calculateTradeQuote(input: QuoteDraftData): TradeQuoteResult {
  const validation = validateQuoteDraft(input);
  const canCalculate = input.incoterm === "FOB" ? validation.canCalculateFob : validation.canCalculateCif;
  if (!canCalculate) {
    const fields = [...validation.missingFields, ...validation.invalidFields];
    throw new Error(`Quote cannot be calculated: ${fields.join(", ") || "unsupported incoterm"}`);
  }

  const incoterm = input.incoterm as "FOB" | "CIF";
  const result = calculateQuote({
    quantityMt: input.quantityMt as number,
    supplierCostCnyPerMt: input.supplierCostCnyPerMt as number,
    inlandAndPortCny: input.inlandAndPortCny as number,
    documentsCny: input.documentsCny as number,
    exchangeRateCnyPerUsd: input.exchangeRateCnyPerUsd as number,
    targetMarginPercent: input.targetMarginPercent as number,
    oceanFreightUsd: incoterm === "CIF" ? input.oceanFreightUsd as number : 0,
    insurancePercent: incoterm === "CIF" ? input.insurancePercent as number : 0,
  });

  return {
    ...result,
    incoterm,
    quotedTotalUsd: incoterm === "CIF" ? result.cifTotalUsd : result.fobTotalUsd,
    quotedPerMtUsd: incoterm === "CIF" ? result.cifPerMtUsd : result.fobPerMtUsd,
  };
}

const QUOTE_TRANSITIONS: Record<QuoteStatus, readonly QuoteStatus[]> = {
  DRAFT: ["READY_TO_REVIEW", "ARCHIVED"],
  READY_TO_REVIEW: ["DRAFT", "SENT_MANUALLY", "ARCHIVED"],
  SENT_MANUALLY: ["ARCHIVED"],
  ARCHIVED: [],
};

export function canTransitionQuoteStatus(current: QuoteStatus, next: QuoteStatus): boolean {
  return current === next || QUOTE_TRANSITIONS[current].includes(next);
}

function formatUsd(value: number): string {
  return new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
}

export function createQuoteCustomerDraft(input: QuoteDraftData, result: TradeQuoteResult): string {
  const validation = validateQuoteDraft(input);
  if (!validation.canMarkReady) {
    throw new Error(`Quote is not ready: ${[...validation.missingFields, ...validation.invalidFields].join(", ")}`);
  }
  const destination = input.incoterm === "CIF" ? ` ${input.destinationPort}` : ` ${input.originPort}`;
  return [
    "Quotation draft",
    `Product / grade: ${input.product} / ${input.grade}`,
    `Quantity: ${input.quantityMt} ${input.quantityUnit}`,
    `Unit price: USD ${formatUsd(result.quotedPerMtUsd)}/${input.quantityUnit}`,
    `Total: USD ${formatUsd(result.quotedTotalUsd)}`,
    `Term: ${input.incoterm}${destination} (origin: ${input.originPort})`,
    `Payment: ${input.paymentTerms}`,
    `Packaging: ${input.packaging}`,
    `Lead time: ${input.leadTime}`,
    `Valid until: ${input.validUntil}`,
    "All commercial and technical terms remain subject to human review and customer confirmation.",
  ].join("\n");
}

const SAMPLE_REQUIRED_TEXT_FIELDS = [
  "product",
  "grade",
  "application",
  "appearance",
  "technicalRequirements",
  "quantityUnit",
  "packaging",
  "acceptanceCriteria",
] as const satisfies readonly SampleFieldName[];

export function validateSampleSnapshot(input: SampleSnapshot): SampleValidation {
  const missingFields: SampleFieldName[] = [];
  const invalidFields: SampleFieldName[] = [];

  for (const field of SAMPLE_REQUIRED_TEXT_FIELDS) {
    if (isBlank(input[field] as string)) missingFields.push(field);
  }
  const quantity = input.quantity;
  if (quantity === null || quantity === undefined) {
    missingFields.push("quantity");
  } else if (!Number.isFinite(quantity) || quantity <= 0) {
    invalidFields.push("quantity");
  }
  if (isBlank(input.targetConfirmationDate)) {
    missingFields.push("targetConfirmationDate");
  } else if (!Number.isFinite(new Date(input.targetConfirmationDate as string).getTime())) {
    invalidFields.push("targetConfirmationDate");
  }

  return { missingFields, invalidFields };
}

const SAMPLE_TRANSITIONS: Record<SampleStatus, readonly SampleStatus[]> = {
  NEEDS_INFORMATION: ["READY_FOR_CUSTOMER_CONFIRMATION", "CANCELLED"],
  READY_FOR_CUSTOMER_CONFIRMATION: ["NEEDS_INFORMATION", "AWAITING_CONFIRMATION", "CANCELLED"],
  AWAITING_CONFIRMATION: ["NEEDS_INFORMATION", "READY_FOR_CUSTOMER_CONFIRMATION", "CUSTOMER_CONFIRMED", "CANCELLED"],
  CUSTOMER_CONFIRMED: ["HANDED_TO_FACTORY", "CANCELLED"],
  HANDED_TO_FACTORY: ["CANCELLED"],
  CANCELLED: [],
};

export function canTransitionSampleStatus(current: SampleStatus, next: SampleStatus): boolean {
  return current === next || SAMPLE_TRANSITIONS[current].includes(next);
}

function comparableSampleValue(value: string | number | null): string | number | null {
  return typeof value === "string" ? value.trim() : value;
}

export function compareSampleVersions(previous: SampleSnapshot, next: SampleSnapshot): { changedFields: SampleCriticalField[]; requiresNewVersion: boolean } {
  const changedFields = SAMPLE_CRITICAL_FIELDS.filter((field) => (
    comparableSampleValue(previous[field]) !== comparableSampleValue(next[field])
  ));
  return {
    changedFields,
    requiresNewVersion: changedFields.length > 0 && (previous.status === "CUSTOMER_CONFIRMED" || previous.status === "HANDED_TO_FACTORY"),
  };
}

export function sampleStatusForContents(input: SampleSnapshot): "NEEDS_INFORMATION" | "READY_FOR_CUSTOMER_CONFIRMATION" {
  const validation = validateSampleSnapshot(input);
  return validation.missingFields.length === 0 && validation.invalidFields.length === 0
    ? "READY_FOR_CUSTOMER_CONFIRMATION"
    : "NEEDS_INFORMATION";
}

export function createSampleCustomerConfirmation(input: SampleSnapshot): string {
  const validation = validateSampleSnapshot(input);
  if (validation.missingFields.length > 0 || validation.invalidFields.length > 0) {
    throw new Error(`Sample confirmation is incomplete: ${[...validation.missingFields, ...validation.invalidFields].join(", ")}`);
  }
  return [
    `Sample confirmation — Version ${input.version}`,
    `Product / grade: ${input.product} / ${input.grade}`,
    `Application: ${input.application}`,
    `Colour / appearance: ${input.appearance}`,
    `Technical requirements: ${input.technicalRequirements}`,
    `Sample quantity: ${input.quantity} ${input.quantityUnit}`,
    `Packaging: ${input.packaging}`,
    `Acceptance focus: ${input.acceptanceCriteria}`,
    "Please confirm that this version matches your sample requirements. Any later change will create a new version for confirmation.",
  ].join("\n");
}

export function createFactoryHandoffSummary(input: SampleSnapshot): string {
  if (input.status !== "CUSTOMER_CONFIRMED" && input.status !== "HANDED_TO_FACTORY") {
    throw new Error("Factory handoff requires a customer-confirmed sample version");
  }
  return [
    `CUSTOMER CONFIRMED — SAMPLE VERSION ${input.version}`,
    `Product / grade: ${input.product} / ${input.grade}`,
    `Application: ${input.application}`,
    `Colour / appearance: ${input.appearance}`,
    `Technical requirements: ${input.technicalRequirements}`,
    `Prepare: ${input.quantity} ${input.quantityUnit}`,
    `Packaging: ${input.packaging}`,
    `Customer acceptance focus: ${input.acceptanceCriteria}`,
  ].join("\n");
}

function quoteFieldLabels(fields: QuoteFieldName[]): string {
  return fields.map((field) => QUOTE_FIELD_LABELS[field] ?? field).join(", ");
}

function isDue(value: string | null, asOf: string): boolean {
  if (!value) return false;
  const target = new Date(value).getTime();
  const now = new Date(asOf).getTime();
  return Number.isFinite(target) && Number.isFinite(now) && target < now;
}

export function getTradeTodos(input: { quotes: QuoteDraftData[]; samples: SampleSnapshot[]; asOf: string }): TradeTodo[] {
  const todos: TradeTodo[] = [];

  for (const quote of input.quotes) {
    if (quote.status === "DRAFT") {
      const validation = validateQuoteDraft(quote);
      const fields = [...validation.missingFields, ...validation.invalidFields];
      if (fields.length > 0) {
        todos.push({
          kind: "QUOTE_MISSING_FIELDS",
          inquiryId: quote.inquiryId,
          priority: "high",
          title: "Complete quote conditions",
          detail: quoteFieldLabels(fields),
        });
      }
    } else if (quote.status === "READY_TO_REVIEW") {
      todos.push({
        kind: "QUOTE_REVIEW",
        inquiryId: quote.inquiryId,
        priority: "medium",
        title: "Review quote before manual sending",
        detail: `${quote.product || "Quote"} is ready for human review`,
      });
    } else if (quote.status === "SENT_MANUALLY") {
      if (!quote.followUpAt) {
        todos.push({
          kind: "QUOTE_FOLLOW_UP_MISSING",
          inquiryId: quote.inquiryId,
          priority: "medium",
          title: "Set quote follow-up time",
          detail: "The quote was marked as manually sent without a follow-up time",
        });
      } else if (isDue(quote.followUpAt, input.asOf)) {
        todos.push({
          kind: "QUOTE_FOLLOW_UP_DUE",
          inquiryId: quote.inquiryId,
          priority: "high",
          title: "Quote follow-up due",
          detail: `Human follow-up was due ${quote.followUpAt}`,
        });
      }
    }
  }

  for (const sample of input.samples) {
    if (sample.status === "NEEDS_INFORMATION") {
      const validation = validateSampleSnapshot(sample);
      todos.push({
        kind: "SAMPLE_MISSING_FIELDS",
        inquiryId: sample.inquiryId,
        priority: "high",
        title: `Complete sample version ${sample.version}`,
        detail: [...validation.missingFields, ...validation.invalidFields].join(", "),
      });
    } else if (sample.status === "READY_FOR_CUSTOMER_CONFIRMATION") {
      todos.push({
        kind: "SAMPLE_CONFIRMATION",
        inquiryId: sample.inquiryId,
        priority: "medium",
        title: `Review sample version ${sample.version}`,
        detail: "Copy the customer confirmation text after human review",
      });
    } else if (sample.status === "AWAITING_CONFIRMATION" && isDue(sample.targetConfirmationDate, input.asOf)) {
      todos.push({
        kind: "SAMPLE_CONFIRMATION_OVERDUE",
        inquiryId: sample.inquiryId,
        priority: "high",
        title: `Sample version ${sample.version} is overdue`,
        detail: `Customer confirmation target was ${sample.targetConfirmationDate}`,
      });
    } else if (sample.status === "CUSTOMER_CONFIRMED") {
      todos.push({
        kind: "SAMPLE_FACTORY_HANDOFF",
        inquiryId: sample.inquiryId,
        priority: "medium",
        title: `Hand sample version ${sample.version} to factory`,
        detail: "Use the customer-confirmed version for the internal handoff",
      });
    }
  }

  return todos;
}

function wholeDaysBetween(earlier: string, later: string): number {
  const start = new Date(earlier).getTime();
  const end = new Date(later).getTime();
  if (!Number.isFinite(start) || !Number.isFinite(end)) return 0;
  return Math.max(0, Math.floor((end - start) / 86_400_000));
}

export function getLeadAction(lead: Pick<SalesLead, "status" | "updatedAt">, asOf: string): LeadAction {
  const idleDays = wholeDaysBetween(lead.updatedAt, asOf);

  switch (lead.status) {
    case "NEW":
      return {
        label: "Reply to inquiry",
        detail: idleDays > 0 ? `Waiting ${idleDays}d for first response` : "New today",
        priority: "high",
        idleDays,
      };
    case "CONTACTED":
      return {
        label: "Confirm specifications",
        detail: idleDays > 0 ? `Last activity ${idleDays}d ago` : "Contacted today",
        priority: idleDays >= 3 ? "high" : "medium",
        idleDays,
      };
    case "QUOTED":
      return {
        label: "Follow up on quote",
        detail: idleDays > 0 ? `Quote idle for ${idleDays}d` : "Quote sent today",
        priority: idleDays >= 3 ? "high" : "medium",
        idleDays,
      };
    case "NEGOTIATING":
      return {
        label: "Resolve open terms",
        detail: idleDays > 0 ? `Negotiation idle for ${idleDays}d` : "Active today",
        priority: idleDays >= 2 ? "high" : "medium",
        idleDays,
      };
    case "WON":
      return { label: "Order won", detail: "No sales follow-up due", priority: "done", idleDays };
    case "LOST":
      return { label: "Lead closed", detail: "No sales follow-up due", priority: "done", idleDays };
    default:
      return { label: "Review lead", detail: "Unknown pipeline status", priority: "low", idleDays };
  }
}

type FollowUpDraftInput = {
  lead: Pick<SalesLead, "name" | "company" | "country" | "port" | "product" | "volume" | "incoterms" | "status">;
  language: DraftLanguage;
  tone: DraftTone;
};

type DraftCopy = {
  subject: (lead: FollowUpDraftInput["lead"]) => string;
  greeting: (name: string) => string;
  intro: Record<DraftTone, string>;
  stage: Record<"NEW" | "CONTACTED" | "QUOTED" | "NEGOTIATING" | "DEFAULT", string>;
  details: (lead: FollowUpDraftInput["lead"]) => string;
  close: Record<DraftTone, string>;
};

const DRAFT_COPY: Record<DraftLanguage, DraftCopy> = {
  en: {
    subject: (lead) => `${lead.product || "Product"} inquiry${lead.company ? ` for ${lead.company}` : ""}`,
    greeting: (name) => `Dear ${name || "Sir or Madam"},`,
    intro: {
      professional: "Thank you for contacting GreenPoly. We have reviewed your requirements and are ready to prepare the next step.",
      warm: "Thank you for reaching out to GreenPoly. It is a pleasure to learn about your sourcing needs.",
      concise: "Thank you for your inquiry. We are ready to proceed with your request.",
    },
    stage: {
      NEW: "Could you confirm the target application, color, and any MFI or impact requirements? We can then recommend the right grade and sample.",
      CONTACTED: "We are following up on the specifications discussed. Once confirmed, we can reserve the matching grade and prepare a firm offer.",
      QUOTED: "Please let us know whether the quotation and shipping terms meet your target. We can review the grade, packing, and shipment window with you.",
      NEGOTIATING: "We are ready to close the remaining commercial and technical terms so production and shipment planning can begin.",
      DEFAULT: "Please share any updated specifications or purchasing schedule, and we will prepare the appropriate next step.",
    },
    details: (lead) => `Current requirement: ${lead.product || "recycled plastic pellets"}${lead.volume ? `, ${lead.volume}` : ""}${lead.incoterms ? `, ${lead.incoterms}` : ""}${lead.port ? ` to ${lead.port}` : ""}.`,
    close: {
      professional: "We look forward to your confirmation.\n\nBest regards,\nGreenPoly Sales",
      warm: "Happy to help with samples or technical details.\n\nWarm regards,\nGreenPoly Sales",
      concise: "Please reply with your confirmation.\n\nRegards,\nGreenPoly Sales",
    },
  },
  fr: {
    subject: (lead) => `Demande ${lead.product || "produit"}${lead.company ? ` - ${lead.company}` : ""}`,
    greeting: (name) => `Bonjour ${name || "Madame, Monsieur"},`,
    intro: {
      professional: "Merci d'avoir contacté GreenPoly. Nous avons examiné votre demande et sommes prêts à préparer la prochaine étape.",
      warm: "Merci d'avoir contacté GreenPoly. Nous sommes ravis de découvrir vos besoins d'approvisionnement.",
      concise: "Merci pour votre demande. Nous sommes prêts à avancer.",
    },
    stage: {
      NEW: "Pourriez-vous confirmer l'application, la couleur et les exigences MFI ou de résistance aux chocs ? Nous pourrons ensuite recommander le grade et l'échantillon adaptés.",
      CONTACTED: "Nous revenons vers vous au sujet des spécifications discutées. Dès qu'elles sont confirmées, nous pouvons réserver le grade adapté et préparer une offre ferme.",
      QUOTED: "Merci de nous indiquer si notre offre et les conditions d'expédition correspondent à votre objectif. Nous pouvons ajuster le grade, l'emballage et la période d'expédition.",
      NEGOTIATING: "Nous sommes prêts à finaliser les conditions commerciales et techniques restantes afin de planifier la production et l'expédition.",
      DEFAULT: "Merci de partager toute mise à jour des spécifications ou du calendrier d'achat afin que nous préparions la prochaine étape.",
    },
    details: (lead) => `Besoin actuel : ${lead.product || "granulés de plastique recyclé"}${lead.volume ? `, ${lead.volume}` : ""}${lead.incoterms ? `, ${lead.incoterms}` : ""}${lead.port ? ` vers ${lead.port}` : ""}.`,
    close: {
      professional: "Dans l'attente de votre confirmation.\n\nCordialement,\nEquipe commerciale GreenPoly",
      warm: "Nous restons disponibles pour les échantillons et les détails techniques.\n\nBien cordialement,\nEquipe commerciale GreenPoly",
      concise: "Merci de nous confirmer votre choix.\n\nCordialement,\nEquipe commerciale GreenPoly",
    },
  },
  pt: {
    subject: (lead) => `Consulta sobre ${lead.product || "produto"}${lead.company ? ` - ${lead.company}` : ""}`,
    greeting: (name) => `Prezado(a) ${name || "Senhor(a)"},`,
    intro: {
      professional: "Obrigado por entrar em contato com a GreenPoly. Analisamos sua solicitação e estamos prontos para preparar a próxima etapa.",
      warm: "Obrigado por falar com a GreenPoly. É um prazer conhecer suas necessidades de compra.",
      concise: "Obrigado pela consulta. Estamos prontos para avançar.",
    },
    stage: {
      NEW: "Poderia confirmar a aplicação, a cor e os requisitos de MFI ou impacto? Assim poderemos recomendar o grau e a amostra adequados.",
      CONTACTED: "Estamos acompanhando as especificações discutidas. Após a confirmação, podemos reservar o grau adequado e preparar uma oferta firme.",
      QUOTED: "Por favor, informe se a cotação e as condições de embarque atendem ao seu objetivo. Podemos revisar o grau, a embalagem e a janela de envio.",
      NEGOTIATING: "Estamos prontos para concluir os termos comerciais e técnicos restantes e iniciar o planejamento da produção e do embarque.",
      DEFAULT: "Compartilhe qualquer atualização das especificações ou do cronograma de compra para prepararmos a próxima etapa.",
    },
    details: (lead) => `Necessidade atual: ${lead.product || "pellets de plástico reciclado"}${lead.volume ? `, ${lead.volume}` : ""}${lead.incoterms ? `, ${lead.incoterms}` : ""}${lead.port ? ` para ${lead.port}` : ""}.`,
    close: {
      professional: "Aguardamos sua confirmação.\n\nAtenciosamente,\nEquipe de vendas GreenPoly",
      warm: "Teremos prazer em ajudar com amostras ou detalhes técnicos.\n\nCordialmente,\nEquipe de vendas GreenPoly",
      concise: "Por favor, responda com sua confirmação.\n\nAtenciosamente,\nEquipe de vendas GreenPoly",
    },
  },
};

export function createFollowUpDraft(input: FollowUpDraftInput): { subject: string; body: string } {
  const copy = DRAFT_COPY[input.language];
  const stage = input.lead.status in copy.stage
    ? input.lead.status as keyof typeof copy.stage
    : "DEFAULT";

  return {
    subject: copy.subject(input.lead),
    body: [
      copy.greeting(input.lead.name),
      "",
      copy.intro[input.tone],
      "",
      copy.details(input.lead),
      "",
      copy.stage[stage],
      "",
      copy.close[input.tone],
    ].join("\n"),
  };
}
