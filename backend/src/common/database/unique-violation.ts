import { QueryFailedError } from 'typeorm';

/** Código de PostgreSQL para una restricción de unicidad violada. */
const UNIQUE_VIOLATION = '23505';

/**
 * Indica si el error viene de un registro duplicado.
 *
 * Verificar antes de insertar no basta: entre la consulta y la inserción puede
 * entrar otra petición. La base de datos es la única que puede decidirlo, y
 * cuando rechaza el registro corresponde responder un conflicto y no un error
 * interno.
 * @param error Error capturado al guardar.
 */
export function isUniqueViolation(error: unknown): boolean {
  return (
    error instanceof QueryFailedError &&
    (error.driverError as { code?: string } | undefined)?.code ===
      UNIQUE_VIOLATION
  );
}
