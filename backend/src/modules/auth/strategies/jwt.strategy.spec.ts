import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';
import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  const findById = jest.fn();
  const usersService = { findById } as unknown as UsersService;
  const configService = {
    get: () => 'secreto-de-pruebas-con-largo-suficiente',
  } as unknown as ConfigService;

  let strategy: JwtStrategy;

  beforeEach(() => {
    findById.mockReset();
    strategy = new JwtStrategy(configService, usersService);
  });

  it('resuelve el usuario indicado en el token', async () => {
    const user = { id: 'usuario-1', isActive: true };
    findById.mockResolvedValue(user);

    await expect(
      strategy.validate({ sub: 'usuario-1', email: 'ana@ejemplo.cl' }),
    ).resolves.toBe(user);
    expect(findById).toHaveBeenCalledWith('usuario-1');
  });

  it('rechaza un token de un usuario que ya no existe', async () => {
    findById.mockResolvedValue(null);

    await expect(
      strategy.validate({ sub: 'borrado', email: 'ana@ejemplo.cl' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rechaza a un usuario desactivado', async () => {
    findById.mockResolvedValue({ id: 'usuario-1', isActive: false });

    await expect(
      strategy.validate({ sub: 'usuario-1', email: 'ana@ejemplo.cl' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
