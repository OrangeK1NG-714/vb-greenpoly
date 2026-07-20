-- AlterTable: add IP/geolocation columns to Session
ALTER TABLE "Session" ADD COLUMN "ipAddress" TEXT;
ALTER TABLE "Session" ADD COLUMN "countryCode" TEXT;
ALTER TABLE "Session" ADD COLUMN "region" TEXT;
ALTER TABLE "Session" ADD COLUMN "latitude" REAL;
ALTER TABLE "Session" ADD COLUMN "longitude" REAL;
ALTER TABLE "Session" ADD COLUMN "isp" TEXT;
ALTER TABLE "Session" ADD COLUMN "timezone" TEXT;

-- CreateIndex
CREATE INDEX "Session_ipAddress_idx" ON "Session"("ipAddress");
