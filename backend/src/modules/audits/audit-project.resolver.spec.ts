import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ProjectsService } from '../projects/projects.service';
import { User } from '../users/entities/user.entity';
import { AuditProjectResolver } from './audit-project.resolver';

describe('AuditProjectResolver', () => {
  const user = { id: 'usuario-1' } as User;
  const projects = { findOwned: jest.fn(), findOrCreate: jest.fn() };
  const config = { get: () => ['github.com'] } as unknown as ConfigService;
  const resolver = new AuditProjectResolver(
    projects as unknown as ProjectsService,
    config,
  );

  beforeEach(() => jest.clearAllMocks());

  it('usa el proyecto indicado verificando que sea del usuario', async () => {
    projects.findOwned.mockResolvedValue({ id: 'proyecto-1' });

    await expect(
      resolver.resolve(user, { projectId: 'proyecto-1' }),
    ).resolves.toEqual({ id: 'proyecto-1' });
    expect(projects.findOwned).toHaveBeenCalledWith('proyecto-1', user);
  });

  it('crea o reutiliza el proyecto con la URL normalizada y su ruta como nombre', async () => {
    await resolver.resolve(user, {
      repositoryUrl: 'https://github.com/org/repo.git/',
    });

    expect(projects.findOrCreate).toHaveBeenCalledWith(
      user,
      'https://github.com/org/repo',
      'org/repo',
    );
  });

  it('respeta el nombre elegido por el usuario', async () => {
    await resolver.resolve(user, {
      repositoryUrl: 'https://github.com/org/repo',
      projectName: '  Portal  ',
    });

    expect(projects.findOrCreate).toHaveBeenCalledWith(
      user,
      'https://github.com/org/repo',
      'Portal',
    );
  });

  it('rechaza recibir URL y proyecto a la vez', async () => {
    await expect(
      resolver.resolve(user, {
        repositoryUrl: 'https://github.com/org/repo',
        projectId: 'proyecto-1',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('convierte una URL inválida en un error de solicitud', async () => {
    await expect(
      resolver.resolve(user, { repositoryUrl: 'http://github.com/org/repo' }),
    ).rejects.toThrow('HTTPS');
    expect(projects.findOrCreate).not.toHaveBeenCalled();
  });
});
