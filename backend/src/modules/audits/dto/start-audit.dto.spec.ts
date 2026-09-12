import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { ListAuditsQueryDto } from './list-audits-query.dto';
import { StartAuditDto } from './start-audit.dto';

const errorsOf = async <T extends object>(type: new () => T, body: object) => {
  const errors = await validate(plainToInstance(type, body));
  return errors.flatMap((error) => Object.values(error.constraints ?? {}));
};

describe('validación de auditorías', () => {
  it('pide la URL o el proyecto como primer mensaje cuando no se envía nada', async () => {
    const errors = await errorsOf(StartAuditDto, {});

    expect(errors[0]).toBe('Indica la URL del repositorio o el proyecto');
  });

  it('acepta solo un identificador de proyecto', async () => {
    expect(
      await errorsOf(StartAuditDto, {
        projectId: '0f8fad5b-d9cb-469f-a165-70867728950e',
      }),
    ).toEqual([]);
  });

  it('rechaza un identificador de proyecto mal formado', async () => {
    expect(await errorsOf(StartAuditDto, { projectId: '123' })).toEqual([
      'El identificador del proyecto no es válido',
    ]);
  });

  it('limita el largo de la URL y del nombre', async () => {
    const errors = await errorsOf(StartAuditDto, {
      repositoryUrl: `https://github.com/${'a'.repeat(500)}`,
      projectName: 'b'.repeat(121),
    });

    expect(errors).toEqual(
      expect.arrayContaining([
        'La URL del repositorio no puede superar los 500 caracteres',
        'El nombre del proyecto no puede superar los 120 caracteres',
      ]),
    );
  });

  it('convierte y valida la paginación recibida como texto', async () => {
    const query = plainToInstance(ListAuditsQueryDto, {
      page: '3',
      limit: '50',
    });

    expect(await validate(query)).toEqual([]);
    expect(query).toMatchObject({ page: 3, limit: 50 });
  });

  it('aplica valores por defecto y rechaza límites excesivos', async () => {
    expect(plainToInstance(ListAuditsQueryDto, {})).toMatchObject({
      page: 1,
      limit: 20,
    });
    expect(
      await errorsOf(ListAuditsQueryDto, { limit: '500', status: 'otro' }),
    ).toEqual(
      expect.arrayContaining([
        'El límite no puede superar 100 resultados',
        'El estado indicado no existe',
      ]),
    );
  });
});
