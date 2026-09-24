import { registerAccount, TestAccount } from './support/accounts';
import {
  api,
  path,
  createTestApp,
  resetDatabase,
  TestContext,
  waitForAudit,
} from './support/test-app';

describe('Historial de auditorías (integración)', () => {
  let context: TestContext;
  let ana: TestAccount;

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
  });

  afterAll(() => context.app.close());

  it('lista las auditorías del usuario, de la más reciente a la más antigua', async () => {
    await auditar(ana, 'https://github.com/organizacion/primero');
    await auditar(ana, 'https://github.com/organizacion/segundo');

    const { body } = await api(context)
      .get(url('/audits'))
      .set('Authorization', `Bearer ${ana.token}`)
      .expect(200);

    expect(body).toMatchObject({ total: 2, page: 1, limit: 20 });
    expect(
      body.items.map(
        (item: { project: { name: string } }) => item.project.name,
      ),
    ).toEqual(['organizacion/segundo', 'organizacion/primero']);
  });

  it('filtra por proyecto y por estado', async () => {
    const primera = await auditar(
      ana,
      'https://github.com/organizacion/primero',
    );
    await auditar(ana, 'https://github.com/organizacion/segundo');
    const proyecto = (primera.project as { id: string }).id;

    const porProyecto = await api(context)
      .get(url(`/audits?projectId=${proyecto}`))
      .set('Authorization', `Bearer ${ana.token}`)
      .expect(200);
    const fallidas = await api(context)
      .get(url('/audits?status=failed'))
      .set('Authorization', `Bearer ${ana.token}`)
      .expect(200);

    expect(porProyecto.body.total).toBe(1);
    expect(porProyecto.body.items[0].project.id).toBe(proyecto);
    expect(fallidas.body.total).toBe(0);
  });

  it('pagina los resultados', async () => {
    await auditar(ana, 'https://github.com/organizacion/primero');
    await auditar(ana, 'https://github.com/organizacion/segundo');

    const pagina1 = await api(context)
      .get(url('/audits?limit=1&page=1'))
      .set('Authorization', `Bearer ${ana.token}`)
      .expect(200);
    const pagina2 = await api(context)
      .get(url('/audits?limit=1&page=2'))
      .set('Authorization', `Bearer ${ana.token}`)
      .expect(200);

    expect(pagina1.body).toMatchObject({ total: 2, limit: 1, page: 1 });
    expect(pagina1.body.items).toHaveLength(1);
    expect(pagina2.body.items[0].id).not.toBe(pagina1.body.items[0].id);
  });
});
