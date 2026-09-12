/** La URL entregada no apunta a un repositorio que se pueda auditar. */
export class InvalidRepositoryUrlError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidRepositoryUrlError';
  }
}

/**
 * No fue posible obtener el código del repositorio. El mensaje está pensado
 * para mostrarse al usuario: no incluye rutas ni salidas internas.
 */
export class RepositoryFetchError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RepositoryFetchError';
  }
}
