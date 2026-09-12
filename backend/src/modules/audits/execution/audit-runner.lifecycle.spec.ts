import { ConfigService } from '@nestjs/config';
import { DataSource, Repository } from 'typeorm';
import { ScannerService } from '../../scanner/scanner.service';
import { Audit } from '../entities/audit.entity';
import { AuditStatus } from '../enums';
import { RepositoryFetcherService } from '../repository/repository-fetcher.service';
import { AuditRunnerService } from './audit-runner.service';

describe('AuditRunnerService ciclo de vida', () => {
  const audits = { findOne: jest.fn(), update: jest.fn() };
  const manager = { insert: jest.fn(), update: jest.fn() };
  const dataSource = {
    transaction: jest.fn((work: (m: typeof manager) => Promise<void>) =>
      work(manager),
    ),
  };
  const fetcher = {
    fetch: jest.fn(),
    remove: jest.fn(),
    clearWorkspace: jest.fn(),
  };
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

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(runner['logger'], 'warn').mockImplementation();
    audits.findOne.mockResolvedValue(audit);
    fetcher.fetch.mockResolvedValue('/tmp/dpa-scanner/auditoria-1');
  });

  it('ignora una auditoría que ya no existe', async () => {
    audits.findOne.mockResolvedValue(null);

    await runner.execute('borrada');

    expect(audits.update).not.toHaveBeenCalled();
  });

  it('marca como fallidas las auditorías que el reinicio dejó a medias', async () => {
    audits.update.mockResolvedValue({ affected: 2 });

    await runner.onApplicationBootstrap();

    const [criteria, changes] = audits.update.mock.calls[0] as [
      { status: unknown },
      { status: AuditStatus },
    ];
    expect(criteria.status).toBeDefined();
    expect(changes.status).toBe(AuditStatus.FAILED);
    expect(fetcher.clearWorkspace).toHaveBeenCalled();
  });

  it('encola la ejecución sin esperarla', async () => {
    const execute = jest.spyOn(runner, 'execute').mockResolvedValue();

    expect(runner.enqueue('auditoria-1')).toBeUndefined();
    await new Promise((resolve) => setImmediate(resolve));

    expect(execute).toHaveBeenCalledWith('auditoria-1');
    execute.mockRestore();
  });
});
