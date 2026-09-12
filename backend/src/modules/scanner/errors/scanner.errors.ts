/** El directorio indicado no es un objetivo de escaneo permitido. */
export class InvalidScanTargetError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidScanTargetError';
  }
}

/** El ejecutable de Semgrep no está disponible en el sistema. */
export class ScannerUnavailableError extends Error {
  constructor() {
    super('El motor de escaneo no está instalado o no se encuentra en el PATH');
    this.name = 'ScannerUnavailableError';
  }
}

/** Semgrep terminó con error, excedió el tiempo o entregó una salida ilegible. */
export class ScanFailedError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = 'ScanFailedError';
  }
}

/** Las reglas de escaneo tienen una definición incompleta o inválida. */
export class InvalidRuleCatalogError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidRuleCatalogError';
  }
}
