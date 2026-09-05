import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  const repository = {
    findOne: jest.fn(),
    create: jest.fn((data: object) => data),
    save: jest.fn((data: object) => Promise.resolve(data)),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: repository },
      ],
    }).compile();

    service = module.get(UsersService);
  });

  it('busca por correo en minúsculas', async () => {
    repository.findOne.mockResolvedValue(null);

    await service.findByEmail('Ana@Ejemplo.CL');

    expect(repository.findOne).toHaveBeenCalledWith(
      expect.objectContaining({ where: { email: 'ana@ejemplo.cl' } }),
    );
  });

  it('omite el hash de la contraseña salvo que se pida', async () => {
    repository.findOne.mockResolvedValue(null);
    const llamadas = repository.findOne.mock.calls as Array<
      [{ select?: Record<string, boolean> }]
    >;
    const opcionesDe = (llamada: number) => llamadas[llamada][0];

    await service.findByEmail('ana@ejemplo.cl');
    expect(opcionesDe(0).select).toBeUndefined();

    await service.findByEmail('ana@ejemplo.cl', true);
    expect(opcionesDe(1).select).toMatchObject({ passwordHash: true });
  });

  it('normaliza el correo al crear el usuario', async () => {
    await service.create({
      email: 'Ana@Ejemplo.CL',
      name: 'Ana',
      passwordHash: 'hash',
    });

    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'ana@ejemplo.cl' }),
    );
    expect(repository.save).toHaveBeenCalled();
  });
});
