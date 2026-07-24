import type { QuoteDraftData, SampleSnapshot } from "../../src/lib/sales-tools";

export const COMPLETE_CIF_QUOTE: QuoteDraftData = {
  inquiryId: "inquiry-complete-cif",
  status: "DRAFT",
  product: "Recycled ABS Pellets",
  grade: "ABS-750A",
  quantityMt: 20,
  quantityUnit: "MT",
  currency: "USD",
  incoterm: "CIF",
  originPort: "Ningbo",
  destinationPort: "Santos",
  supplierCostCnyPerMt: 7200,
  inlandAndPortCny: 6000,
  documentsCny: 3000,
  exchangeRateCnyPerUsd: 7.2,
  targetMarginPercent: 15,
  oceanFreightUsd: 1600,
  insurancePercent: 0.3,
  paymentTerms: "30% deposit, 70% before shipment",
  packaging: "25 kg bags on pallets",
  leadTime: "15-20 days after deposit",
  validUntil: "2026-08-15",
  followUpAt: "2026-07-30T09:00:00.000Z",
  sentAt: null,
};

export const CIF_QUOTE_WITHOUT_DESTINATION: QuoteDraftData = {
  ...COMPLETE_CIF_QUOTE,
  inquiryId: "inquiry-missing-destination",
  destinationPort: "",
};

export const CONFIRMED_SAMPLE: SampleSnapshot = {
  inquiryId: "inquiry-sample-version",
  version: 1,
  status: "CUSTOMER_CONFIRMED",
  product: "Recycled ABS Pellets",
  grade: "ABS-750A",
  application: "Injection-moulded appliance housings",
  appearance: "Black, uniform pellets",
  technicalRequirements: "MFI 12-16 g/10 min; impact >= 15 kJ/m2",
  quantity: 2,
  quantityUnit: "kg",
  packaging: "Two sealed 1 kg bags",
  acceptanceCriteria: "Stable moulding and no visible contamination",
  targetConfirmationDate: "2026-07-29",
  customerConfirmedAt: "2026-07-24T08:00:00.000Z",
  handedToFactoryAt: null,
};

export const CHANGED_SAMPLE: SampleSnapshot = {
  ...CONFIRMED_SAMPLE,
  version: 2,
  status: "READY_FOR_CUSTOMER_CONFIRMATION",
  quantity: 3,
  acceptanceCriteria: "Stable moulding, no visible contamination, Delta E below 1.5",
  customerConfirmedAt: null,
};
