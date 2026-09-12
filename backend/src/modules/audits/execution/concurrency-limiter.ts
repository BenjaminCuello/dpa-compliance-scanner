type Task<T> = () => Promise<T>;

/**
 * Ejecuta tareas asíncronas respetando un máximo simultáneo; las demás esperan
 * en orden de llegada. Evita que muchas auditorías a la vez saturen el servidor.
 */
export class ConcurrencyLimiter {
  private active = 0;
  private readonly waiting: Array<() => void> = [];

  constructor(private readonly maxConcurrent: number) {
    if (!Number.isInteger(maxConcurrent) || maxConcurrent < 1) {
      throw new Error(
        'El máximo de tareas simultáneas debe ser un entero positivo',
      );
    }
  }

  /** Cantidad de tareas en ejecución y en espera. */
  get load(): { active: number; waiting: number } {
    return { active: this.active, waiting: this.waiting.length };
  }

  async run<T>(task: Task<T>): Promise<T> {
    if (this.active >= this.maxConcurrent) {
      await new Promise<void>((resolve) => this.waiting.push(resolve));
    }

    this.active += 1;

    try {
      return await task();
    } finally {
      this.active -= 1;
      this.waiting.shift()?.();
    }
  }
}
