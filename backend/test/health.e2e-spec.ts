import { api, path, createTestApp, TestContext } from './support/test-app';

describe('Estado del servicio (integración)', () => {
  let context: TestContext;

  beforeAll(async () => {
    context = await createTestApp();
  });

  afterAll(() => context.app.close());

  it('informa el estado sin exigir token y con la base de datos conectada', async () => {
    const { body } = await api(context)
      .get(path(context, `/health`))
      .expect(200);

    expect(body).toMatchObject({ status: 'ok', database: true });
    expect(Date.parse(body.timestamp as string)).not.toBeNaN();
  });

  it('responde 404 en una ruta inexistente, con el formato de error de la API', async () => {
    const { body } = await api(context)
      .get(path(context, `/no-existe`))
      .expect(404);

    expect(body).toMatchObject({
      statusCode: 404,
      path: path(context, `/no-existe`),
    });
    expect(Date.parse(body.timestamp as string)).not.toBeNaN();
  });
});
