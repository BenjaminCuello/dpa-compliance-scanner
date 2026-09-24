import { registerAccount } from './support/accounts';
import {
  api,
  path,
  createTestApp,
  resetDatabase,
  TestContext,
} from './support/test-app';

describe('Autenticación (integración)', () => {
  let context: TestContext;

  beforeAll(async () => {
    context = await createTestApp();
  });

  beforeEach(() => resetDatabase(context.dataSource));

  afterAll(() => context.app.close());

  const url = (route: string) => path(context, route);
  const credenciales = {
    email: 'ana@ejemplo.cl',
    name: 'Ana Pérez',
    password: 'Clave.Segura2026',
  };

  it('registra una cuenta, entrega un token y no expone la contraseña', async () => {
    const { body, status } = await api(context)
      .post(url('/auth/register'))
      .send(credenciales);

    expect(status).toBe(201);
    expect(body.user).toEqual({
      id: expect.any(String),
      email: 'ana@ejemplo.cl',
      name: 'Ana Pérez',
    });
    expect(body.accessToken).toEqual(expect.any(String));
    expect(JSON.stringify(body)).not.toContain('Clave.Segura2026');
  });

  it('guarda el correo en minúsculas y rechaza registrarlo dos veces', async () => {
    await api(context)
      .post(url('/auth/register'))
      .send({ ...credenciales, email: 'Ana@Ejemplo.CL' })
      .expect(201);

    const repetido = await api(context)
      .post(url('/auth/register'))
      .send(credenciales);

    expect(repetido.status).toBe(409);
    expect(repetido.body.message.message).toBe('El correo ya está registrado');
  });

  it('permite iniciar sesión y consultar el perfil con el token', async () => {
    await api(context)
      .post(url('/auth/register'))
      .send(credenciales)
      .expect(201);

    const { body: sesion } = await api(context)
      .post(url('/auth/login'))
      .send({ email: 'ana@ejemplo.cl', password: credenciales.password })
      .expect(200);

    const { body: perfil } = await api(context)
      .get(url('/auth/profile'))
      .set('Authorization', `Bearer ${sesion.accessToken}`)
      .expect(200);

    expect(perfil).toEqual({
      id: sesion.user.id,
      email: 'ana@ejemplo.cl',
      name: 'Ana Pérez',
    });
  });

  it('responde lo mismo ante contraseña incorrecta y correo inexistente', async () => {
    await api(context)
      .post(url('/auth/register'))
      .send(credenciales)
      .expect(201);

    const claveMala = await api(context)
      .post(url('/auth/login'))
      .send({ email: 'ana@ejemplo.cl', password: 'Otra.Clave2026' })
      .expect(401);
    const sinCuenta = await api(context)
      .post(url('/auth/login'))
      .send({ email: 'nadie@ejemplo.cl', password: 'Otra.Clave2026' })
      .expect(401);

    expect(claveMala.body.message.message).toBe('Credenciales inválidas');
    expect(sinCuenta.body.message.message).toBe('Credenciales inválidas');
  });

  it('protege el perfil ante token ausente, inválido o de una cuenta eliminada', async () => {
    const cuenta = await registerAccount(context, 'ana@ejemplo.cl');

    await api(context).get(url('/auth/profile')).expect(401);
    await api(context)
      .get(url('/auth/profile'))
      .set('Authorization', 'Bearer token.falso')
      .expect(401);

    await resetDatabase(context.dataSource);
    await api(context)
      .get(url('/auth/profile'))
      .set('Authorization', `Bearer ${cuenta.token}`)
      .expect(401);
  });

  it('valida los datos de registro en español', async () => {
    const { body } = await api(context)
      .post(url('/auth/register'))
      .send({ email: 'no-es-correo', name: '', password: 'corta' })
      .expect(400);

    expect(body.message.message).toEqual(
      expect.arrayContaining([
        'El correo no tiene un formato válido',
        'El nombre es obligatorio',
        'La contraseña debe tener al menos 10 caracteres',
      ]),
    );
  });

  it('descarta campos no declarados en el contrato', async () => {
    const { body } = await api(context)
      .post(url('/auth/register'))
      .send({ ...credenciales, isAdmin: true })
      .expect(400);

    expect(JSON.stringify(body.message.message)).toContain('isAdmin');
  });
});
