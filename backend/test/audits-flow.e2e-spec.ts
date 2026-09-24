import { registerAccount, TestAccount } from './support/accounts';
import {
  api,
  path,
  createTestApp,
  resetDatabase,
  TestContext,
  waitForAudit,
} from './support/test-app';

describe('Flujo de auditoría (integración)', () => {
  let context: TestContext;
  let cuenta: TestAccount;

  const url = (route: string) => path(context, route);
  const repositorio = 'https://github.com/organizacion/proyecto';

  const iniciar = (body: object, token = cuenta.token) =>
    api(context)
      .post(url('/audits'))
      .set('Authorization', `Bearer ${token}`)
      .send(body);

  beforeAll(async () => {
    context = await createTestApp();
  });

  beforeEach(async () => {
    await resetDatabase(context.dataSource);
    context.semgrep.returns([
      {
        ruleId: 'dpa-hardcoded-credential',
        code: 'DPA-SEC-001',
        severity: 'critical',
        message: 'La credencial "dbPassword" está escrita en el código.',
        file: 'src/database.ts',
        line: 12,
      },
    ]);
    cuenta = await registerAccount(context, 'ana@ejemplo.cl');
  });

  afterAll(() => context.app.close());

  it('audita un repositorio de principio a fin', async () => {
    const { body: iniciada } = await iniciar({
      repositoryUrl: repositorio,
    }).expect(202);

    expect(iniciada).toMatchObject({
      status: 'pending',
      complianceScore: null,
      project: { name: 'organizacion/proyecto', repositoryUrl: repositorio },
    });

    const detalle = await waitForAudit(context, iniciada.id, cuenta.token);

    expect(detalle.status).toBe('completed');
    expect(detalle.totals).toMatchObject({
      failedChecks: 1,
      totalFindings: 1,
      findingsBySeverity: { low: 0, medium: 0, high: 0, critical: 1 },
    });
    expect(detalle.complianceScore).toBeGreaterThan(0);
  });

  it('registra los controles aprobados y el detalle del incumplimiento', async () => {
    const { body } = await iniciar({ repositoryUrl: repositorio }).expect(202);
    const detalle = await waitForAudit(context, body.id, cuenta.token);
    const checks = detalle.checks as Array<Record<string, unknown>>;
    const fallido = checks.find((check) => check.code === 'DPA-SEC-001');

    expect(checks.length).toBeGreaterThan(1);
    expect(
      checks.filter((check) => check.status === 'passed').length,
    ).toBeGreaterThan(0);
    expect(fallido).toMatchObject({
      status: 'failed',
      severity: 'critical',
      category: 'secrets',
      remediation: expect.any(String),
    });
    expect(fallido?.findings).toEqual([
      {
        message: 'La credencial "dbPassword" está escrita en el código.',
        filePath: 'src/database.ts',
        line: 12,
      },
    ]);
  });

  it('nunca guarda el código fuente analizado y borra el clon al terminar', async () => {
    const { body } = await iniciar({ repositoryUrl: repositorio }).expect(202);
    const detalle = await waitForAudit(context, body.id, cuenta.token);

    expect(JSON.stringify(detalle)).not.toContain('no-debe-guardarse');
    expect(context.repository.removed).toContainEqual(
      expect.stringContaining(body.id),
    );
  });
});
