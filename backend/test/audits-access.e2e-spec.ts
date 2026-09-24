import { registerAccount, TestAccount } from './support/accounts';
import {
  api,
  path,
  createTestApp,
  resetDatabase,
  TestContext,
  waitForAudit,
} from './support/test-app';

describe('Acceso a auditorías y proyectos (integración)', () => {
  let context: TestContext;
  let ana: TestAccount;
  let bruno: TestAccount;

  const url = (route: string) => path(context, route);

  /** Ejecuta una auditoría completa y devuelve su detalle. */
  const auditar = async (cuenta: TestAccount, repositorio: string) => {
    const { body } = await api(context)
      .post(url('/audits'))
      .set('Authorization', `Bearer ${cuenta.token}`)
      .send({ repositoryUrl: repositorio })
      .expect(202);

    return waitForAudit(context, body.id, cuenta.token);
  };

  beforeAll(async () => {
    context = await createTestApp();
  });

  beforeEach(async () => {
    await resetDatabase(context.dataSource);
    ana = await registerAccount(context, 'ana@ejemplo.cl');
    bruno = await registerAccount(context, 'bruno@ejemplo.cl');
  });

  afterAll(() => context.app.close());

  it('reutiliza el proyecto al volver a auditar el mismo repositorio', async () => {
    const primera = await auditar(
      ana,
      'https://github.com/organizacion/proyecto',
    );
    const proyecto = (primera.project as { id: string }).id;

    const { body } = await api(context)
      .post(url('/audits'))
      .set('Authorization', `Bearer ${ana.token}`)
      .send({ projectId: proyecto })
      .expect(202);
    await waitForAudit(context, body.id, ana.token);

    const historial = await api(context)
      .get(url('/audits'))
      .set('Authorization', `Bearer ${ana.token}`)
      .expect(200);

    expect(body.project.id).toBe(proyecto);
    expect(historial.body.total).toBe(2);
    expect(
      new Set(
        historial.body.items.map(
          (item: { project: { id: string } }) => item.project.id,
        ),
      ),
    ).toEqual(new Set([proyecto]));
  });

  it('no deja ver ni reutilizar las auditorías de otra persona', async () => {
    const ajena = await auditar(
      ana,
      'https://github.com/organizacion/proyecto',
    );
    const proyecto = (ajena.project as { id: string }).id;
    const auth = { Authorization: `Bearer ${bruno.token}` };

    await api(context)
      .get(url(`/audits/${ajena.id as string}`))
      .set(auth)
      .expect(404);
    await api(context)
      .post(url('/audits'))
      .set(auth)
      .send({ projectId: proyecto })
      .expect(404);

    const historial = await api(context)
      .get(url('/audits'))
      .set(auth)
      .expect(200);
    const filtrado = await api(context)
      .get(url(`/audits?projectId=${proyecto}`))
      .set(auth)
      .expect(200);

    expect(historial.body.total).toBe(0);
    expect(filtrado.body.total).toBe(0);
  });
});
