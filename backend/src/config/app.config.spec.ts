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
