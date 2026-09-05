import { join } from 'node:path';
import { DataSourceOptions } from 'typeorm';
import { SnakeNamingStrategy } from './snake-naming.strategy';

/** Valores de conexión que comparten la aplicación y la línea de comandos. */
export interface DatabaseConnectionOptions {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  synchronize: boolean;
  logging: boolean;
}

/**
 * Arma las opciones de TypeORM a partir de los datos de conexión.
 * @param connection Credenciales y banderas provenientes de la configuración.
 * @returns Opciones listas para la aplicación o para el CLI de migraciones.
 */
export function buildDataSourceOptions(
  connection: DatabaseConnectionOptions,
): DataSourceOptions {
  return {
    type: 'postgres',
    ...connection,
    entities: [join(__dirname, '..', '**', '*.entity.{ts,js}')],
    migrations: [join(__dirname, 'migrations', '*.{ts,js}')],
    namingStrategy: new SnakeNamingStrategy(),
    migrationsTableName: 'migrations',
  };
}
