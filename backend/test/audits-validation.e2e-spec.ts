import { registerAccount, TestAccount } from './support/accounts';
import {
  api,
  path,
  createTestApp,
  resetDatabase,
  TestContext,
} from './support/test-app';

describe('Validación de auditorías (integración)', () => {
  let context: TestContext;
  let cuenta: TestAccount;

  const url = (route: string) => path(context, route);
  const iniciar = (body: object) =>
    api(context)
      .post(url('/audits'))
      .set('Authorization', `Bearer ${cuenta.token}`)
      .send(body);
  const mensaje = (body: { message: { message: string | string[] } }) =>
    Array.isArray(body.message.message)
      ? body.message.message[0]
      : body.message.message;

  beforeAll(async () => {
    context = await createTestApp();
    await resetDatabase(context.dataSource);
    cuenta = await registerAccount(context, 'ana@ejemplo.cl');
  });

  afterAll(() => context.app.close());

  it.each([
    ['sin protocolo seguro', 'http://github.com/org/repo', 'HTTPS'],
    ['con protocolo de archivos', 'file:///etc/passwd', 'HTTPS'],
    ['a un servicio interno', 'https://localhost/org/repo', 'Solo se admiten'],
    [
      'a la red de metadatos',
      'https://169.254.169.254/latest/meta',
      'Solo se admiten',
    ],
    [
      'con credenciales incluidas',
      'https://user:clave@github.com/org/repo',
      'usuario',
    ],
    ['sin repositorio', 'https://github.com/org', 'apuntar a un repositorio'],
  ])('rechaza una URL %s', async (_caso, repositoryUrl, esperado) => {
    const { body } = await iniciar({ repositoryUrl }).expect(400);

    expect(mensaje(body)).toContain(esperado);
  });

  it('no crea proyectos ni auditorías cuando la URL es inválida', async () => {
    await iniciar({
      repositoryUrl: 'https://servidor-interno/org/repo',
    }).expect(400);

    const historial = await api(context)
      .get(url('/audits'))
      .set('Authorization', `Bearer ${cuenta.token}`)
      .expect(200);
    const proyectos = await context.dataSource.query<unknown[]>(
      'SELECT id FROM projects',
    );

    expect(historial.body.total).toBe(0);
    expect(proyectos).toHaveLength(0);
  });

  it('exige indicar el repositorio o el proyecto, pero no ambos', async () => {
    const vacio = await iniciar({}).expect(400);
    const ambos = await iniciar({
      repositoryUrl: 'https://github.com/org/repo',
      projectId: '0f8fad5b-d9cb-469f-a165-70867728950e',
    }).expect(400);

    expect(mensaje(vacio.body)).toBe(
      'Indica la URL del repositorio o el proyecto',
    );
    expect(mensaje(ambos.body)).toBe(
      'Indica la URL del repositorio o el proyecto, no ambos',
    );
  });

  it('responde que no existe un proyecto desconocido', async () => {
    const { body } = await iniciar({
      projectId: '0f8fad5b-d9cb-469f-a165-70867728950e',
    }).expect(404);

    expect(mensaje(body)).toBe('Proyecto no encontrado');
  });

  it('valida los parámetros del historial', async () => {
    const limite = await api(context)
      .get(url('/audits?limit=500'))
      .set('Authorization', `Bearer ${cuenta.token}`)
      .expect(400);
    const estado = await api(context)
      .get(url('/audits?status=inventado'))
      .set('Authorization', `Bearer ${cuenta.token}`)
      .expect(400);

    expect(mensaje(limite.body)).toBe(
      'El límite no puede superar 100 resultados',
    );
    expect(mensaje(estado.body)).toBe('El estado indicado no existe');
  });

  it('rechaza un identificador de auditoría mal formado', async () => {
    await api(context)
      .get(url('/audits/no-es-uuid'))
      .set('Authorization', `Bearer ${cuenta.token}`)
      .expect(400);
  });

  it('exige token en todos los endpoints de auditorías', async () => {
    await api(context).get(url('/audits')).expect(401);
    await api(context)
      .get(url('/audits/0f8fad5b-d9cb-469f-a165-70867728950e'))
      .expect(401);
    await api(context)
      .post(url('/audits'))
      .send({ repositoryUrl: 'https://github.com/org/repo' })
      .expect(401);
  });
});
