import 'dotenv/config';
import { DataSource } from 'typeorm';
import { buildDataSourceOptions } from './typeorm.options';

/**
 * Fuente de datos utilizada por el CLI de TypeORM para generar y ejecutar
 * migraciones. La aplicación construye la suya desde ConfigService.
 */
export default new DataSource(
  buildDataSourceOptions({
    host: process.env.DB_HOST ?? 'localhost',
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
    username: process.env.DB_USERNAME ?? '',
    password: process.env.DB_PASSWORD ?? '',
    database: process.env.DB_NAME ?? '',
    synchronize: false,
    logging: process.env.DB_LOGGING === 'true',
  }),
);
