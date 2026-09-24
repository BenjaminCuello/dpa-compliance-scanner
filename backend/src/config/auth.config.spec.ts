import authConfig from './auth.config';

describe('authConfig', () => {
  const originalEnv = process.env;

  afterEach(() => {
    process.env = originalEnv;
  });

  it('usa una vigencia y un costo de cifrado por defecto', () => {
    process.env = { ...originalEnv };
    delete process.env.JWT_EXPIRES_IN;
    delete process.env.BCRYPT_ROUNDS;

    expect(authConfig()).toMatchObject({
      jwtExpiresIn: '1h',
      bcryptRounds: 12,
    });
  });

  it('toma la clave de firma y los demás valores del entorno', () => {
    process.env = {
      ...originalEnv,
      JWT_SECRET: 'clave-de-firma-de-pruebas-con-largo-suficiente',
      JWT_EXPIRES_IN: '30m',
      BCRYPT_ROUNDS: '11',
    };

    expect(authConfig()).toEqual({
      jwtSecret: 'clave-de-firma-de-pruebas-con-largo-suficiente',
      jwtExpiresIn: '30m',
      bcryptRounds: 11,
    });
  });
});
