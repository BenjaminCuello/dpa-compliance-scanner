import { ConfigService } from '@nestjs/config';
import { DataSource, Repository } from 'typeorm';
import { ScanFailedError } from '../../scanner/errors/scanner.errors';
import { ScannerService } from '../../scanner/scanner.service';
import { Audit } from '../entities/audit.entity';
import { AuditStatus, CheckSeverity, CheckStatus } from '../enums';
import { RepositoryFetcherService } from '../repository/repository-fetcher.service';
import { RepositoryFetchError } from '../repository/repository.errors';
import { AuditRunnerService } from './audit-runner.service';

describe('AuditRunnerService', () => {
  const audits = { findOne: jest.fn(), update: jest.fn() };
  const manager = { insert: jest.fn(), update: jest.fn() };
  const dataSource = {
    transaction: jest.fn((work: (m: typeof manager) => Promise<void>) =>
      work(manager),
    ),
  };
  const fetcher = { fetch: jest.fn(), remove: jest.fn() };
  const scanner = { scan: jest.fn() };
  const config = { get: () => 2 } as unknown as ConfigService;

  const runner = new AuditRunnerService(
    audits as unknown as Repository<Audit>,
    dataSource as unknown as DataSource,
    fetcher as unknown as RepositoryFetcherService,
    scanner as unknown as ScannerService,
    config,
  );

  const audit = {
    id: 'auditoria-1',
    project: { repositoryUrl: 'https://github.com/org/repo' },
  };

  const report = {
    summary: { totalChecks: 2, passedChecks: 1 },
    checks: [
      {
        code: 'DPA-CFG-002',
        title: 'CORS',
        status: CheckStatus.PASSED,
        severity: CheckSeverity.MEDIUM,
        findings: [],
      },
      {
        code: 'DPA-SEC-001',
        title: 'Credenciales',
        status: CheckStatus.FAILED,
        severity: CheckSeverity.CRITICAL,
        findings: [
          {
            severity: CheckSeverity.CRITICAL,
            message: 'x',
            filePath: 'a.ts',
            line: 1,
          },
        ],
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(runner['logger'], 'warn').mockImplementation();
    audits.findOne.mockResolvedValue(audit);
    fetcher.fetch.mockResolvedValue('/tmp/dpa-scanner/auditoria-1');
  });

  it('clona, escanea y guarda resultados y estado final en una transacción', async () => {
    scanner.scan.mockResolvedValue(report);

    await runner.execute('auditoria-1');

    expect(audits.update).toHaveBeenCalledWith(
      'auditoria-1',
      expect.objectContaining({ status: AuditStatus.RUNNING }),
    );
    expect(fetcher.fetch).toHaveBeenCalledWith(
      'https://github.com/org/repo',
      'auditoria-1',
    );
    expect(scanner.scan).toHaveBeenCalledWith('/tmp/dpa-scanner/auditoria-1');
    expect(manager.insert).toHaveBeenCalledTimes(1);
    expect((manager.insert.mock.calls[0] as unknown[])[1]).toHaveLength(2);
    expect(manager.update).toHaveBeenCalledWith(
      Audit,
      'auditoria-1',
      expect.objectContaining({
        status: AuditStatus.COMPLETED,
        complianceScore: '50.00',
      }),
    );
    expect(fetcher.remove).toHaveBeenCalledWith('/tmp/dpa-scanner/auditoria-1');
  });

  it('marca la auditoría como fallida con un mensaje apto para el usuario', async () => {
    scanner.scan.mockRejectedValue(
      new ScanFailedError('El escaneo superó el tiempo máximo permitido'),
    );

    await runner.execute('auditoria-1');

    expect(audits.update).toHaveBeenLastCalledWith(
      'auditoria-1',
      expect.objectContaining({
        status: AuditStatus.FAILED,
        errorMessage: 'El escaneo superó el tiempo máximo permitido',
      }),
    );
    expect(manager.insert).not.toHaveBeenCalled();
    expect(fetcher.remove).toHaveBeenCalled();
  });

  it('no intenta borrar código si el clonado falló', async () => {
    fetcher.fetch.mockRejectedValue(
      new RepositoryFetchError('No se pudo descargar'),
    );

    await runner.execute('auditoria-1');

    expect(scanner.scan).not.toHaveBeenCalled();
    expect(fetcher.remove).not.toHaveBeenCalled();
    expect(audits.update).toHaveBeenLastCalledWith(
      'auditoria-1',
      expect.objectContaining({
        status: AuditStatus.FAILED,
        errorMessage: 'No se pudo descargar',
      }),
    );
  });
});
