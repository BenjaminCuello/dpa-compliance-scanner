import { ScanReport } from '../../scanner/interfaces/scan-report.interface';
import { CheckResult } from '../entities/check-result.entity';
import { CheckStatus } from '../enums';

export type CheckResultRow = Pick<
  CheckResult,
  | 'code'
  | 'title'
  | 'status'
  | 'severity'
  | 'details'
  | 'filePath'
  | 'lineNumber'
>;

/**
 * Convierte el reporte del escáner en filas de `check_results`: una por control
 * aprobado y una por cada hallazgo de los controles fallidos. Así se conserva
 * qué se evaluó aunque no haya fallado.
 */
export function toCheckResultRows(report: ScanReport): CheckResultRow[] {
  return report.checks.flatMap((check): CheckResultRow[] => {
    if (check.status !== CheckStatus.FAILED || check.findings.length === 0) {
      return [
        {
          code: check.code,
          title: check.title,
          status: check.status,
          severity: check.severity,
          details: null,
          filePath: null,
          lineNumber: null,
        },
      ];
    }

    return check.findings.map((finding) => ({
      code: check.code,
      title: check.title,
      status: CheckStatus.FAILED,
      severity: finding.severity,
      details: finding.message,
      filePath: finding.filePath,
      lineNumber: finding.line,
    }));
  });
}

/**
 * Porcentaje de controles aprobados, con dos decimales. Se devuelve como texto
 * porque la columna es `numeric` y así evita errores de redondeo.
 */
export function calculateComplianceScore(report: ScanReport): string {
  const { totalChecks, passedChecks } = report.summary;

  if (totalChecks === 0) {
    return '100.00';
  }

  return ((passedChecks / totalChecks) * 100).toFixed(2);
}
