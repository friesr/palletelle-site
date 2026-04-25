-- Product pipeline candidate + event models for deterministic worker loop
CREATE TYPE "ProductPipelineStage" AS ENUM ('discovery_candidate', 'url_verified', 'page_sampled', 'extracted', 'scored', 'staged_for_store', 'rejected');
CREATE TYPE "ProductPipelineEventType" AS ENUM ('advanced', 'rejected', 'retry_scheduled', 'merged_duplicate', 'failed');

CREATE TABLE "ProductPipelineCandidate" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "sourceUrl" TEXT NOT NULL,
  "asin" TEXT,
  "sourcePlatform" TEXT NOT NULL DEFAULT 'amazon',
  "currentStage" "ProductPipelineStage" NOT NULL DEFAULT 'discovery_candidate',
  "attemptCount" INTEGER NOT NULL DEFAULT 0,
  "nextAttemptAt" TIMESTAMPTZ,
  "lastAttemptAt" TIMESTAMPTZ,
  "lastError" TEXT,
  "finalResolvedUrl" TEXT,
  "latestHttpStatus" INTEGER,
  "title" TEXT,
  "imageUrl" TEXT,
  "priceText" TEXT,
  "category" TEXT,
  "vettingStatus" TEXT,
  "rejectionReason" TEXT,
  "scoredAt" TIMESTAMPTZ,
  "stagedProductId" TEXT,
  "duplicateOfId" TEXT,
  "metadataJson" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX "ProductPipelineCandidate_sourceUrl_key" ON "ProductPipelineCandidate"("sourceUrl");
CREATE INDEX "ProductPipelineCandidate_currentStage_nextAttemptAt_idx" ON "ProductPipelineCandidate"("currentStage", "nextAttemptAt");
CREATE INDEX "ProductPipelineCandidate_asin_idx" ON "ProductPipelineCandidate"("asin");

CREATE TABLE "ProductPipelineEvent" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "candidateId" TEXT NOT NULL,
  "eventType" "ProductPipelineEventType" NOT NULL,
  "fromStage" "ProductPipelineStage",
  "toStage" "ProductPipelineStage" NOT NULL,
  "reason" TEXT,
  "httpStatus" INTEGER,
  "finalResolvedUrl" TEXT,
  "errorPayloadJson" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ProductPipelineEvent_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "ProductPipelineCandidate" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "ProductPipelineEvent_candidateId_createdAt_idx" ON "ProductPipelineEvent"("candidateId", "createdAt");
CREATE INDEX "ProductPipelineEvent_toStage_createdAt_idx" ON "ProductPipelineEvent"("toStage", "createdAt");
