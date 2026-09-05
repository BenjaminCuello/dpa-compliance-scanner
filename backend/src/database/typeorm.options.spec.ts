import { buildDataSourceOptions } from './typeorm.options';
import { SnakeNamingStrategy } from './snake-naming.strategy';

describe('buildDataSourceOptions', () => {
  const connection = {
    host: 'localhost',
    port: 5432,
    username: 'scanner',
    password: 'secreto',
    database: 'dpa_scanner',
    synchronize: false,
    logging: false,
  };

  it('construye opciones de PostgreSQL con los datos recibidos', () => {
    const options = buildDataSourceOptions(connection);

    expect(options.type).toBe('postgres');
    expect(options).toMatchObject(connection);
  });

  it('aplica la estrategia de nombres en snake_case', () => {
    expect(buildDataSourceOptions(connection).namingStrategy).toBeInstanceOf(
      SnakeNamingStrategy,
    );
  });

  it('registra las rutas de entidades y migraciones', () => {
    const options = buildDataSourceOptions(connection);

    expect(String(options.entities?.[0])).toContain('.entity.');
    expect(String(options.migrations?.[0])).toContain('migrations');
  });

  it('nunca activa synchronize por su cuenta', () => {
    const options = buildDataSourceOptions({
      ...connection,
      synchronize: true,
    });

    expect(options.synchronize).toBe(true);
    expect(buildDataSourceOptions(connection).synchronize).toBe(false);
  });
});
