import { makeAuditDetail, makeCheck } from '../audits/testFixtures';
import type {
  AuditCheck,
  AuditDetail,
  AuditStatus,
  AuditSummary,
  CheckSeverity,
} from '../audits/types';
import type { useDashboardData } from './useDashboardData';

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

type DashboardState = ReturnType<typeof useDashboardData>;

/** Resultado de `useDashboardData` ya cargado, sin error. */
export function makeDashboardState(
  overrides: Partial<DashboardState> = {},
): DashboardState {
  return {
    summaries: [],
    latestDetails: [],
    isTruncated: false,
    isLoading: false,
    error: null,
    reload: () => undefined,
    ...overrides,
  };
}

/**
 * Panel de ejemplo: p1 con dos auditorías (70 y luego 90), p2 con una sola
 * (40) y p3 con una completada (60) y otra en ejecución. El listado va del
 * más reciente al más antiguo, como lo entrega el backend.
 */
export function sampleDashboard(): Partial<DashboardState> {
  const failed = makeCheck('DPA-SEC-001', 'failed', 'critical', {
    title: 'Secretos en el código',
    findings: [{ message: 'Clave expuesta', filePath: 'a.ts', line: 1 }],
  });

  return {
    summaries: [
      makeSummary('a5', 'p3', 21, null, 'running'),
      makeSummary('a1', 'p1', 20, 90),
      makeSummary('a3', 'p2', 18, 40),
      makeSummary('a4', 'p3', 15, 60),
      makeSummary('a2', 'p1', 10, 70),
    ],
    latestDetails: [
      { ...makeDetail('p1', [failed], { critical: 2 }), id: 'a1' },
      { ...makeDetail('p2', [failed], { critical: 1 }), id: 'a3' },
      { ...makeDetail('p3', [], {}), id: 'a4' },
    ],
  };
}
