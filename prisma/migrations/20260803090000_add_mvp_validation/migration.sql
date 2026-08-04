-- CreateTable
CREATE TABLE "MvpProspect" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "company" TEXT NOT NULL,
    "contactName" TEXT,
    "contactEmail" TEXT,
    "contactUrl" TEXT,
    "country" TEXT,
    "sourceChannel" TEXT NOT NULL,
    "shopUrl" TEXT,
    "sellsSandingDiscs" BOOLEAN NOT NULL DEFAULT false,
    "sellsToolStorage" BOOLEAN NOT NULL DEFAULT false,
    "evidence" TEXT,
    "stage" TEXT NOT NULL DEFAULT 'RESEARCH',
    "score" INTEGER NOT NULL DEFAULT 0,
    "scoreReasons" TEXT,
    "targetPriceUsd" REAL,
    "estimatedMonthlySets" INTEGER,
    "nextAction" TEXT,
    "nextActionAt" DATETIME,
    "lastContactedAt" DATETIME,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "MvpProspect_stage_idx" ON "MvpProspect"("stage");

-- CreateIndex
CREATE INDEX "MvpProspect_score_idx" ON "MvpProspect"("score");

-- CreateIndex
CREATE INDEX "MvpProspect_nextActionAt_idx" ON "MvpProspect"("nextActionAt");

-- CreateIndex
CREATE INDEX "MvpProspect_updatedAt_idx" ON "MvpProspect"("updatedAt");
