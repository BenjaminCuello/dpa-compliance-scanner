import type { AuditStatus, CheckSeverity, CheckStatus } from './types';

/** Textos del estado de una auditoría. */
export const AUDIT_STATUS_LABELS: Record<AuditStatus, string> = {
  pending: 'En cola',
  running: 'En ejecución',
  completed: 'Completada',
  failed: 'Fallida',
};

/** Textos del resultado de un control. */
export const CHECK_STATUS_LABELS: Record<CheckStatus, string> = {
  passed: 'Aprobado',
  failed: 'Incumplido',
  skipped: 'Omitido',
};

/** Textos de la severidad de un control. */
export const CHECK_SEVERITY_LABELS: Record<CheckSeverity, string> = {
  low: 'Baja',
  medium: 'Media',
  high: 'Alta',
  critical: 'Crítica',
};

/** Severidades de mayor a menor impacto. */
export const SEVERITY_ORDER: readonly CheckSeverity[] = [
  'critical',
  'high',
  'medium',
  'low',
];

/** Comparador para `Array.sort` que deja primero lo más severo. */
export function compareSeverity(a: CheckSeverity, b: CheckSeverity): number {
  return SEVERITY_ORDER.indexOf(a) - SEVERITY_ORDER.indexOf(b);
}
