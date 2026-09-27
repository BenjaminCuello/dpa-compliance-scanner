/**
 * Umbrales del puntaje de cumplimiento (porcentaje de controles aprobados):
 * - `good`: desde 80 el cumplimiento se considera bueno.
 * - `fair`: desde 50 y bajo 80 es regular.
 * - Bajo 50 es bajo.
 */
export const COMPLIANCE_THRESHOLDS = {
  good: 80,
  fair: 50,
} as const;

/** Nivel de cumplimiento; `none` cuando la auditoría aún no tiene puntaje. */
export type ComplianceLevel = 'good' | 'fair' | 'low' | 'none';

/** Textos de cada nivel de cumplimiento. */
export const COMPLIANCE_LEVEL_LABELS: Record<ComplianceLevel, string> = {
  good: 'Bueno',
  fair: 'Regular',
  low: 'Bajo',
  none: 'Sin puntaje',
};

/** Clasifica un puntaje según `COMPLIANCE_THRESHOLDS`. */
export function classifyComplianceScore(score: number | null): ComplianceLevel {
  if (score === null) {
    return 'none';
  }

  if (score >= COMPLIANCE_THRESHOLDS.good) {
    return 'good';
  }

  return score >= COMPLIANCE_THRESHOLDS.fair ? 'fair' : 'low';
}
