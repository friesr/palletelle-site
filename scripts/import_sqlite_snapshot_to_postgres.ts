import { PrismaClient } from '@prisma/client';
import fs from 'node:fs';
import path from 'node:path';

const prisma = new PrismaClient();
const snapshotPath = path.resolve(process.cwd(), 'data/migration/sqlite-snapshot.json');

const tableOrder = [
  'Product',
  'ProductSourceData',
  'ProductPriceSnapshot',
  'ProductNormalizedData',
  'ProductInferredData',
  'ProductLifecycleState',
  'ProductLifecycleAudit',
  'ProductReviewState',
  'ProductVisibility',
  'ProductSourceHealth',
  'ExternalProductSignals',
  'CustomerReview',
  'ReviewSummary',
  'Ensemble',
  'EnsembleItem',
  'AffiliateConfig',
  'User',
  'UserProfile',
  'ColorProfile',
  'PreferenceProfile',
  'SavedProduct',
  'SavedEnsemble',
  'AuthMethod',
  'MFAEnrollment',
] as const;

type TableName = (typeof tableOrder)[number];

type Snapshot = {
  tables: Record<TableName, Record<string, unknown>[]>;
};

const delegates: Record<TableName, { createMany: (args: { data: Record<string, unknown>[]; skipDuplicates?: boolean }) => Promise<unknown> }> = {
  Product: prisma.product,
  ProductSourceData: prisma.productSourceData,
  ProductPriceSnapshot: prisma.productPriceSnapshot,
  ProductNormalizedData: prisma.productNormalizedData,
  ProductInferredData: prisma.productInferredData,
  ProductLifecycleState: prisma.productLifecycleState,
  ProductLifecycleAudit: prisma.productLifecycleAudit,
  ProductReviewState: prisma.productReviewState,
  ProductVisibility: prisma.productVisibility,
  ProductSourceHealth: prisma.productSourceHealth,
  ExternalProductSignals: prisma.externalProductSignals,
  CustomerReview: prisma.customerReview,
  ReviewSummary: prisma.reviewSummary,
  Ensemble: prisma.ensemble,
  EnsembleItem: prisma.ensembleItem,
  AffiliateConfig: prisma.affiliateConfig,
  User: prisma.user,
  UserProfile: prisma.userProfile,
  ColorProfile: prisma.colorProfile,
  PreferenceProfile: prisma.preferenceProfile,
  SavedProduct: prisma.savedProduct,
  SavedEnsemble: prisma.savedEnsemble,
  AuthMethod: prisma.authMethod,
  MFAEnrollment: prisma.mFAEnrollment,
};

async function main() {
  const snapshot = JSON.parse(fs.readFileSync(snapshotPath, 'utf8')) as Snapshot;

  for (const table of tableOrder) {
    const rows = snapshot.tables[table] ?? [];
    if (rows.length === 0) {
      console.log(`${table}: 0 rows, skipped`);
      continue;
    }

    await delegates[table].createMany({
      data: rows,
      skipDuplicates: true,
    });

    console.log(`${table}: imported ${rows.length}`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
