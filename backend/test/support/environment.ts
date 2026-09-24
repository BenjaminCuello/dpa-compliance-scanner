import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

/**
 * Variables de entorno de las pruebas de integración. Usan una base de datos
 * aparte para no tocar los datos de desarrollo, y un directorio de trabajo
 * temporal propio de cada ejecución.
 */
export function applyTestEnvironment(): void {
  const defaults: Record<string, string> = {
    NODE_ENV: 'test',
    PORT: '3000',
    API_PREFIX: 'api',
    DB_HOST: 'localhost',
    DB_PORT: '5432',
    DB_USERNAME: 'scanner',
    DB_PASSWORD: 'scanner_local',
    DB_NAME: 'dpa_scanner_test',
    DB_SYNCHRONIZE: 'false',
    DB_MIGRATIONS_RUN: 'true',
    JWT_SECRET: 'clave-de-pruebas-de-integracion-con-largo-suficiente',
    JWT_EXPIRES_IN: '15m',
    BCRYPT_ROUNDS: '10',
    AUDIT_MAX_CONCURRENT: '1',
  };

  for (const [key, value] of Object.entries(defaults)) {
    process.env[key] ??= value;
  }

  process.env.SCANNER_WORKSPACE_DIR ??= mkdtempSync(join(tmpdir(), 'dpa-e2e-'));
}
