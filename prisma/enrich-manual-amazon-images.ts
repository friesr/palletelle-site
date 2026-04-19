import { PrismaClient } from '@prisma/client';
import { manualAmazonImageSeeds } from './manual-amazon-image-seeds';

const prisma = new PrismaClient();

function dedupe(values: string[]) {
  return [...new Set(values.filter(Boolean))];
}

async function main() {
  for (const seed of manualAmazonImageSeeds) {
    const source = await prisma.productSourceData.findFirst({
      where: {
        sourcePlatform: 'amazon_manual',
        sourceIdentifier: seed.asin,
      },
    });

    if (!source) {
      console.warn(`No ProductSourceData found for ASIN ${seed.asin}`);
      continue;
    }

    const existing = source.rawSnapshotJson ? JSON.parse(source.rawSnapshotJson) : {};
    const images = dedupe([seed.image, ...(seed.images ?? []), ...(Array.isArray(existing.images) ? existing.images : [])]);
    const nextSnapshot = {
      ...existing,
      image: seed.image,
      imageUrl: seed.image,
      mainImage: seed.image,
      mainImageUrl: seed.image,
      images,
      additionalImages: images,
      gallery: images,
    };

    await prisma.productSourceData.update({
      where: { id: source.id },
      data: {
        title: source.title ?? seed.title ?? undefined,
        rawSnapshotJson: JSON.stringify(nextSnapshot),
        sourceFieldMapJson: JSON.stringify({
          ...(source.sourceFieldMapJson ? JSON.parse(source.sourceFieldMapJson) : {}),
          image: 'manual_amazon_image_seed.image',
          images: 'manual_amazon_image_seed.images',
        }),
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
