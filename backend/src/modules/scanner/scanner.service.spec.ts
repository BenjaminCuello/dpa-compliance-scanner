import { ConfigService } from '@nestjs/config';
import {
  mkdir,
  mkdtemp,
  realpath,
  rm,
  symlink,
  writeFile,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { CheckSeverity, CheckStatus } from '../audits/enums';
import { RuleCatalogService } from './catalog/rule-catalog.service';
import { InvalidScanTargetError } from './errors/scanner.errors';
import { ScannerService } from './scanner.service';
import { SemgrepRunnerService } from './semgrep/semgrep-runner.service';

describe('ScannerService', () => {
  let root: string;
  let workspace: string;
  let project: string;
  let service: ScannerService;
  const run = jest.fn();

  beforeEach(async () => {
    root = await mkdtemp(join(tmpdir(), 'escaner-'));
    workspace = join(root, 'workspace');
    project = join(workspace, 'proyecto');
    await mkdir(project, { recursive: true });

    const config = { get: () => workspace } as unknown as ConfigService;
    const catalog = {
      getChecks: () => [
        {
          code: 'DPA-SEC-003',
          title: 'Claves privadas en el repositorio',
          category: 'secrets',
          severity: CheckSeverity.CRITICAL,
          remediation: 'Eliminar la clave',
          ruleIds: ['dpa-private-key'],
        },
      ],
    } as unknown as RuleCatalogService;

    run.mockReset();
    service = new ScannerService(config, catalog, {
      run,
    } as unknown as SemgrepRunnerService);
  });

  afterEach(() => rm(root, { recursive: true, force: true }));

  it('entrega el reporte estructurado del escaneo', async () => {
    // Semgrep recibe la ruta ya resuelta y reporta los hallazgos bajo ella.
    const realProject = await realpath(project);
    run.mockResolvedValue({
      version: '1.176.1',
      results: [
        {
          check_id: 'semgrep.rules.dpa-private-key',
          path: join(realProject, 'certs/server.key'),
          start: { line: 1, col: 1 },
          end: { line: 1, col: 32 },
          extra: {
            message: 'Clave privada',
            severity: 'ERROR',
            metadata: { 'dpa-code': 'DPA-SEC-003', 'dpa-severity': 'critical' },
          },
        },
      ],
      errors: [],
      paths: { scanned: ['a', 'b', 'c'] },
    });

    const report = await service.scan(project);

    expect(report.engine).toEqual({ name: 'semgrep', version: '1.176.1' });
    expect(report.scannedFiles).toBe(3);
    expect(report.summary).toMatchObject({
      totalChecks: 1,
      failedChecks: 1,
      totalFindings: 1,
    });
    expect(report.checks[0].status).toBe(CheckStatus.FAILED);
    expect(report.checks[0].findings[0].filePath).toBe(
      join('certs', 'server.key'),
    );
    expect(Date.parse(report.finishedAt)).toBeGreaterThanOrEqual(
      Date.parse(report.startedAt),
    );
  });

  it('crea el directorio de trabajo al iniciar', async () => {
    await rm(workspace, { recursive: true, force: true });

    await service.onModuleInit();

    await expect(realpath(workspace)).resolves.toBeTruthy();
  });

  it('rechaza rutas relativas', async () => {
    await expect(service.scan('workspace/proyecto')).rejects.toBeInstanceOf(
      InvalidScanTargetError,
    );
    expect(run).not.toHaveBeenCalled();
  });

  it('rechaza rutas inexistentes', async () => {
    await expect(service.scan(join(workspace, 'no-existe'))).rejects.toThrow(
      'no existe',
    );
  });

  it('rechaza directorios fuera del espacio de trabajo', async () => {
    const outside = join(root, 'fuera');
    await mkdir(outside);

    await expect(service.scan(outside)).rejects.toThrow(
      'dentro del directorio de trabajo',
    );
    await expect(
      service.scan(join(project, '..', '..', 'fuera')),
    ).rejects.toThrow('dentro del directorio de trabajo');
  });

  it('no permite escapar del espacio de trabajo con un enlace simbólico', async () => {
    const outside = join(root, 'secreto');
    await mkdir(outside);
    await symlink(outside, join(workspace, 'enlace'));

    await expect(
      service.scan(join(workspace, 'enlace')),
    ).rejects.toBeInstanceOf(InvalidScanTargetError);
  });

  it('no permite escanear el espacio de trabajo completo', async () => {
    await expect(service.scan(workspace)).rejects.toBeInstanceOf(
      InvalidScanTargetError,
    );
  });

  it('rechaza archivos que no son directorios', async () => {
    const file = join(workspace, 'archivo.txt');
    await writeFile(file, 'contenido');

    await expect(service.scan(file)).rejects.toThrow('debe ser un directorio');
  });
});
