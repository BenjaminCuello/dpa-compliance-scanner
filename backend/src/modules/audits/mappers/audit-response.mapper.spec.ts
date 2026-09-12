import { CheckDefinition } from '../../scanner/interfaces/check-definition.interface';
import { Audit } from '../entities/audit.entity';
import { CheckResult } from '../entities/check-result.entity';
import { AuditStatus, CheckSeverity, CheckStatus } from '../enums';
import { toAuditDetail, toAuditSummary } from './audit-response.mapper';

describe('audit-response.mapper', () => {
  const audit = {
    id: 'auditoria-1',
    status: AuditStatus.COMPLETED,
    complianceScore: '50.00',
    project: {
      id: 'proyecto-1',
      name: 'org/repo',
      repositoryUrl: 'https://github.com/org/repo',
      owner: { passwordHash: 'no-debe-salir' },
    },
    createdAt: new Date('2026-09-12T10:00:00Z'),
    startedAt: new Date('2026-09-12T10:00:01Z'),
    finishedAt: new Date('2026-09-12T10:00:05Z'),
    errorMessage: null,
  } as unknown as Audit;

  const catalog: CheckDefinition[] = [
    {
      code: 'DPA-SEC-001',
      title: 'Credenciales',
      category: 'secrets',
      severity: CheckSeverity.CRITICAL,
      remediation: 'Usar variables de entorno',
      ruleIds: [],
    },
  ];

  const row = (overrides: Partial<CheckResult>) =>
    ({
      code: 'DPA-SEC-001',
      title: 'Credenciales',
      status: CheckStatus.FAILED,
      severity: CheckSeverity.CRITICAL,
      details: 'Hallazgo',
      filePath: 'src/a.ts',
      lineNumber: 3,
      ...overrides,
    }) as CheckResult;

  it('convierte el puntaje a número y expone solo datos públicos del proyecto', () => {
    const summary = toAuditSummary(audit);

    expect(summary.complianceScore).toBe(50);
    expect(summary.project).toEqual({
      id: 'proyecto-1',
      name: 'org/repo',
      repositoryUrl: 'https://github.com/org/repo',
    });
    expect(JSON.stringify(summary)).not.toContain('no-debe-salir');
  });

  it('mantiene el puntaje nulo mientras la auditoría no termina', () => {
    expect(
      toAuditSummary({ ...audit, complianceScore: null }).complianceScore,
    ).toBeNull();
  });

  it('agrupa los hallazgos por control y completa datos del catálogo', () => {
    const detail = toAuditDetail(
      audit,
      [
        row({ lineNumber: 3 }),
        row({ lineNumber: 9 }),
        row({
          code: 'DPA-CFG-002',
          title: 'CORS',
          status: CheckStatus.PASSED,
          severity: CheckSeverity.MEDIUM,
          details: null,
          filePath: null,
          lineNumber: null,
        }),
      ],
      catalog,
    );

    expect(detail.checks.map((check) => check.code)).toEqual([
      'DPA-CFG-002',
      'DPA-SEC-001',
    ]);
    expect(detail.checks[0]).toMatchObject({
      status: CheckStatus.PASSED,
      findings: [],
    });
    expect(detail.checks[1]).toMatchObject({
      status: CheckStatus.FAILED,
      category: 'secrets',
      remediation: 'Usar variables de entorno',
    });
    expect(detail.checks[1].findings.map((finding) => finding.line)).toEqual([
      3, 9,
    ]);
    expect(detail.totals).toEqual({
      totalChecks: 2,
      passedChecks: 1,
      failedChecks: 1,
      totalFindings: 2,
      findingsBySeverity: { low: 0, medium: 0, high: 0, critical: 2 },
    });
  });

  it('entrega totales en cero para una auditoría sin resultados', () => {
    const detail = toAuditDetail(
      { ...audit, status: AuditStatus.PENDING },
      [],
      catalog,
    );

    expect(detail.checks).toEqual([]);
    expect(detail.totals.totalChecks).toBe(0);
  });
});
