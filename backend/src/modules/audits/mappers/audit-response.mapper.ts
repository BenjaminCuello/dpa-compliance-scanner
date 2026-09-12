import { CheckDefinition } from '../../scanner/interfaces/check-definition.interface';
import { AuditCheckDto, AuditDetailDto } from '../dto/audit-detail.dto';
import { AuditSummaryDto } from '../dto/audit-summary.dto';
import { Audit } from '../entities/audit.entity';
import { CheckResult } from '../entities/check-result.entity';
import { CheckSeverity, CheckStatus } from '../enums';

/** Datos generales de la auditoría para el historial. */
export function toAuditSummary(audit: Audit): AuditSummaryDto {
  return {
    id: audit.id,
    status: audit.status,
    complianceScore:
      audit.complianceScore === null ? null : Number(audit.complianceScore),
    project: {
      id: audit.project.id,
      name: audit.project.name,
      repositoryUrl: audit.project.repositoryUrl,
    },
    createdAt: audit.createdAt,
    startedAt: audit.startedAt,
    finishedAt: audit.finishedAt,
    errorMessage: audit.errorMessage,
  };
}

/**
 * Agrupa las filas por control y completa categoría y remediación desde el
 * catálogo vigente.
 */
function groupChecks(
  rows: CheckResult[],
  catalog: CheckDefinition[],
): AuditCheckDto[] {
  const byCode = new Map<string, AuditCheckDto>();

  for (const row of rows) {
    let check = byCode.get(row.code);

    if (!check) {
      const definition = catalog.find((item) => item.code === row.code);
      check = {
        code: row.code,
        title: row.title,
        category: definition?.category,
        severity: definition?.severity ?? row.severity,
        status: row.status,
        remediation: definition?.remediation,
        findings: [],
      };
      byCode.set(row.code, check);
    }

    if (row.status === CheckStatus.FAILED) {
      check.status = CheckStatus.FAILED;
      check.findings.push({
        message: row.details ?? check.title,
        filePath: row.filePath,
        line: row.lineNumber,
      });
    }
  }

  return [...byCode.values()].sort((a, b) => a.code.localeCompare(b.code));
}

/** Auditoría completa con sus controles y totales. */
export function toAuditDetail(
  audit: Audit,
  rows: CheckResult[],
  catalog: CheckDefinition[],
): AuditDetailDto {
  const checks = groupChecks(rows, catalog);
  const findingsBySeverity = Object.values(CheckSeverity).reduce(
    (totals, severity) => ({ ...totals, [severity]: 0 }),
    {} as Record<CheckSeverity, number>,
  );

  for (const row of rows) {
    if (row.status === CheckStatus.FAILED) {
      findingsBySeverity[row.severity] += 1;
    }
  }

  const failedChecks = checks.filter(
    (check) => check.status === CheckStatus.FAILED,
  ).length;

  return {
    ...toAuditSummary(audit),
    totals: {
      totalChecks: checks.length,
      passedChecks: checks.length - failedChecks,
      failedChecks,
      totalFindings: Object.values(findingsBySeverity).reduce(
        (a, b) => a + b,
        0,
      ),
      findingsBySeverity,
    },
    checks,
  };
}
