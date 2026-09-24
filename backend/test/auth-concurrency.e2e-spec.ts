import {
  api,
  createTestApp,
  path,
  resetDatabase,
  TestContext,
} from './support/test-app';

describe('Registros simultáneos (integración)', () => {
  let context: TestContext;

  const credenciales = {
    email: 'ana@ejemplo.cl',
    name: 'Ana Pérez',
    password: 'Clave.Segura2026',
  };

  beforeAll(async () => {
    context = await createTestApp();
  });

  beforeEach(() => resetDatabase(context.dataSource));

  afterAll(() => context.app.close());

  it('crea una sola cuenta y responde conflicto a las demás', async () => {
    const intentos = await Promise.all(
      [1, 2, 3].map(() =>
        api(context).post(path(context, '/auth/register')).send(credenciales),
      ),
    );

    const codigos = intentos.map((intento) => intento.status).sort();
    const conflictos = intentos.filter((intento) => intento.status === 409);
    const cuentas = await context.dataSource.query<unknown[]>(
      'SELECT id FROM users WHERE email = $1',
      [credenciales.email],
    );

    expect(codigos).toEqual([201, 409, 409]);
    expect(cuentas).toHaveLength(1);
    conflictos.forEach((conflicto) => {
      expect(conflicto.body.message.message).toBe(
        'El correo ya está registrado',
      );
    });
  });

  it('mantiene utilizable la cuenta creada en la carrera', async () => {
    await Promise.all(
      [1, 2].map(() =>
        api(context).post(path(context, '/auth/register')).send(credenciales),
      ),
    );

    const { body } = await api(context)
      .post(path(context, '/auth/login'))
      .send({ email: credenciales.email, password: credenciales.password })
      .expect(200);

    await api(context)
      .get(path(context, '/auth/profile'))
      .set('Authorization', `Bearer ${body.accessToken}`)
      .expect(200);
  });
});
