import { api, path, TestContext } from './test-app';

/** Cuenta creada para una prueba, con su token listo para usar. */
export interface TestAccount {
  token: string;
  userId: string;
  email: string;
}

/** Registra una cuenta a través de la API y devuelve su token. */
export async function registerAccount(
  context: TestContext,
  email: string,
): Promise<TestAccount> {
  const { body } = await api(context)
    .post(path(context, '/auth/register'))
    .send({ email, name: 'Persona de prueba', password: 'Clave.Segura2026' })
    .expect(201);

  return {
    token: body.accessToken,
    userId: body.user.id,
    email: body.user.email,
  };
}
