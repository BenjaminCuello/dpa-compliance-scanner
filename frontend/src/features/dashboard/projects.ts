import type { AuditProject, AuditSummary } from '../audits/types';

/** Auditorías recientes que muestra el panel. */
export const RECENT_AUDITS_LIMIT = 5;

/** Proyectos distintos del historial, ordenados por nombre. */
export function projectOptions(
  summaries: readonly AuditSummary[],
): AuditProject[] {
  const projects = new Map<string, AuditProject>();
  for (const summary of summaries) {
    if (!projects.has(summary.project.id)) {
      projects.set(summary.project.id, summary.project);
    }
  }
  return [...projects.values()].sort(
    (a, b) => a.name.localeCompare(b.name, 'es') || a.id.localeCompare(b.id),
  );
}

/**
 * Últimas auditorías, de todos los proyectos o solo de `projectId`. El
 * listado ya llega de la más reciente a la más antigua.
 */
export function recentAudits(
  summaries: readonly AuditSummary[],
  projectId: string | null = null,
  limit = RECENT_AUDITS_LIMIT,
): AuditSummary[] {
  return summaries
    .filter((summary) => projectId === null || summary.project.id === projectId)
    .slice(0, limit);
}
