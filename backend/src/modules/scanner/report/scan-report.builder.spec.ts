import { CheckSeverity, CheckStatus } from '../../audits/enums';
import { CheckDefinition } from '../interfaces/check-definition.interface';
import { ScanFinding } from '../interfaces/scan-report.interface';
import { evaluateChecks, summarize } from './scan-report.builder';

describe('scan-report.builder', () => {
  const catalog: CheckDefinition[] = [
    {
      code: 'DPA-SEC-001',
      title: 'Credenciales escritas en el código',
      category: 'secrets',
      severity: CheckSeverity.CRITICAL,
      remediation: 'Usar variables de entorno',
      ruleIds: ['dpa-hardcoded-credential', 'dpa-hardcoded-credential-python'],
    },
    {
      code: 'DPA-CFG-002',
      title: 'CORS abierto a cualquier origen',
      category: 'configuration',
      severity: CheckSeverity.MEDIUM,
      remediation: 'Declarar orígenes',
      ruleIds: ['dpa-cors-any-origin'],
    },
  ];

  const finding = (ruleId: string, severity: CheckSeverity): ScanFinding => ({
    checkCode: 'DPA-SEC-001',
    ruleId,
    severity,
    message: 'hallazgo',
    filePath: 'src/app.py',
    line: 1,
    endLine: 1,
  });

  it('marca como fallido el control con hallazgos de cualquiera de sus reglas', () => {
    const checks = evaluateChecks(catalog, [
      finding('dpa-hardcoded-credential-python', CheckSeverity.CRITICAL),
    ]);

    expect(checks[0].status).toBe(CheckStatus.FAILED);
    expect(checks[0].findings).toHaveLength(1);
  });

  it('aprueba los controles sin hallazgos', () => {
    const checks = evaluateChecks(catalog, []);

    expect(checks.map((check) => check.status)).toEqual([
      CheckStatus.PASSED,
      CheckStatus.PASSED,
    ]);
  });

  it('resume controles y hallazgos por severidad', () => {
    const checks = evaluateChecks(catalog, [
      finding('dpa-hardcoded-credential', CheckSeverity.CRITICAL),
      finding('dpa-hardcoded-credential', CheckSeverity.CRITICAL),
    ]);

    expect(summarize(checks)).toEqual({
      totalChecks: 2,
      passedChecks: 1,
      failedChecks: 1,
      totalFindings: 2,
      findingsBySeverity: { low: 0, medium: 0, high: 0, critical: 2 },
    });
  });
});
