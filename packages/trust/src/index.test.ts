import { describe, expect, it } from 'vitest';
import { confidenceLabel, factKindLabel } from './index';

describe('trust helpers', () => {
  it('labels confidence levels', () => {
    expect(confidenceLabel('medium')).toBe('Medium confidence');
  });

  it('labels fact kinds', () => {
    expect(factKindLabel('opinion')).toBe('Style opinion');
  });
});
