const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
(async()=>{
  const products = await prisma.product.findMany({
    where: { lifecycleState: { reviewState: 'approved' } },
    include: { normalizedData: true, inferredData: true, lifecycleState: true, sourceHealth: true, externalSignals: true },
    orderBy: { id: 'asc' },
  });
  const out = products.map(p=>({
    id:p.id,
    slug:p.slug,
    title:p.normalizedData?.title,
    category:p.normalizedData?.category,
    sourceColor:p.normalizedData?.sourceColor,
    material:p.normalizedData?.material,
    paletteFamily:p.inferredData?.paletteFamily,
    colorHarmony:p.inferredData?.colorHarmony,
    styleDirection:p.inferredData?.styleDirection,
    dataConfidence:p.inferredData?.dataConfidence,
    confidenceReason:p.inferredData?.confidenceReason,
    missing: safe(p.inferredData?.missingAttributesJson),
    uncertain: safe(p.inferredData?.uncertainAttributesJson),
    review:p.lifecycleState?.reviewState,
    publish:p.lifecycleState?.publishState,
    preview:p.lifecycleState?.previewState,
  }));
  console.log(JSON.stringify(out,null,2));
  await prisma.$disconnect();
})();
function safe(s){try{return JSON.parse(s||'[]')}catch{return s}}
