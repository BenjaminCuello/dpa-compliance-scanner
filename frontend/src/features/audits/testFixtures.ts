import type {
  AuditCheck,
  AuditDetail,
  AuditStatus,
  CheckSeverity,
  CheckStatus,
} from './types';

/** Control mínimo para pruebas; `extra` completa o reemplaza campos. */
export function makeCheck(
  code: string,
  status: CheckStatus,
  severity: CheckSeverity,
  extra: Partial<AuditCheck> = {},
): AuditCheck {
  return { code, title: code, status, severity, findings: [], ...extra };
}

/**
 * Detalle de auditoría para pruebas: controles desordenados a propósito
 * (aprobados, omitidos e incumplidos de distinta severidad mezclados) y un
 * `errorMessage` cuando la auditoría está `failed`.
 */
export function makeAuditDetail(id: string, status: AuditStatus): AuditDetail {
  return {
    id,
    status,
    complianceScore: status === 'completed' ? 40 : null,
    project: {
      id: 'p1',
      name: 'Portal',
      repositoryUrl: 'https://github.com/o/p',
    },
    createdAt: '2026-09-27T14:05:00.000Z',
    startedAt: '2026-09-27T14:05:10.000Z',
    finishedAt: null,
    errorMessage:
      status === 'failed' ? 'No se pudo clonar el repositorio' : null,
    totals: {
      totalChecks: 5,
      passedChecks: 2,
      failedChecks: 3,
      totalFindings: 4,
      findingsBySeverity: { low: 1, medium: 1, high: 0, critical: 2 },
    },
    checks: [
      makeCheck('OK-1', 'passed', 'critical'),
      makeCheck('LOW-1', 'failed', 'low'),
      makeCheck('SKIP-1', 'skipped', 'high'),
      makeCheck('SEC-1', 'failed', 'critical', {
        title: 'Secretos en el código',
        category: 'Seguridad',
        remediation: 'Mueve los secretos a variables de entorno.',
        findings: [
          { message: 'Clave API expuesta', filePath: 'src/x.ts', line: 12 },
        ],
      }),
      makeCheck('MED-1', 'failed', 'medium'),
    ],
  };
}
