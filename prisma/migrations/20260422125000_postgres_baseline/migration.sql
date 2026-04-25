-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "public"."ProductWorkflowState" AS ENUM ('discovered', 'normalized', 'needs_review', 'hold', 'approved', 'rejected', 'stale', 'needs_refresh');

-- CreateEnum
CREATE TYPE "public"."ProductIngestState" AS ENUM ('manual_seeded', 'source_captured', 'normalized', 'refresh_required');

-- CreateEnum
CREATE TYPE "public"."ProductReviewStatus" AS ENUM ('pending', 'approved', 'hold', 'rejected');

-- CreateEnum
CREATE TYPE "public"."ProductPreviewStatus" AS ENUM ('none', 'admin_only', 'dev_customer');

-- CreateEnum
CREATE TYPE "public"."ProductPublishStatus" AS ENUM ('unpublished', 'published', 'withdrawn');

-- CreateEnum
CREATE TYPE "public"."SourceStatus" AS ENUM ('unknown', 'active', 'inactive', 'unavailable', 'changed');

-- CreateEnum
CREATE TYPE "public"."ExternalReputationState" AS ENUM ('unknown', 'healthy', 'caution', 'at_risk');

-- CreateEnum
CREATE TYPE "public"."ExternalRecommendation" AS ENUM ('none', 'hold', 'deactivate', 'needs_review');

-- CreateEnum
CREATE TYPE "public"."ModerationStatus" AS ENUM ('pending', 'approved', 'rejected');

-- CreateEnum
CREATE TYPE "public"."CustomerRole" AS ENUM ('customer', 'admin');

-- CreateEnum
CREATE TYPE "public"."AuthMethodType" AS ENUM ('password', 'passkey', 'totp');

