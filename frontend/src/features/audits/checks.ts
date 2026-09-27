import { compareSeverity } from './labels';
import type { AuditCheck, CheckStatus } from './types';

/** Orden de los grupos de controles: primero lo que requiere acción. */
const STATUS_ORDER: readonly CheckStatus[] = ['failed', 'passed', 'skipped'];

/**
 * Ordena los controles para el detalle: incumplidos de mayor a menor
 * severidad, luego aprobados y al final omitidos. Dentro de cada grupo se
 * conserva el orden del backend. No modifica el arreglo recibido.
 */
export function sortChecks(checks: readonly AuditCheck[]): AuditCheck[] {
  return [...checks].sort((a, b) => {
    const byStatus =
      STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status);
    if (byStatus !== 0 || a.status !== 'failed') return byStatus;
    return compareSeverity(a.severity, b.severity);
  });
}
