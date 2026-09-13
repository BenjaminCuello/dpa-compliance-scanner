import { ConfigService } from '@nestjs/config';
import { mkdir, mkdtemp, rm, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { RepositoryFetcherService } from './repository-fetcher.service';

describe('RepositoryFetcherService.clearWorkspace', () => {
  let workspace: string;
  let service: RepositoryFetcherService;

  beforeEach(async () => {
    workspace = await mkdtemp(join(tmpdir(), 'limpieza-'));
    service = new RepositoryFetcherService({
      get: () => workspace,
    } as unknown as ConfigService);
  });

  afterEach(() => rm(workspace, { recursive: true, force: true }));

  it('al iniciar elimina solo los clones de auditorías', async () => {
    const clone = join(workspace, '5a9aff64-4f9d-4a50-b9c7-e19a3e6b7de1');
    await mkdir(join(clone, 'src'), { recursive: true });
    await mkdir(join(workspace, 'datos-ajenos'));
    await writeFile(join(workspace, 'notas.txt'), 'no borrar');
    await writeFile(
      join(workspace, '0f8fad5b-d9cb-469f-a165-70867728950e'),
      'archivo, no carpeta',
    );

    await expect(service.clearWorkspace()).resolves.toBe(1);

    await expect(stat(clone)).rejects.toThrow();
    await expect(stat(join(workspace, 'datos-ajenos'))).resolves.toBeTruthy();
    await expect(stat(join(workspace, 'notas.txt'))).resolves.toBeTruthy();
    await expect(
      stat(join(workspace, '0f8fad5b-d9cb-469f-a165-70867728950e')),
    ).resolves.toBeTruthy();
  });

  it('no falla si el directorio de trabajo no existe', async () => {
    await rm(workspace, { recursive: true, force: true });

    await expect(service.clearWorkspace()).resolves.toBe(0);
  });
});
