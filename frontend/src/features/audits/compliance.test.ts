import { describe, expect, it } from 'vitest';
import { classifyComplianceScore } from './compliance';

describe('classifyComplianceScore', () => {
  it.each([
    [null, 'none'],
    [49.99, 'low'],
    [50, 'fair'],
    [79.99, 'fair'],
    [80, 'good'],
  ] as const)('clasifica %s como %s', (score, level) => {
    expect(classifyComplianceScore(score)).toBe(level);
  });
});
