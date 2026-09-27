import { describe, expect, it } from 'vitest';
import { EMPTY_PERCENT, formatPercent } from './number';

describe('formatPercent', () => {
  it.each([
    [85.5, '85,5%'],
    [100, '100,0%'],
    [66.67, '66,7%'],
    [0, '0,0%'],
  ])('formatea %s como %s', (value, expected) => {
    expect(formatPercent(value)).toBe(expected);
  });

  it('devuelve un guion largo si no hay valor', () => {
    expect(formatPercent(null)).toBe(EMPTY_PERCENT);
    expect(formatPercent(undefined)).toBe(EMPTY_PERCENT);
  });
});
