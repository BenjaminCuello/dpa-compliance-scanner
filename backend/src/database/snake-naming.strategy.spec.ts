import { SnakeNamingStrategy } from './snake-naming.strategy';

describe('SnakeNamingStrategy', () => {
  const strategy = new SnakeNamingStrategy();

  it('convierte el nombre de la clase en snake_case', () => {
    expect(strategy.tableName('CheckResult', undefined)).toBe('check_result');
  });

  it('respeta el nombre de tabla declarado en la entidad', () => {
    expect(strategy.tableName('CheckResult', 'check_results')).toBe(
      'check_results',
    );
  });

  it('convierte las propiedades en columnas snake_case', () => {
    expect(strategy.columnName('passwordHash', undefined, [])).toBe(
      'password_hash',
    );
    expect(strategy.columnName('lineNumber', undefined, [])).toBe(
      'line_number',
    );
  });

  it('antepone el prefijo de las columnas embebidas', () => {
    expect(strategy.columnName('city', undefined, ['homeAddress'])).toBe(
      'home_address_city',
    );
  });

  it('nombra las claves foráneas a partir de la relación', () => {
    expect(strategy.joinColumnName('project', 'id')).toBe('project_id');
  });
});
