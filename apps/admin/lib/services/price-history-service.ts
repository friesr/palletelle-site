import { parsePriceText, shouldCreatePriceSnapshot } from '@atelier/domain';
import type { PrismaClient, Prisma } from '@prisma/client';

interface SourcePriceObservationInput {
  productId: string;
  productSourceDataId: string;
  priceText?: string | null;
  observedAt?: Date;
  captureMethod: string;
  notes?: string;
}

type PriceHistoryClient = PrismaClient | Prisma.TransactionClient;

export async function recordSourcePriceObservation(client: PriceHistoryClient, input: SourcePriceObservationInput) {
  if (!input.priceText) {
    return null;
  }

  const parsed = parsePriceText(input.priceText);
  const latest = await client.productPriceSnapshot.findFirst({
    where: { productSourceDataId: input.productSourceDataId },
    orderBy: { capturedAt: 'desc' },
  });

  const shouldCreate = shouldCreatePriceSnapshot(
    latest
      ? {
          priceText: latest.priceText,
          priceAmountCents: latest.priceAmountCents ?? undefined,
          currencyCode: latest.currencyCode ?? undefined,
        }
      : null,
    {
      priceText: input.priceText,
      priceAmountCents: parsed.amountCents,
      currencyCode: parsed.currencyCode,
    },
  );

  if (!shouldCreate) {
    return latest;
  }

  return client.productPriceSnapshot.create({
    data: {
      id: `${input.productId}-price-${Date.now()}`,
      productId: input.productId,
      productSourceDataId: input.productSourceDataId,
      capturedAt: input.observedAt ?? new Date(),
      priceText: input.priceText,
      priceAmountCents: parsed.amountCents,
      currencyCode: parsed.currencyCode,
      captureMethod: input.captureMethod,
      notes: input.notes,
    },
  });
}
