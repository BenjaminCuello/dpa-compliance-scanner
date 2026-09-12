import { CheckSeverity, CheckStatus } from '../../audits/enums';
import { CheckDefinition } from '../interfaces/check-definition.interface';
import {
  CheckEvaluation,
  ScanFinding,
  ScanSummary,
} from '../interfaces/scan-report.interface';

/**
 * Cruza el catálogo con los hallazgos: un control falla si al menos una de sus
 * reglas encontró algo, y se aprueba si ninguna lo hizo.
 */
export function evaluateChecks(
  catalog: CheckDefinition[],
  findings: ScanFinding[],
): CheckEvaluation[] {
  return catalog.map((check) => {
    const related = findings.filter(
      (finding) =>
        finding.checkCode === check.code ||
        check.ruleIds.includes(finding.ruleId),
    );

    return {
      code: check.code,
      title: check.title,
      category: check.category,
      severity: check.severity,
      status: related.length > 0 ? CheckStatus.FAILED : CheckStatus.PASSED,
      remediation: check.remediation,
      findings: related,
    };
  });
}

/** Totales del escaneo para el resumen del reporte. */
export function summarize(checks: CheckEvaluation[]): ScanSummary {
  const findingsBySeverity = Object.values(CheckSeverity).reduce(
    (totals, severity) => ({ ...totals, [severity]: 0 }),
    {} as Record<CheckSeverity, number>,
  );

  let totalFindings = 0;

  for (const check of checks) {
    for (const finding of check.findings) {
      findingsBySeverity[finding.severity] += 1;
      totalFindings += 1;
    }
  }

  const failedChecks = checks.filter(
    (check) => check.status === CheckStatus.FAILED,
  ).length;

  return {
    totalChecks: checks.length,
    passedChecks: checks.length - failedChecks,
    failedChecks,
    totalFindings,
    findingsBySeverity,
  };
}
