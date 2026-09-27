import { makeAuditDetail } from '../audits/testFixtures';
import type {
  AuditCheck,
  AuditDetail,
  AuditStatus,
  AuditSummary,
  CheckSeverity,
} from '../audits/types';

/**
 * Auditoría del proyecto `projectId` terminada el día `day` de septiembre de
 * 2026. Las que no están `completed` no tienen puntaje ni `finishedAt`.
 */
export function makeSummary(
  id: string,
  projectId: string,
  day: number,
  score: number | null = 50,
  status: AuditStatus = 'completed',
): AuditSummary {
  const date = `2026-09-${String(day).padStart(2, '0')}T10:00:00.000Z`;
  const completed = status === 'completed';

  return {
    id,
    status,
    complianceScore: completed ? score : null,
    project: {
      id: projectId,
      name: `Proyecto ${projectId}`,
      repositoryUrl: `https://github.com/o/${projectId}`,
    },
    createdAt: date,
    startedAt: date,
    finishedAt: completed || status === 'failed' ? date : null,
    errorMessage: status === 'failed' ? 'Error' : null,
  };
}

/** Detalle completado de `projectId` con los controles y hallazgos dados. */
export function makeDetail(
  projectId: string,
  checks: AuditCheck[] = [],
  bySeverity: Partial<Record<CheckSeverity, number>> = {},
): AuditDetail {
  const base = makeAuditDetail(`a-${projectId}`, 'completed');

  return {
    ...base,
    project: { ...base.project, id: projectId },
    totals: {
      ...base.totals,
      findingsBySeverity: {
        low: 0,
        medium: 0,
        high: 0,
        critical: 0,
        ...bySeverity,
      },
    },
    checks,
  };
}
