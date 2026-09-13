import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { execFile } from 'node:child_process';
import { Dirent } from 'node:fs';
import { lstat, readdir, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { RepositoryFetchError } from './repository.errors';

const BYTES_PER_MB = 1024 * 1024;
const AUDIT_FOLDER =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Descarga el código de un repositorio público en el directorio de trabajo. */
@Injectable()
export class RepositoryFetcherService {
  private readonly logger = new Logger(RepositoryFetcherService.name);

  constructor(private readonly config: ConfigService) {}

  /**
   * Clona la última versión del repositorio.
   * @param url URL ya validada con `parseRepositoryUrl`.
   * @param folderName Nombre de la carpeta a crear dentro del directorio de trabajo.
   * @returns Ruta absoluta del código descargado.
   * @throws RepositoryFetchError si no se puede clonar o supera el tamaño máximo.
   */
  async fetch(url: string, folderName: string): Promise<string> {
    const destination = join(
      this.config.get<string>('scanner.workspaceDir', ''),
      folderName,
    );

    await this.clone(url, destination);

    const maxMb = this.config.get<number>('audits.maxRepositoryMb', 200);

    if ((await this.sizeOf(destination)) > maxMb * BYTES_PER_MB) {
      await this.remove(destination);
      throw new RepositoryFetchError(
        `El repositorio supera el tamaño máximo permitido de ${maxMb} MB`,
      );
    }

    return destination;
  }

  /**
   * Borra los clones que un reinicio dejó a medias. Solo debe llamarse al
   * iniciar, cuando ninguna auditoría está en curso.
   *
   * Únicamente elimina carpetas con nombre de auditoría (un UUID), que son las
   * que crea este servicio: si el directorio de trabajo se configurara sobre
   * una carpeta compartida, el resto de su contenido queda intacto.
   * @returns Cantidad de clones eliminados.
   */
  async clearWorkspace(): Promise<number> {
    const workspace = this.config.get<string>('scanner.workspaceDir', '');
    const entries: Dirent[] = await readdir(workspace, {
      withFileTypes: true,
    }).catch((): Dirent[] => []);
    const clones = entries.filter(
      (entry) => entry.isDirectory() && AUDIT_FOLDER.test(entry.name),
    );

    for (const clone of clones) {
      await this.remove(join(workspace, clone.name));
    }

    return clones.length;
  }

  /** Elimina el código descargado. No falla si la carpeta ya no existe. */
  async remove(path: string): Promise<void> {
    await rm(path, { recursive: true, force: true });
  }

  private clone(url: string, destination: string): Promise<void> {
    const timeout = this.config.get<number>('audits.cloneTimeoutMs', 120000);
    const args = [
      // Ni repositorios locales ni enlaces simbólicos que apunten fuera del clon.
      '-c',
      'protocol.file.allow=never',
      '-c',
      'core.symlinks=false',
      'clone',
      '--depth',
      '1',
      '--single-branch',
      '--no-tags',
      '--quiet',
      '--',
      url,
      destination,
    ];

    return new Promise((resolve, reject) => {
      execFile(
        'git',
        args,
        {
          timeout,
          // Sin esto, un repositorio privado dejaría a git esperando credenciales.
          env: { ...process.env, GIT_TERMINAL_PROMPT: '0' },
        },
        (error, _stdout, stderr) => {
          if (!error) {
            resolve();
            return;
          }

          this.logger.warn(
            `No se pudo clonar ${url}: ${stderr || error.message}`,
          );
          void this.remove(destination);
          reject(
            new RepositoryFetchError(
              error.killed
                ? 'La descarga del repositorio superó el tiempo máximo'
                : 'No se pudo descargar el repositorio. Verifica que exista y sea público',
            ),
          );
        },
      );
    });
  }

  /**
   * Suma el tamaño de los archivos sin seguir enlaces simbólicos. Recorre de a
   * uno para no abrir miles de descriptores a la vez en repositorios grandes.
   */
  private async sizeOf(root: string): Promise<number> {
    const pending = [root];
    let total = 0;

    while (pending.length > 0) {
      const current = pending.pop() as string;
      const info = await lstat(current);

      if (info.isDirectory()) {
        const entries = await readdir(current);
        pending.push(...entries.map((entry) => join(current, entry)));
      } else {
        total += info.size;
      }
    }

    return total;
  }
}
