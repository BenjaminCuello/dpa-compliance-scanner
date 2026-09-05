import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  const usersService = { findByEmail: jest.fn(), create: jest.fn() };
  const jwtService = { sign: jest.fn(() => 'token-firmado') };

  const storedUser = {
    id: 'usuario-1',
    email: 'ana@ejemplo.cl',
    name: 'Ana',
    passwordHash: 'hash-guardado',
    isActive: true,
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
        { provide: ConfigService, useValue: { get: () => 4 } },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  describe('register', () => {
    const dto = {
      email: 'ana@ejemplo.cl',
      name: 'Ana',
      password: 'Clave.Segura1',
    };

    it('guarda la contraseña siempre cifrada', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      usersService.create.mockImplementation((data: { passwordHash: string }) =>
        Promise.resolve({ ...storedUser, passwordHash: data.passwordHash }),
      );

      const result = await service.register(dto);
      const llamadas = usersService.create.mock.calls as Array<
        [{ passwordHash: string }]
      >;
      const guardado = llamadas[0][0];

      expect(guardado.passwordHash).not.toBe(dto.password);
      await expect(
        bcrypt.compare(dto.password, guardado.passwordHash),
      ).resolves.toBe(true);
      expect(result.accessToken).toBe('token-firmado');
      expect(result.user).toEqual({
        id: storedUser.id,
        email: storedUser.email,
        name: storedUser.name,
      });
    });

    it('rechaza un correo ya registrado', async () => {
      usersService.findByEmail.mockResolvedValue(storedUser);

      await expect(service.register(dto)).rejects.toBeInstanceOf(
        ConflictException,
      );
      expect(usersService.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('entrega un token cuando las credenciales son correctas', async () => {
      const passwordHash = await bcrypt.hash('Clave.Segura1', 4);
      usersService.findByEmail.mockResolvedValue({
        ...storedUser,
        passwordHash,
      });

      const result = await service.login({
        email: 'ana@ejemplo.cl',
        password: 'Clave.Segura1',
      });

      expect(result.accessToken).toBe('token-firmado');
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: storedUser.id,
        email: storedUser.email,
      });
    });

    it('rechaza una contraseña incorrecta', async () => {
      const passwordHash = await bcrypt.hash('Clave.Segura1', 4);
      usersService.findByEmail.mockResolvedValue({
        ...storedUser,
        passwordHash,
      });

      await expect(
        service.login({ email: 'ana@ejemplo.cl', password: 'otra-clave' }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('responde igual cuando el correo no existe', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      await expect(
        service.login({ email: 'nadie@ejemplo.cl', password: 'Clave.Segura1' }),
      ).rejects.toThrow('Credenciales inválidas');
    });

    it('rechaza a un usuario desactivado', async () => {
      usersService.findByEmail.mockResolvedValue({
        ...storedUser,
        isActive: false,
      });

      await expect(
        service.login({ email: 'ana@ejemplo.cl', password: 'Clave.Segura1' }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });
  });
});
