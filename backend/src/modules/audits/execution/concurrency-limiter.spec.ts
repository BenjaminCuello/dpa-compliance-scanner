import { ConcurrencyLimiter } from './concurrency-limiter';

describe('ConcurrencyLimiter', () => {
  const deferred = () => {
    let resolve!: () => void;
    const promise = new Promise<void>((done) => (resolve = done));
    return { promise, resolve };
  };

  it('no supera el máximo de tareas simultáneas', async () => {
    const limiter = new ConcurrencyLimiter(2);
    const gates = [deferred(), deferred(), deferred()];
    let maxActive = 0;

    const runs = gates.map((gate) =>
      limiter.run(async () => {
        maxActive = Math.max(maxActive, limiter.load.active);
        await gate.promise;
      }),
    );

    await Promise.resolve();
    expect(limiter.load).toEqual({ active: 2, waiting: 1 });

    gates.forEach((gate) => gate.resolve());
    await Promise.all(runs);

    expect(maxActive).toBe(2);
    expect(limiter.load).toEqual({ active: 0, waiting: 0 });
  });

  it('libera el cupo aunque la tarea falle', async () => {
    const limiter = new ConcurrencyLimiter(1);

    await expect(
      limiter.run(() => Promise.reject(new Error('falla'))),
    ).rejects.toThrow('falla');
    await expect(limiter.run(() => Promise.resolve('siguiente'))).resolves.toBe(
      'siguiente',
    );
  });

  it('atiende las tareas en espera en orden de llegada', async () => {
    const limiter = new ConcurrencyLimiter(1);
    const order: number[] = [];

    await Promise.all(
      [1, 2, 3].map((n) =>
        limiter.run(async () => {
          order.push(n);
          await Promise.resolve();
        }),
      ),
    );

    expect(order).toEqual([1, 2, 3]);
  });

  it('rechaza un máximo inválido', () => {
    expect(() => new ConcurrencyLimiter(0)).toThrow();
    expect(() => new ConcurrencyLimiter(1.5)).toThrow();
  });
});
