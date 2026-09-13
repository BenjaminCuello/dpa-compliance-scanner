import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';

// Se envuelve la implementación real para poder verificar sus llamadas.
jest.mock('bcrypt', () => {
  const actual = jest.requireActual<typeof import('bcrypt')>('bcrypt');
  return {
    ...actual,
    compare: jest.fn((data: string, hash: string) =>
      actual.compare(data, hash),
    ),
  };
});

describe('AuthService: login sin diferencias de tiempo', () => {
  const findByEmail = jest.fn();
  const compare = jest.mocked(bcrypt.compare);
  const service = new AuthService(
    { findByEmail } as unknown as UsersService,
    { sign: () => 'token' } as unknown as JwtService,
    { get: () => 4 } as unknown as ConfigService,
  );
  const login = (email: string) =>
    service.login({ email, password: 'Clave.Segura1' });

  beforeEach(() => {
    findByEmail.mockReset();
    compare.mockClear();
  });

  it('ejecuta bcrypt aunque el correo no exista', async () => {
    findByEmail.mockResolvedValue(null);

    await expect(login('nadie@ejemplo.cl')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );

    expect(compare).toHaveBeenCalledTimes(1);
    const [, hash] = compare.mock.calls[0] as unknown as [string, string];
    expect(hash).toMatch(/^\$2[aby]\$\d{2}\$/);
  });

  it('ejecuta bcrypt aunque la cuenta esté desactivada', async () => {
    findByEmail.mockResolvedValue({
      id: 'usuario-1',
      isActive: false,
      passwordHash: await bcrypt.hash('Clave.Segura1', 4),
    });

    await expect(login('ana@ejemplo.cl')).rejects.toThrow(
      'Credenciales inválidas',
    );
    expect(compare).toHaveBeenCalledTimes(1);
  });
});
