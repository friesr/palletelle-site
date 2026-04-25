const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
(async()=>{
  const products = await prisma.product.findMany({
    include: { lifecycleState: true, normalizedData: true, inferredData: true, reviewState: true, visibility: true },
    orderBy: { id: 'asc' },
  });
  const out = products.map(p=>({id:p.id,slug:p.slug,name:p.normalizedData?.title,review:p.lifecycleState?.reviewState,publish:p.lifecycleState?.publishState,preview:p.lifecycleState?.previewState,ingest:p.lifecycleState?.ingestState,confidence:p.inferredData?.dataConfidence}));
  console.log(JSON.stringify(out,null,2));
  await prisma.$disconnect();
})();