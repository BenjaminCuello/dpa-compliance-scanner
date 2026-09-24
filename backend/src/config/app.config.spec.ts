import appConfig from './app.config';
import databaseConfig from './database.config';

describe('configuración por namespaces', () => {
  const originalEnv = process.env;

  afterEach(() => {
    process.env = originalEnv;
  });

  it('separa los orígenes CORS declarados por coma', () => {
    process.env = {
      ...originalEnv,
      CORS_ORIGINS: 'http://localhost:5173, https://app.ejemplo.cl',
    };

    expect(appConfig().corsOrigins).toEqual([
      'http://localhost:5173',
      'https://app.ejemplo.cl',
    ]);
  });

  it('permite suficientes peticiones para una interfaz que consulta seguido', () => {
    process.env = { ...originalEnv };
    delete process.env.THROTTLE_LIMIT;
    delete process.env.THROTTLE_TTL;

    expect(appConfig().throttle).toEqual({ ttl: 60, limit: 120 });
  });

  it('interpreta las banderas booleanas de la base de datos', () => {
    process.env = {
      ...originalEnv,
      DB_SYNCHRONIZE: 'true',
      DB_LOGGING: 'false',
    };

    const config = databaseConfig();

    expect(config.synchronize).toBe(true);
    expect(config.logging).toBe(false);
  });
});
