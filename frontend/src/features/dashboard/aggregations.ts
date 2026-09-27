import type { AuditDetail, AuditSummary } from '../audits/types';
import type {
  DashboardOverview,
  ProjectOverview,
  ProjectScore,
  ScoreTrendPoint,
} from './types';

export { findingsBySeverity, topFailedControls } from './failedControls';

/** Auditoría completada con puntaje y fecha de término. */
type ScoredSummary = AuditSummary & {
  complianceScore: number;
  finishedAt: string;
};

/** Redondea a dos decimales, como el puntaje del backend. */
function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function isScored(summary: AuditSummary): summary is ScoredSummary {
  return (
    summary.status === 'completed' &&
    summary.complianceScore !== null &&
    summary.finishedAt !== null
  );
}

/** Auditorías completadas, de la más reciente a la más antigua. */
function completedNewestFirst(summaries: readonly AuditSummary[]) {
  return summaries
    .filter(isScored)
    .sort((a, b) => b.finishedAt.localeCompare(a.finishedAt));
}

/**
 * Última auditoría completada de cada proyecto (por `finishedAt`), de la
 * más reciente a la más antigua.
 */
export function latestCompletedByProject(
  summaries: readonly AuditSummary[],
): AuditSummary[] {
  const latest = new Map<string, AuditSummary>();
  for (const summary of completedNewestFirst(summaries)) {
    if (!latest.has(summary.project.id)) {
      latest.set(summary.project.id, summary);
    }
  }
  return [...latest.values()];
}

/**
 * Indicadores generales. El promedio usa el listado para incluir también a
 * los proyectos cuyo detalle no se cargó.
 */
export function computeOverview(
  summaries: readonly AuditSummary[],
  latestDetails: readonly AuditDetail[],
): DashboardOverview {
  const scores = latestCompletedByProject(summaries).map(
    (summary) => summary.complianceScore as number,
  );
  const sum = scores.reduce((total, score) => total + score, 0);

  return {
    projectsCount: new Set(summaries.map((summary) => summary.project.id)).size,
    completedCount: summaries.filter(
      (summary) => summary.status === 'completed',
    ).length,
    averageScore: scores.length > 0 ? round2(sum / scores.length) : null,
    criticalFindings: latestDetails.reduce(
      (total, detail) => total + detail.totals.findingsBySeverity.critical,
      0,
    ),
  };
}

/**
 * Indicadores de un proyecto. `summaries` debe contener solo auditorías de
 * ese proyecto y `detail` es el de su última auditoría completada, si se
 * cargó.
 */
export function computeProjectOverview(
  summaries: readonly AuditSummary[],
  detail: AuditDetail | null,
): ProjectOverview {
  const [last, previous] = completedNewestFirst(summaries);
  const lastScore = last?.complianceScore ?? null;
  const previousScore = previous?.complianceScore ?? null;

  return {
    auditsCount: summaries.length,
    lastScore,
    previousScore,
    scoreDelta:
      lastScore !== null && previousScore !== null
        ? round2(lastScore - previousScore)
        : null,
    criticalFindings: detail?.totals.findingsBySeverity.critical ?? null,
  };
}

/** Puntajes del proyecto, de la auditoría más antigua a la más reciente. */
export function scoreTrend(
  summaries: readonly AuditSummary[],
  projectId: string,
): ScoreTrendPoint[] {
  return completedNewestFirst(summaries)
    .filter((summary) => summary.project.id === projectId)
    .reverse()
    .map((summary) => ({
      auditId: summary.id,
      finishedAt: summary.finishedAt,
      score: summary.complianceScore,
    }));
}

/**
 * Último puntaje de cada proyecto, de menor a mayor: primero lo que más
 * requiere atención. Los empates se ordenan por nombre.
 */
export function projectScores(
  latestSummaries: readonly AuditSummary[],
): ProjectScore[] {
  return latestSummaries
    .filter(isScored)
    .map((summary) => ({
      projectId: summary.project.id,
      name: summary.project.name,
      score: summary.complianceScore,
    }))
    .sort((a, b) => a.score - b.score || a.name.localeCompare(b.name));
}
