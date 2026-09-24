import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { ConflictException } from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';

describe('AuthService: registros simultáneos', () => {
  const usersService = { findByEmail: jest.fn(), create: jest.fn() };
  const service = new AuthService(
    usersService as unknown as UsersService,
    { sign: () => 'token' } as unknown as JwtService,
    { get: () => 10 } as unknown as ConfigService,
  );
  const dto = {
    email: 'ana@ejemplo.cl',
    name: 'Ana',
    password: 'Clave.Segura1',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    usersService.findByEmail.mockResolvedValue(null);
  });

  it('responde conflicto si la base rechaza el correo duplicado', async () => {
    usersService.findByEmail.mockResolvedValue(null);
    usersService.create.mockRejectedValue(
      new QueryFailedError('INSERT', [], {
        code: '23505',
      } as unknown as Error),
    );

    await expect(service.register(dto)).rejects.toBeInstanceOf(
      ConflictException,
    );
    await expect(service.register(dto)).rejects.toThrow(
      'El correo ya está registrado',
    );
  });

  it('propaga cualquier otro error al crear la cuenta', async () => {
    usersService.findByEmail.mockResolvedValue(null);
    usersService.create.mockRejectedValue(new Error('conexión perdida'));

    await expect(service.register(dto)).rejects.toThrow('conexión perdida');
  });
});
