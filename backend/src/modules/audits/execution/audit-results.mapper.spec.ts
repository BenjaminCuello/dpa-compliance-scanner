import { ScanReport } from '../../scanner/interfaces/scan-report.interface';
import { CheckSeverity, CheckStatus } from '../enums';
import {
  calculateComplianceScore,
  toCheckResultRows,
} from './audit-results.mapper';

const reportWith = (
  checks: ScanReport['checks'],
  passed: number,
  total: number,
): ScanReport => ({
  engine: { name: 'semgrep', version: '1.176.1' },
  startedAt: '',
  finishedAt: '',
  durationMs: 0,
  scannedFiles: 0,
  summary: {
    totalChecks: total,
    passedChecks: passed,
    failedChecks: total - passed,
    totalFindings: 0,
    findingsBySeverity: { low: 0, medium: 0, high: 0, critical: 0 },
  },
  checks,
  issues: [],
});

describe('audit-results.mapper', () => {
  const passed = {
    code: 'DPA-CFG-002',
    title: 'CORS abierto',
    category: 'configuration' as const,
    severity: CheckSeverity.MEDIUM,
    status: CheckStatus.PASSED,
    remediation: 'Declarar orígenes',
    findings: [],
  };

  const failed = {
    ...passed,
    code: 'DPA-SEC-001',
    title: 'Credenciales en el código',
    severity: CheckSeverity.CRITICAL,
    status: CheckStatus.FAILED,
    findings: [1, 2].map((line) => ({
      checkCode: 'DPA-SEC-001',
      ruleId: 'dpa-hardcoded-credential',
      severity: CheckSeverity.CRITICAL,
      message: `Hallazgo ${line}`,
      filePath: 'src/db.ts',
      line,
      endLine: line,
    })),
  };

  it('guarda una fila por control aprobado y una por hallazgo', () => {
    const rows = toCheckResultRows(reportWith([passed, failed], 1, 2));

    expect(rows).toHaveLength(3);
    expect(rows[0]).toMatchObject({
      code: 'DPA-CFG-002',
      status: CheckStatus.PASSED,
      filePath: null,
      lineNumber: null,
    });
    expect(rows.slice(1).map((row) => row.lineNumber)).toEqual([1, 2]);
    expect(rows[1]).toMatchObject({
      status: CheckStatus.FAILED,
      details: 'Hallazgo 1',
      filePath: 'src/db.ts',
    });
  });

  it('calcula el porcentaje de controles aprobados con dos decimales', () => {
    expect(calculateComplianceScore(reportWith([], 6, 9))).toBe('66.67');
    expect(calculateComplianceScore(reportWith([], 9, 9))).toBe('100.00');
    expect(calculateComplianceScore(reportWith([], 0, 9))).toBe('0.00');
  });

  it('considera cumplido un catálogo vacío', () => {
    expect(calculateComplianceScore(reportWith([], 0, 0))).toBe('100.00');
  });
});
