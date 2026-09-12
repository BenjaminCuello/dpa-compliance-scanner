import { ConflictException, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Project } from './entities/project.entity';
import { ProjectsService } from './projects.service';

describe('ProjectsService', () => {
  const owner = { id: 'usuario-1' } as User;
  const repository = {
    findOne: jest.fn(),
    exists: jest.fn(),
    create: jest.fn((data: object) => data),
    save: jest.fn((data: object) => Promise.resolve({ id: 'nuevo', ...data })),
  };
  const service = new ProjectsService(
    repository as unknown as Repository<Project>,
  );
  const url = 'https://github.com/org/repo';

  beforeEach(() => jest.clearAllMocks());

  it('reutiliza el proyecto del usuario asociado al repositorio', async () => {
    repository.findOne.mockResolvedValue({ id: 'existente' });

    await expect(service.findOrCreate(owner, url, 'org/repo')).resolves.toEqual(
      { id: 'existente' },
    );
    expect(repository.findOne).toHaveBeenCalledWith({
      where: { repositoryUrl: url, owner: { id: 'usuario-1' } },
    });
    expect(repository.save).not.toHaveBeenCalled();
  });

  it('crea el proyecto en la primera auditoría del repositorio', async () => {
    repository.findOne.mockResolvedValue(null);
    repository.exists.mockResolvedValue(false);

    const project = await service.findOrCreate(owner, url, 'org/repo');

    expect(repository.create).toHaveBeenCalledWith({
      name: 'org/repo',
      repositoryUrl: url,
      owner: { id: 'usuario-1' },
    });
    expect(project.id).toBe('nuevo');
  });

  it('rechaza un nombre que el usuario ya usa para otro repositorio', async () => {
    repository.findOne.mockResolvedValue(null);
    repository.exists.mockResolvedValue(true);

    await expect(
      service.findOrCreate(owner, url, 'org/repo'),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('solo encuentra proyectos propios', async () => {
    repository.findOne.mockResolvedValue(null);

    await expect(service.findOwned('ajeno', owner)).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(repository.findOne).toHaveBeenCalledWith({
      where: { id: 'ajeno', owner: { id: 'usuario-1' } },
    });
  });
});
