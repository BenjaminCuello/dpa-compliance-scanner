import { compareSeverity, SEVERITY_ORDER } from '../audits/labels';
import type { AuditDetail } from '../audits/types';
import type { FailedControl, SeverityCount } from './types';

/** Hallazgos sumados por severidad, de la más a la menos severa. */
export function findingsBySeverity(
  details: readonly AuditDetail[],
): SeverityCount[] {
  return SEVERITY_ORDER.map((severity) => ({
    severity,
    count: details.reduce(
      (total, detail) => total + detail.totals.findingsBySeverity[severity],
      0,
    ),
  }));
}

interface ControlGroup extends Omit<FailedControl, 'projectsAffected'> {
  projects: Set<string>;
}

/**
 * Controles incumplidos más repetidos entre los detalles, agrupados por
 * `code`. Ordena por proyectos afectados, luego por severidad y al final por
 * código para que el resultado sea estable.
 */
export function topFailedControls(
  details: readonly AuditDetail[],
  limit = 5,
): FailedControl[] {
  const groups = new Map<string, ControlGroup>();

  for (const detail of details) {
    for (const check of detail.checks) {
      if (check.status !== 'failed') continue;

      const group = groups.get(check.code) ?? {
        code: check.code,
        title: check.title,
        severity: check.severity,
        findings: 0,
        projects: new Set<string>(),
      };
      group.projects.add(detail.project.id);
      group.findings += check.findings.length;
      if (compareSeverity(check.severity, group.severity) < 0) {
        group.severity = check.severity;
      }
      groups.set(check.code, group);
    }
  }

  return [...groups.values()]
    .map(({ projects, ...control }) => ({
      ...control,
      projectsAffected: projects.size,
    }))
    .sort(
      (a, b) =>
        b.projectsAffected - a.projectsAffected ||
        compareSeverity(a.severity, b.severity) ||
        a.code.localeCompare(b.code),
    )
    .slice(0, limit);
}
