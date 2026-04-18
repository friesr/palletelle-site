export interface PriceSnapshotRecord {
  priceText: string;
  priceAmountCents?: number;
  currencyCode?: string;
  capturedAt: string;
  captureMethod?: string;
}

export interface ParsedPrice {
  amountCents?: number;
  currencyCode?: string;
}

export interface PriceTrackingSummary {
  currentPriceText?: string;
  previousComparablePriceText?: string;
  lowestObservedPriceText?: string;
  hasPriceDrop: boolean;
  isLowestObserved: boolean;
  observedPriceCount: number;
  note: string;
}

export function parsePriceText(priceText?: string | null): ParsedPrice {
  if (!priceText) {
    return {};
  }

  const normalized = priceText.trim().replace(/,/g, '');
  const usdMatch = normalized.match(/^\$(\d+(?:\.\d{1,2})?)$/);
  const usdCodeMatch = normalized.match(/^USD\s*(\d+(?:\.\d{1,2})?)$/i);
  const rawAmount = usdMatch?.[1] ?? usdCodeMatch?.[1];

  if (!rawAmount) {
    return {};
  }

  const numericAmount = Number(rawAmount);
  if (!Number.isFinite(numericAmount)) {
    return {};
  }

  return {
    amountCents: Math.round(numericAmount * 100),
    currencyCode: 'USD',
  };
}

export function assessPriceTrackingHistory(snapshots: PriceSnapshotRecord[]): PriceTrackingSummary {
  if (snapshots.length === 0) {
    return {
      hasPriceDrop: false,
      isLowestObserved: false,
      observedPriceCount: 0,
      note: 'No tracked price snapshots exist yet.',
    };
  }

  const ordered = [...snapshots].sort((a, b) => new Date(b.capturedAt).getTime() - new Date(a.capturedAt).getTime());
  const current = ordered[0];
  const numericSnapshots = ordered.filter((snapshot) => typeof snapshot.priceAmountCents === 'number');
  const currentNumeric = typeof current.priceAmountCents === 'number' ? current : null;

  if (!currentNumeric || numericSnapshots.length < 2) {
    return {
      currentPriceText: current.priceText,
      hasPriceDrop: false,
      isLowestObserved: false,
      observedPriceCount: numericSnapshots.length,
      note: 'Need at least two tracked numeric price snapshots before highlighting a price drop or lowest observed price.',
    };
  }

  const previousComparable = numericSnapshots.find((snapshot) => snapshot.capturedAt !== currentNumeric.capturedAt);
  const lowestObserved = numericSnapshots.reduce((lowest, snapshot) => {
    if ((snapshot.priceAmountCents ?? Number.POSITIVE_INFINITY) < (lowest.priceAmountCents ?? Number.POSITIVE_INFINITY)) {
      return snapshot;
    }
    return lowest;
  }, numericSnapshots[0]);

  const hasPriceDrop = Boolean(previousComparable && (currentNumeric.priceAmountCents ?? 0) < (previousComparable.priceAmountCents ?? 0));
  const isLowestObserved = (currentNumeric.priceAmountCents ?? Number.POSITIVE_INFINITY) <= (lowestObserved.priceAmountCents ?? Number.POSITIVE_INFINITY);

  let note = 'Current tracked price has not dropped below the prior tracked snapshot.';
  if (hasPriceDrop && isLowestObserved) {
    note = 'Current tracked price is lower than the prior tracked snapshot and matches the lowest observed tracked price.';
  } else if (hasPriceDrop) {
    note = 'Current tracked price is lower than the prior tracked snapshot.';
  } else if (isLowestObserved) {
    note = 'Current tracked price matches the lowest observed tracked price.';
  }

  return {
    currentPriceText: current.priceText,
    previousComparablePriceText: previousComparable?.priceText,
    lowestObservedPriceText: lowestObserved.priceText,
    hasPriceDrop,
    isLowestObserved,
    observedPriceCount: numericSnapshots.length,
    note,
  };
}
