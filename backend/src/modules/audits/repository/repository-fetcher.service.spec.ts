import { ConfigService } from '@nestjs/config';
import { execFile } from 'node:child_process';
import { mkdir, mkdtemp, rm, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { RepositoryFetchError } from './repository.errors';
import { RepositoryFetcherService } from './repository-fetcher.service';

jest.mock('node:child_process', () => ({ execFile: jest.fn() }));

type Callback = (error: unknown, stdout: string, stderr: string) => void;

describe('RepositoryFetcherService', () => {
  const execFileMock = execFile as unknown as jest.Mock;
  let workspace: string;
  let maxRepositoryMb: number;
  let service: RepositoryFetcherService;

  beforeEach(async () => {
    workspace = await mkdtemp(join(tmpdir(), 'clones-'));
    maxRepositoryMb = 1;
    const settings = (key: string): unknown =>
      ({
        'scanner.workspaceDir': workspace,
        'audits.maxRepositoryMb': maxRepositoryMb,
        'audits.cloneTimeoutMs': 1000,
      })[key];
    service = new RepositoryFetcherService({
      get: settings,
    } as unknown as ConfigService);
    jest.spyOn(service['logger'], 'warn').mockImplementation();
    execFileMock.mockReset();
  });

  afterEach(() => rm(workspace, { recursive: true, force: true }));

  /** Simula un clon exitoso escribiendo archivos en el destino. */
  const cloneWriting = (bytes: number) =>
    execFileMock.mockImplementation(
      (_bin: string, args: string[], _options: object, callback: Callback) => {
        const destination = args.at(-1) as string;
        void mkdir(join(destination, 'src'), { recursive: true })
          .then(() =>
            writeFile(join(destination, 'src', 'a.ts'), Buffer.alloc(bytes)),
          )
          .then(() => callback(null, '', ''));
      },
    );

  it('clona sin shell, superficial, sin pedir credenciales y sin enlaces simbólicos', async () => {
    cloneWriting(10);

    const destination = await service.fetch(
      'https://github.com/org/repo',
      'auditoria-1',
    );

    const [bin, args, options] = execFileMock.mock.calls[0] as [
      string,
      string[],
      { env: Record<string, string>; timeout: number },
    ];
    expect(bin).toBe('git');
    expect(args).toEqual(
      expect.arrayContaining([
        'clone',
        '--depth',
        '1',
        'core.symlinks=false',
        'protocol.file.allow=never',
      ]),
    );
    expect(args.slice(-3)).toEqual([
      '--',
      'https://github.com/org/repo',
      join(workspace, 'auditoria-1'),
    ]);
    expect(options.env.GIT_TERMINAL_PROMPT).toBe('0');
    expect(options.timeout).toBe(1000);
    expect(destination).toBe(join(workspace, 'auditoria-1'));
  });

  it('descarta el repositorio si supera el tamaño máximo', async () => {
    cloneWriting(2 * 1024 * 1024);

    await expect(
      service.fetch('https://github.com/org/grande', 'auditoria-2'),
    ).rejects.toThrow('tamaño máximo');
    await expect(stat(join(workspace, 'auditoria-2'))).rejects.toThrow();
  });

  it('informa que el repositorio no existe o no es público', async () => {
    execFileMock.mockImplementation(
      (_b: string, _a: string[], _o: object, callback: Callback) =>
        callback(
          Object.assign(new Error('exit 128'), { code: 128 }),
          '',
          "fatal: could not read Username for 'https://github.com'",
        ),
    );

    const failure = service.fetch(
      'https://github.com/org/privado',
      'auditoria-3',
    );

    await expect(failure).rejects.toBeInstanceOf(RepositoryFetchError);
    await expect(failure).rejects.toThrow('exista y sea público');
  });

  it('informa cuando la descarga supera el tiempo máximo', async () => {
    execFileMock.mockImplementation(
      (_b: string, _a: string[], _o: object, callback: Callback) =>
        callback(Object.assign(new Error('killed'), { killed: true }), '', ''),
    );

    await expect(
      service.fetch('https://github.com/org/lento', 'auditoria-4'),
    ).rejects.toThrow('tiempo máximo');
  });

  it('vacía el directorio de trabajo al iniciar', async () => {
    await mkdir(join(workspace, 'clon-a-medias', 'src'), { recursive: true });
    await writeFile(join(workspace, 'resto.tmp'), 'x');

    await expect(service.clearWorkspace()).resolves.toBe(2);
    await expect(service.clearWorkspace()).resolves.toBe(0);
  });

  it('elimina el código descargado sin fallar si ya no existe', async () => {
    const folder = join(workspace, 'auditoria-5');
    await mkdir(folder);

    await service.remove(folder);
    await expect(service.remove(folder)).resolves.toBeUndefined();
    await expect(stat(folder)).rejects.toThrow();
  });
});
