import { describe, expect, it } from 'vitest';
import { mapWithConcurrency } from './concurrency';

describe('mapWithConcurrency', () => {
  it('no supera el límite y conserva el orden', async () => {
    let inFlight = 0;
    let maxInFlight = 0;

    const results = await mapWithConcurrency(
      [5, 1, 3, 2, 4, 1],
      2,
      async (n) => {
        inFlight += 1;
        maxInFlight = Math.max(maxInFlight, inFlight);
        await new Promise((resolve) => setTimeout(resolve, n));
        inFlight -= 1;
        return n * 10;
      },
    );

    expect(maxInFlight).toBe(2);
    expect(results.map((r) => r.status === 'fulfilled' && r.value)).toEqual([
      50, 10, 30, 20, 40, 10,
    ]);
  });

  it('un rechazo no detiene al resto', async () => {
    const results = await mapWithConcurrency([1, 2, 3], 2, async (n) => {
      if (n === 2) throw new Error('falla');
      return n;
    });

    expect(results.map((r) => r.status)).toEqual([
      'fulfilled',
      'rejected',
      'fulfilled',
    ]);
  });

  it('resuelve vacío sin elementos', async () => {
    expect(await mapWithConcurrency([], 4, async () => 1)).toEqual([]);
  });
});