-- CreateTable
CREATE TABLE "public"."Product" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProductLifecycleState" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "ingestState" "public"."ProductIngestState" NOT NULL,
    "reviewState" "public"."ProductReviewStatus" NOT NULL,
    "previewState" "public"."ProductPreviewStatus" NOT NULL,
    "publishState" "public"."ProductPublishStatus" NOT NULL,
    "stateNotes" TEXT,
    "lastChangedAt" TIMESTAMP(3),
    "lastChangedBy" TEXT,

    CONSTRAINT "ProductLifecycleState_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProductLifecycleAudit" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "changedAt" TIMESTAMP(3) NOT NULL,
    "changedBy" TEXT NOT NULL,
    "fromIngestState" "public"."ProductIngestState" NOT NULL,
    "toIngestState" "public"."ProductIngestState" NOT NULL,
    "fromReviewState" "public"."ProductReviewStatus" NOT NULL,
    "toReviewState" "public"."ProductReviewStatus" NOT NULL,
    "fromPreviewState" "public"."ProductPreviewStatus" NOT NULL,
    "toPreviewState" "public"."ProductPreviewStatus" NOT NULL,
    "fromPublishState" "public"."ProductPublishStatus" NOT NULL,
    "toPublishState" "public"."ProductPublishStatus" NOT NULL,
    "reason" TEXT,

    CONSTRAINT "ProductLifecycleAudit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProductPriceSnapshot" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "productSourceDataId" TEXT NOT NULL,
    "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "priceText" TEXT NOT NULL,
    "priceAmountCents" INTEGER,
    "currencyCode" TEXT,
    "captureMethod" TEXT NOT NULL,
    "notes" TEXT,

    CONSTRAINT "ProductPriceSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProductSourceData" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "sourcePlatform" TEXT NOT NULL,
    "ingestMethod" TEXT,
    "sourceIdentifier" TEXT NOT NULL,
    "canonicalUrl" TEXT,
    "affiliateUrl" TEXT,
    "retrievedAt" TIMESTAMP(3) NOT NULL,
    "title" TEXT,
    "categoryText" TEXT,
    "colorText" TEXT,
    "priceText" TEXT,
    "availabilityText" TEXT,
    "rawSnapshotJson" TEXT,
    "sourceFieldMapJson" TEXT,

    CONSTRAINT "ProductSourceData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProductNormalizedData" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "brand" TEXT,
    "category" TEXT,
    "sourceColor" TEXT,
    "material" TEXT,
    "priceText" TEXT,
    "availabilityText" TEXT,
    "summary" TEXT,

    CONSTRAINT "ProductNormalizedData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProductInferredData" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "paletteFamily" TEXT,
    "colorHarmony" TEXT,
    "styleDirection" TEXT,
    "styleOpinion" TEXT,
    "dataConfidence" TEXT NOT NULL,
    "confidenceReason" TEXT NOT NULL,
    "confidenceImprovement" TEXT NOT NULL,
    "missingAttributesJson" TEXT NOT NULL,
    "uncertainAttributesJson" TEXT NOT NULL,

    CONSTRAINT "ProductInferredData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProductReviewState" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "workflowState" "public"."ProductWorkflowState" NOT NULL,
    "reviewedAt" TIMESTAMP(3),
    "reviewedBy" TEXT,
    "reviewerNotes" TEXT,

    CONSTRAINT "ProductReviewState_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProductVisibility" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "intendedActive" BOOLEAN NOT NULL DEFAULT false,
    "visibilityNotes" TEXT,
    "lastDisplayabilityCheckAt" TIMESTAMP(3),

    CONSTRAINT "ProductVisibility_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProductSourceHealth" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "sourceStatus" "public"."SourceStatus" NOT NULL DEFAULT 'unknown',
    "lastSourceCheckAt" TIMESTAMP(3),
    "sourceCheckResult" TEXT,
    "needsRevalidation" BOOLEAN NOT NULL DEFAULT false,
    "revalidationReason" TEXT,

    CONSTRAINT "ProductSourceHealth_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ExternalProductSignals" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "reputationState" "public"."ExternalReputationState" NOT NULL DEFAULT 'unknown',
    "lastExternalCheckAt" TIMESTAMP(3),
    "repeatedComplaintPattern" BOOLEAN NOT NULL DEFAULT false,
    "lowRatingRisk" BOOLEAN NOT NULL DEFAULT false,
    "recommendation" "public"."ExternalRecommendation" NOT NULL DEFAULT 'none',
    "notes" TEXT,

    CONSTRAINT "ExternalProductSignals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CustomerReview" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "userId" TEXT,
    "rating" INTEGER,
    "title" TEXT,
    "body" TEXT,
    "moderationStatus" "public"."ModerationStatus" NOT NULL DEFAULT 'pending',
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "moderatedAt" TIMESTAMP(3),

    CONSTRAINT "CustomerReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ReviewSummary" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "complaintTrend" TEXT,
    "moderationNote" TEXT,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReviewSummary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Ensemble" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "confidence" TEXT NOT NULL,
    "objectiveMatch" TEXT NOT NULL,
    "inferredMatch" TEXT NOT NULL,
    "subjectiveSuggestion" TEXT NOT NULL,
    "paletteFamiliesJson" TEXT NOT NULL,
    "colorProfileTagsJson" TEXT NOT NULL,
    "preferenceTagsJson" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ensemble_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."EnsembleItem" (
    "id" TEXT NOT NULL,
    "ensembleId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL,
    "notes" TEXT,

    CONSTRAINT "EnsembleItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AffiliateConfig" (
    "id" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "storeName" TEXT NOT NULL,
    "associateStoreId" TEXT,
    "apiStatus" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "freshnessPriceHours" INTEGER NOT NULL,
    "freshnessAvailabilityHours" INTEGER NOT NULL,
    "connectionNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AffiliateConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "public"."CustomerRole" NOT NULL DEFAULT 'customer',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastSignedInAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "displayName" TEXT,
    "pronouns" TEXT,
    "timezone" TEXT,
    "locale" TEXT,
    "onboardingState" TEXT NOT NULL,

    CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ColorProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "paletteFamily" TEXT,
    "undertone" TEXT,
    "contrastLevel" TEXT,
    "source" TEXT NOT NULL,
    "confidence" TEXT NOT NULL,
    "notes" TEXT,

    CONSTRAINT "ColorProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PreferenceProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "preferredCategoriesJson" TEXT NOT NULL,
    "avoidedColorsJson" TEXT NOT NULL,
    "likedPaletteFamiliesJson" TEXT NOT NULL,
    "dislikedPaletteFamiliesJson" TEXT NOT NULL,
    "fitNotesJson" TEXT NOT NULL,
    "savedForLaterEnabled" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "PreferenceProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SavedProduct" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "savedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "note" TEXT,

    CONSTRAINT "SavedProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SavedEnsemble" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "ensembleId" TEXT NOT NULL,
    "savedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "note" TEXT,

    CONSTRAINT "SavedEnsemble_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AuthMethod" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "public"."AuthMethodType" NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "passwordHash" TEXT,
    "passwordUpdatedAt" TIMESTAMP(3),
    "passkeyLabel" TEXT,
    "credentialId" TEXT,
    "publicKey" TEXT,
    "counter" INTEGER,
    "transportsJson" TEXT,
    "backedUp" BOOLEAN,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUsedAt" TIMESTAMP(3),

    CONSTRAINT "AuthMethod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."MFAEnrollment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "enrolledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "verifiedAt" TIMESTAMP(3),

    CONSTRAINT "MFAEnrollment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Product_slug_key" ON "public"."Product"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "ProductLifecycleState_productId_key" ON "public"."ProductLifecycleState"("productId");

-- CreateIndex
CREATE INDEX "ProductLifecycleAudit_productId_changedAt_idx" ON "public"."ProductLifecycleAudit"("productId", "changedAt");

-- CreateIndex
CREATE INDEX "ProductPriceSnapshot_productId_capturedAt_idx" ON "public"."ProductPriceSnapshot"("productId", "capturedAt");

-- CreateIndex
CREATE INDEX "ProductPriceSnapshot_productSourceDataId_capturedAt_idx" ON "public"."ProductPriceSnapshot"("productSourceDataId", "capturedAt");

-- CreateIndex
CREATE INDEX "ProductSourceData_productId_idx" ON "public"."ProductSourceData"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductNormalizedData_productId_key" ON "public"."ProductNormalizedData"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductInferredData_productId_key" ON "public"."ProductInferredData"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductReviewState_productId_key" ON "public"."ProductReviewState"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductVisibility_productId_key" ON "public"."ProductVisibility"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductSourceHealth_productId_key" ON "public"."ProductSourceHealth"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "ExternalProductSignals_productId_key" ON "public"."ExternalProductSignals"("productId");

-- CreateIndex
CREATE INDEX "CustomerReview_productId_idx" ON "public"."CustomerReview"("productId");

-- CreateIndex
CREATE INDEX "ReviewSummary_productId_idx" ON "public"."ReviewSummary"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "Ensemble_slug_key" ON "public"."Ensemble"("slug");

-- CreateIndex
CREATE INDEX "EnsembleItem_ensembleId_idx" ON "public"."EnsembleItem"("ensembleId");

-- CreateIndex
CREATE INDEX "EnsembleItem_productId_idx" ON "public"."EnsembleItem"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_userId_key" ON "public"."UserProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ColorProfile_userId_key" ON "public"."ColorProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PreferenceProfile_userId_key" ON "public"."PreferenceProfile"("userId");

-- CreateIndex
CREATE INDEX "SavedProduct_userId_idx" ON "public"."SavedProduct"("userId");

-- CreateIndex
CREATE INDEX "SavedProduct_productId_idx" ON "public"."SavedProduct"("productId");

-- CreateIndex
CREATE INDEX "SavedEnsemble_userId_idx" ON "public"."SavedEnsemble"("userId");

-- CreateIndex
CREATE INDEX "SavedEnsemble_ensembleId_idx" ON "public"."SavedEnsemble"("ensembleId");

-- CreateIndex
CREATE INDEX "AuthMethod_userId_idx" ON "public"."AuthMethod"("userId");

-- CreateIndex
CREATE INDEX "MFAEnrollment_userId_idx" ON "public"."MFAEnrollment"("userId");

-- AddForeignKey
ALTER TABLE "public"."ProductLifecycleState" ADD CONSTRAINT "ProductLifecycleState_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProductLifecycleAudit" ADD CONSTRAINT "ProductLifecycleAudit_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProductPriceSnapshot" ADD CONSTRAINT "ProductPriceSnapshot_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProductPriceSnapshot" ADD CONSTRAINT "ProductPriceSnapshot_productSourceDataId_fkey" FOREIGN KEY ("productSourceDataId") REFERENCES "public"."ProductSourceData"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProductSourceData" ADD CONSTRAINT "ProductSourceData_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProductNormalizedData" ADD CONSTRAINT "ProductNormalizedData_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProductInferredData" ADD CONSTRAINT "ProductInferredData_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProductReviewState" ADD CONSTRAINT "ProductReviewState_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProductVisibility" ADD CONSTRAINT "ProductVisibility_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProductSourceHealth" ADD CONSTRAINT "ProductSourceHealth_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ExternalProductSignals" ADD CONSTRAINT "ExternalProductSignals_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CustomerReview" ADD CONSTRAINT "CustomerReview_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CustomerReview" ADD CONSTRAINT "CustomerReview_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ReviewSummary" ADD CONSTRAINT "ReviewSummary_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EnsembleItem" ADD CONSTRAINT "EnsembleItem_ensembleId_fkey" FOREIGN KEY ("ensembleId") REFERENCES "public"."Ensemble"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EnsembleItem" ADD CONSTRAINT "EnsembleItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserProfile" ADD CONSTRAINT "UserProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ColorProfile" ADD CONSTRAINT "ColorProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PreferenceProfile" ADD CONSTRAINT "PreferenceProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SavedProduct" ADD CONSTRAINT "SavedProduct_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SavedProduct" ADD CONSTRAINT "SavedProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SavedEnsemble" ADD CONSTRAINT "SavedEnsemble_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SavedEnsemble" ADD CONSTRAINT "SavedEnsemble_ensembleId_fkey" FOREIGN KEY ("ensembleId") REFERENCES "public"."Ensemble"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AuthMethod" ADD CONSTRAINT "AuthMethod_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MFAEnrollment" ADD CONSTRAINT "MFAEnrollment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

