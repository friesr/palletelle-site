const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
(async()=>{
  const products = await prisma.product.findMany({
    where: { lifecycleState: { reviewState: 'approved' } },
    include: { sourceData: true, normalizedData: true, inferredData: true, lifecycleState: true },
    orderBy: { id: 'asc' },
  });
  const out = products.slice(0,15).map(p=>({
    id:p.id,
    slug:p.slug,
    source:p.sourceData[0] && {
      platform:p.sourceData[0].sourcePlatform,
      identifier:p.sourceData[0].sourceIdentifier,
      title:p.sourceData[0].title,
      categoryText:p.sourceData[0].categoryText,
      colorText:p.sourceData[0].colorText,
      priceText:p.sourceData[0].priceText,
      availabilityText:p.sourceData[0].availabilityText,
      rawSnapshotJson:p.sourceData[0].rawSnapshotJson,
    },
    normalized:p.normalizedData,
    inferred:p.inferredData,
    lifecycle:p.lifecycleState,
  }));
  console.log(JSON.stringify(out,null,2));
  await prisma.$disconnect();
})();