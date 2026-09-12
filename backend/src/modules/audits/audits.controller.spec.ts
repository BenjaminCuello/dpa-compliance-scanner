import { HttpStatus, RequestMethod } from '@nestjs/common';
import { HTTP_CODE_METADATA, METHOD_METADATA } from '@nestjs/common/constants';
import { User } from '../users/entities/user.entity';
import { AuditsController } from './audits.controller';
import { AuditsService } from './audits.service';

/** Método del controlador, para inspeccionar sus decoradores. */
const handler = (name: keyof AuditsController): object =>
  Object.getOwnPropertyDescriptor(AuditsController.prototype, name)
    ?.value as object;

describe('AuditsController', () => {
  const user = { id: 'usuario-1' } as User;
  const service = { start: jest.fn(), list: jest.fn(), findOne: jest.fn() };
  const controller = new AuditsController(service as unknown as AuditsService);

  beforeEach(() => jest.clearAllMocks());

  it('inicia la auditoría respondiendo 202 Accepted', async () => {
    service.start.mockResolvedValue({ id: 'auditoria-1' });

    await expect(
      controller.start(user, { repositoryUrl: 'https://github.com/org/repo' }),
    ).resolves.toEqual({
      id: 'auditoria-1',
    });
    expect(service.start).toHaveBeenCalledWith(user, {
      repositoryUrl: 'https://github.com/org/repo',
    });
    expect(Reflect.getMetadata(HTTP_CODE_METADATA, handler('start'))).toBe(
      HttpStatus.ACCEPTED,
    );
    expect(Reflect.getMetadata(METHOD_METADATA, handler('start'))).toBe(
      RequestMethod.POST,
    );
  });

  it('entrega el historial del usuario autenticado', async () => {
    const query = { page: 1, limit: 20 };
    service.list.mockResolvedValue({ items: [], total: 0, page: 1, limit: 20 });

    await controller.list(user, query);

    expect(service.list).toHaveBeenCalledWith(user, query);
  });

  it('entrega el detalle de una auditoría del usuario', async () => {
    service.findOne.mockResolvedValue({ id: 'auditoria-1' });

    await controller.findOne(user, 'auditoria-1');

    expect(service.findOne).toHaveBeenCalledWith(user, 'auditoria-1');
  });

  it('aplica un límite de peticiones más estricto al iniciar auditorías', () => {
    const keys = Reflect.getMetadataKeys(handler('start')) as string[];

    expect(keys.some((key) => key.startsWith('THROTTLER:LIMIT'))).toBe(true);
  });
});
