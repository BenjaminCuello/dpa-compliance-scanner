import { QueryFailedError } from 'typeorm';
import { isUniqueViolation } from './unique-violation';

describe('isUniqueViolation', () => {
  const queryError = (driverError: object) =>
    new QueryFailedError('INSERT', [], driverError as Error);

  it('reconoce un registro duplicado', () => {
    expect(
      isUniqueViolation(queryError({ code: '23505', detail: 'ya existe' })),
    ).toBe(true);
  });

  it('descarta otros errores de la base de datos', () => {
    expect(isUniqueViolation(queryError({ code: '23503' }))).toBe(false);
    expect(isUniqueViolation(queryError({}))).toBe(false);
  });

  it('descarta errores que no vienen de una consulta', () => {
    expect(isUniqueViolation(new Error('conexión perdida'))).toBe(false);
    expect(isUniqueViolation(null)).toBe(false);
  });
});
