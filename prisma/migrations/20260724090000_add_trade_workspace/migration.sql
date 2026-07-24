-- Add operator-owned quote and sample workflow records without changing or
-- backfilling historical inquiries. inquiryId may reference the local Prisma
-- inquiry source or the configured Go BFF source, so no cross-service FK is used.
CREATE TABLE "QuoteDraft" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "inquiryId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "product" TEXT,
    "grade" TEXT,
    "quantityMt" REAL,
    "quantityUnit" TEXT,
    "currency" TEXT,
    "incoterm" TEXT,
    "originPort" TEXT,
    "destinationPort" TEXT,
    "supplierCostCnyPerMt" REAL,
    "inlandAndPortCny" REAL,
    "documentsCny" REAL,
    "exchangeRateCnyPerUsd" REAL,
    "targetMarginPercent" REAL,
    "oceanFreightUsd" REAL,
    "insurancePercent" REAL,
    "paymentTerms" TEXT,
    "packaging" TEXT,
    "leadTime" TEXT,
    "validUntil" DATETIME,
    "followUpAt" DATETIME,
    "sentAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

CREATE INDEX "QuoteDraft_inquiryId_idx" ON "QuoteDraft"("inquiryId");
CREATE INDEX "QuoteDraft_status_idx" ON "QuoteDraft"("status");
CREATE INDEX "QuoteDraft_followUpAt_idx" ON "QuoteDraft"("followUpAt");

CREATE TABLE "SampleConfirmation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "inquiryId" TEXT NOT NULL,
    "previousVersionId" TEXT,
    "version" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'NEEDS_INFORMATION',
    "product" TEXT,
    "grade" TEXT,
    "application" TEXT,
    "appearance" TEXT,
    "technicalRequirements" TEXT,
    "quantity" REAL,
    "quantityUnit" TEXT,
    "packaging" TEXT,
    "acceptanceCriteria" TEXT,
    "targetConfirmationDate" DATETIME,
    "customerConfirmedAt" DATETIME,
    "handedToFactoryAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

CREATE UNIQUE INDEX "SampleConfirmation_inquiryId_version_key" ON "SampleConfirmation"("inquiryId", "version");
CREATE INDEX "SampleConfirmation_inquiryId_idx" ON "SampleConfirmation"("inquiryId");
CREATE INDEX "SampleConfirmation_status_idx" ON "SampleConfirmation"("status");
CREATE INDEX "SampleConfirmation_targetConfirmationDate_idx" ON "SampleConfirmation"("targetConfirmationDate");
