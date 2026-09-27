/**
 * Aplica `task` a cada elemento con a lo más `limit` tareas en vuelo. Igual
 * que `Promise.allSettled`, un rechazo no detiene al resto y el resultado
 * conserva el orden de `items`.
 */
export async function mapWithConcurrency<T, R>(
  items: readonly T[],
  limit: number,
  task: (item: T) => Promise<R>,
): Promise<PromiseSettledResult<R>[]> {
  const results: PromiseSettledResult<R>[] = new Array(items.length);
  let next = 0;

  async function worker() {
    while (next < items.length) {
      const index = next++;
      try {
        results[index] = {
          status: 'fulfilled',
          value: await task(items[index]),
        };
      } catch (reason) {
        results[index] = { status: 'rejected', reason };
      }
    }
  }

  const workers = Math.max(1, Math.min(limit, items.length));
  await Promise.all(Array.from({ length: workers }, worker));
  return results;
}
