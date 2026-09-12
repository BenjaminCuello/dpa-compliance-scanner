import { ConfigService } from '@nestjs/config';
import { execFile } from 'node:child_process';
import {
  ScanFailedError,
  ScannerUnavailableError,
} from '../errors/scanner.errors';
import { SemgrepRunnerService } from './semgrep-runner.service';

jest.mock('node:child_process', () => ({ execFile: jest.fn() }));

type Callback = (error: unknown, stdout: string, stderr: string) => void;

describe('SemgrepRunnerService', () => {
  const execFileMock = execFile as unknown as jest.Mock;
  const settings: Record<string, unknown> = {
    'scanner.semgrepBin': 'semgrep',
    'scanner.rulesDir': '/app/semgrep/rules',
    'scanner.timeoutMs': 5000,
  };
  const config = {
    get: (key: string) => settings[key],
  } as unknown as ConfigService;
  const runner = new SemgrepRunnerService(config);

  const respondWith = (error: unknown, stdout = '', stderr = '') => {
    execFileMock.mockImplementation(
      (_bin: string, _args: string[], _options: object, callback: Callback) =>
        callback(error, stdout, stderr),
    );
  };

  const validOutput = JSON.stringify({
    version: '1.176.1',
    results: [],
    errors: [],
  });

  beforeEach(() => execFileMock.mockReset());

  it('ejecuta Semgrep sin shell, con las reglas y el directorio como argumentos', async () => {
    respondWith(null, validOutput);

    await runner.run('/tmp/dpa-scanner/proyecto');

    const [bin, args, options] = execFileMock.mock.calls[0] as [
      string,
      string[],
      object,
    ];
    expect(bin).toBe('semgrep');
    expect(args).toEqual(
      expect.arrayContaining([
        'scan',
        '--json',
        '--config',
        '/app/semgrep/rules',
        '--metrics=off',
      ]),
    );
    expect(args.at(-1)).toBe('/tmp/dpa-scanner/proyecto');
    expect(options).toMatchObject({ timeout: 5000 });
  });

  it('excluye dependencias y artefactos de compilación', async () => {
    respondWith(null, validOutput);

    await runner.run('/tmp/dpa-scanner/proyecto');

    const [, args] = execFileMock.mock.calls[0] as [string, string[]];
    expect(args.join(' ')).toContain('--exclude node_modules');
  });

  it('informa que el motor no está instalado', async () => {
    respondWith(
      Object.assign(new Error('spawn semgrep ENOENT'), { code: 'ENOENT' }),
    );

    await expect(runner.run('/tmp/x')).rejects.toBeInstanceOf(
      ScannerUnavailableError,
    );
  });

  it('informa cuando se supera el tiempo máximo', async () => {
    respondWith(
      Object.assign(new Error('timeout'), { killed: true, signal: 'SIGTERM' }),
    );

    await expect(runner.run('/tmp/x')).rejects.toThrow('tiempo máximo');
  });

  it('aprovecha la salida aunque el proceso termine con código distinto de cero', async () => {
    respondWith(Object.assign(new Error('exit 2'), { code: 2 }), validOutput);

    await expect(runner.run('/tmp/x')).resolves.toMatchObject({
      version: '1.176.1',
    });
  });

  it('falla sin exponer el detalle cuando no hay salida utilizable', async () => {
    respondWith(
      Object.assign(new Error('exit 7'), { code: 7 }),
      '',
      'ruta interna /etc/x',
    );
    jest.spyOn(runner['logger'], 'error').mockImplementation();

    const failure = runner.run('/tmp/x');

    await expect(failure).rejects.toBeInstanceOf(ScanFailedError);
    await expect(failure).rejects.not.toThrow('/etc/x');
  });
});
