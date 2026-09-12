import {
  InvalidScanTargetError,
  ScanFailedError,
  ScannerUnavailableError,
} from '../../scanner/errors/scanner.errors';
import { RepositoryFetchError } from '../repository/repository.errors';

/**
 * Traduce un error de la ejecución al mensaje que se guarda en la auditoría.
 * Solo los errores propios, redactados para el usuario, conservan su texto; el
 * resto se reemplaza por un mensaje genérico para no exponer detalles internos.
 */
export function toPublicFailureMessage(error: unknown): string {
  if (
    error instanceof RepositoryFetchError ||
    error instanceof ScanFailedError
  ) {
    return error.message;
  }

  if (error instanceof ScannerUnavailableError) {
    return 'El motor de escaneo no está disponible en este momento';
  }

  if (error instanceof InvalidScanTargetError) {
    return 'No se pudo preparar el código del repositorio para el escaneo';
  }

  return 'La auditoría falló por un error inesperado';
}
