import { describe, expect, it } from 'vitest';
import { assessPriceTrackingHistory, parsePriceText } from './price-tracking';

describe('price tracking helpers', () => {
  it('parses simple USD price text safely', () => {
    expect(parsePriceText('$148')).toEqual({ amountCents: 14800, currencyCode: 'USD' });
    expect(parsePriceText('$148 fixture')).toEqual({});
  });

  it('only highlights a drop when tracked history supports it', () => {
    const summary = assessPriceTrackingHistory([
      { priceText: '$120', priceAmountCents: 12000, currencyCode: 'USD', capturedAt: '2026-04-18T12:00:00.000Z' },
      { priceText: '$140', priceAmountCents: 14000, currencyCode: 'USD', capturedAt: '2026-04-17T12:00:00.000Z' },
    ]);

    expect(summary.hasPriceDrop).toBe(true);
    expect(summary.isLowestObserved).toBe(true);
    expect(summary.lowestObservedPriceText).toBe('$120');
  });
});
