import { ScanFailedError } from '../src/modules/scanner/errors/scanner.errors';
import { RepositoryFetchError } from '../src/modules/audits/repository/repository.errors';
import { registerAccount, TestAccount } from './support/accounts';
import {
  api,
  path,
  createTestApp,
  resetDatabase,
  TestContext,
  waitForAudit,
} from './support/test-app';

describe('Fallos de una auditoría (integración)', () => {
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

  it('marca la auditoría como fallida si no se puede descargar el repositorio', async () => {
    context.repository.fails(
      new RepositoryFetchError('No se pudo descargar el repositorio'),
    );

    const { body } = await iniciar({ repositoryUrl: repositorio }).expect(202);
    const detalle = await waitForAudit(context, body.id, cuenta.token);

    expect(detalle).toMatchObject({
      status: 'failed',
      errorMessage: 'No se pudo descargar el repositorio',
      complianceScore: null,
    });
    expect(detalle.checks).toEqual([]);
  });

  it('conserva el mensaje del motor cuando el escaneo falla', async () => {
    context.semgrep.fails(
      new ScanFailedError('El escaneo superó el tiempo máximo permitido'),
    );

    const { body } = await iniciar({ repositoryUrl: repositorio }).expect(202);
    const detalle = await waitForAudit(context, body.id, cuenta.token);

    expect(detalle.errorMessage).toBe(
      'El escaneo superó el tiempo máximo permitido',
    );
  });

  it('oculta el detalle de un error inesperado', async () => {
    context.semgrep.fails(new Error('connect ECONNREFUSED 10.0.0.5:5432'));

    const { body } = await iniciar({ repositoryUrl: repositorio }).expect(202);
    const detalle = await waitForAudit(context, body.id, cuenta.token);

    expect(detalle.errorMessage).toBe(
      'La auditoría falló por un error inesperado',
    );
    expect(detalle.errorMessage).not.toContain('10.0.0.5');
  });

  it('rechaza una segunda auditoría del mismo proyecto mientras una está en curso', async () => {
    context.semgrep.takes(300);
    const { body } = await iniciar({ repositoryUrl: repositorio }).expect(202);

    const repetida = await iniciar({
      repositoryUrl: `${repositorio}.git`,
    }).expect(409);
    expect(repetida.body.message.message).toBe(
      'El proyecto ya tiene una auditoría en curso',
    );

    context.semgrep.takes(0);
    await waitForAudit(context, body.id, cuenta.token);
  });
});
