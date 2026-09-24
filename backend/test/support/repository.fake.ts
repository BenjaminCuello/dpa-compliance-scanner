import { mkdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { RepositoryFetcherService } from '../../src/modules/audits/repository/repository-fetcher.service';

/**
 * Reemplaza el clonado con git creando un proyecto de mentira en el directorio
 * de trabajo. El escáner sigue validando la ruta como en producción.
 */
export class FakeRepositoryFetcher implements Pick<
  RepositoryFetcherService,
  'fetch' | 'remove' | 'clearWorkspace'
> {
  private failure: Error | null = null;
  readonly removed: string[] = [];

  constructor(private readonly workspace: string) {}

  /** Hace fallar la próxima descarga. */
  fails(error: Error): void {
    this.failure = error;
  }

  async fetch(url: string, folderName: string): Promise<string> {
    if (this.failure) {
      const error = this.failure;
      this.failure = null;
      throw error;
    }

    const destination = join(this.workspace, folderName);
    await mkdir(join(destination, 'src'), { recursive: true });
    await writeFile(
      join(destination, 'src', 'database.ts'),
      '// proyecto de prueba\n',
    );

    return destination;
  }

  async remove(path: string): Promise<void> {
    this.removed.push(path);
    await rm(path, { recursive: true, force: true });
  }

  clearWorkspace(): Promise<number> {
    return Promise.resolve(0);
  }
}
