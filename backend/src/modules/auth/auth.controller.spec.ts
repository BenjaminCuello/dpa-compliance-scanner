import { Test, TestingModule } from '@nestjs/testing';
import { User } from '../users/entities/user.entity';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  const authService = { register: jest.fn(), login: jest.fn() };

  const respuesta = {
    accessToken: 'token',
    user: { id: 'usuario-1', email: 'ana@ejemplo.cl', name: 'Ana' },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authService }],
    }).compile();

    controller = module.get(AuthController);
  });

  it('delega el registro en el servicio', async () => {
    authService.register.mockResolvedValue(respuesta);
    const dto = {
      email: 'ana@ejemplo.cl',
      name: 'Ana',
      password: 'Clave.Segura1',
    };

    await expect(controller.register(dto)).resolves.toEqual(respuesta);
    expect(authService.register).toHaveBeenCalledWith(dto);
  });

  it('delega el inicio de sesión en el servicio', async () => {
    authService.login.mockResolvedValue(respuesta);
    const dto = { email: 'ana@ejemplo.cl', password: 'Clave.Segura1' };

    await expect(controller.login(dto)).resolves.toEqual(respuesta);
    expect(authService.login).toHaveBeenCalledWith(dto);
  });

  it('devuelve solo los datos públicos del usuario autenticado', () => {
    const user = {
      id: 'usuario-1',
      email: 'ana@ejemplo.cl',
      name: 'Ana',
      passwordHash: 'hash-secreto',
      isActive: true,
    } as User;

    const perfil = controller.profile(user);

    expect(perfil).toEqual({
      id: 'usuario-1',
      email: 'ana@ejemplo.cl',
      name: 'Ana',
    });
    expect(perfil).not.toHaveProperty('passwordHash');
  });
});
