import { ConflictException } from '@nestjs/common';
import { QueryFailedError, Repository } from 'typeorm';
import { RuleCatalogService } from '../scanner/catalog/rule-catalog.service';
import { User } from '../users/entities/user.entity';
import { AuditProjectResolver } from './audit-project.resolver';
import { AuditsService } from './audits.service';
import { Audit } from './entities/audit.entity';
import { CheckResult } from './entities/check-result.entity';
import { AuditStatus } from './enums';
import { AuditRunnerService } from './execution/audit-runner.service';

describe('AuditsService.start', () => {
  const user = { id: 'usuario-1' } as User;
  const project = {
    id: 'proyecto-1',
    name: 'org/repo',
    repositoryUrl: 'https://github.com/org/repo',
  };

  const builder = {
    innerJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn(),
  };
  const audits = {
    create: jest.fn((data: object) => data),
    save: jest.fn(),
    findOne: jest.fn(),
    createQueryBuilder: jest.fn(() => builder),
  };
  const checkResults = { find: jest.fn() };
  const resolver = { resolve: jest.fn() };
  const runner = { enqueue: jest.fn() };
  const catalog = { getChecks: () => [] };

  const service = new AuditsService(
    audits as unknown as Repository<Audit>,
    checkResults as unknown as Repository<CheckResult>,
    resolver as unknown as AuditProjectResolver,
    runner as unknown as AuditRunnerService,
    catalog as unknown as RuleCatalogService,
  );

  const savedAudit = {
    id: 'auditoria-1',
    status: AuditStatus.PENDING,
    complianceScore: null,
    createdAt: new Date(),
    startedAt: null,
    finishedAt: null,
    errorMessage: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    resolver.resolve.mockResolvedValue(project);
  });

  describe('start', () => {
    it('registra la auditoría pendiente y la encola', async () => {
      audits.save.mockResolvedValue(savedAudit);

      const result = await service.start(user, {
        repositoryUrl: project.repositoryUrl,
      });

      expect(audits.create).toHaveBeenCalledWith({ project });
      expect(runner.enqueue).toHaveBeenCalledWith('auditoria-1');
      expect(result).toMatchObject({
        id: 'auditoria-1',
        status: AuditStatus.PENDING,
        project,
      });
    });

    it('rechaza una segunda auditoría en curso del mismo proyecto', async () => {
      const violation = new QueryFailedError(
        'INSERT',
        [],
        Object.assign(new Error('duplicate key'), { code: '23505' }),
      );
      audits.save.mockRejectedValue(violation);

      await expect(
        service.start(user, { projectId: 'proyecto-1' }),
      ).rejects.toBeInstanceOf(ConflictException);
      expect(runner.enqueue).not.toHaveBeenCalled();
    });

    it('propaga cualquier otro error de la base de datos', async () => {
      audits.save.mockRejectedValue(new Error('conexión perdida'));

      await expect(
        service.start(user, { projectId: 'proyecto-1' }),
      ).rejects.toThrow('conexión perdida');
    });
  });
});
