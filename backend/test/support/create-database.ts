import { Client } from 'pg';
import { applyTestEnvironment } from './environment';

/**
 * Crea la base de datos de pruebas si todavía no existe. Las migraciones las
 * aplica la propia aplicación al iniciar, con `DB_MIGRATIONS_RUN`.
 */
export default async function createTestDatabase(): Promise<void> {
  applyTestEnvironment();

  const database = process.env.DB_NAME as string;
  const client = new Client({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: 'postgres',
  });

  try {
    await client.connect();
  } catch (error) {
    throw new Error(
      'No se pudo conectar a PostgreSQL. Levanta la base de datos con ' +
        `"docker compose up -d db" antes de ejecutar las pruebas. Detalle: ${
          (error as Error).message
        }`,
    );
  }

  const { rowCount } = await client.query(
    'SELECT 1 FROM pg_database WHERE datname = $1',
    [database],
  );

  if (rowCount === 0) {
    await client.query(`CREATE DATABASE "${database}"`);
  }

  await client.end();
}
