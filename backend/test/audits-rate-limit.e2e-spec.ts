import { registerAccount } from './support/accounts';
import {
  api,
  path,
  createTestApp,
  resetDatabase,
  TestContext,
} from './support/test-app';

describe('Límite de auditorías por minuto (integración)', () => {
  let context: TestContext;

  beforeAll(async () => {
    context = await createTestApp({ withRateLimit: true });
    await resetDatabase(context.dataSource);
  });

  afterAll(() => context.app.close());

  it('bloquea al superar las cinco auditorías iniciadas en un minuto', async () => {
    const cuenta = await registerAccount(context, 'ana@ejemplo.cl');
    const codigos: number[] = [];

    for (let intento = 0; intento < 6; intento += 1) {
      const { status } = await api(context)
        .post(path(context, `/audits`))
        .set('Authorization', `Bearer ${cuenta.token}`)
        .send({
          repositoryUrl: `https://github.com/organizacion/proyecto-${intento}`,
        });

      codigos.push(status);
    }

    expect(codigos.slice(0, 5)).toEqual([202, 202, 202, 202, 202]);
    expect(codigos[5]).toBe(429);
  });

  it('no limita las consultas al historial con la misma severidad', async () => {
    const cuenta = await registerAccount(context, 'bruno@ejemplo.cl');

    for (let consulta = 0; consulta < 10; consulta += 1) {
      await api(context)
        .get(path(context, `/audits`))
        .set('Authorization', `Bearer ${cuenta.token}`)
        .expect(200);
    }
  });
});
