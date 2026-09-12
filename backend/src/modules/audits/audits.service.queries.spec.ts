import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { RuleCatalogService } from '../scanner/catalog/rule-catalog.service';
import { User } from '../users/entities/user.entity';
import { AuditProjectResolver } from './audit-project.resolver';
import { AuditsService } from './audits.service';
import { Audit } from './entities/audit.entity';
import { CheckResult } from './entities/check-result.entity';
import { AuditStatus } from './enums';
import { AuditRunnerService } from './execution/audit-runner.service';

describe('AuditsService consultas', () => {
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

  describe('list', () => {
    beforeEach(() => {
      builder.getManyAndCount.mockResolvedValue([
        [{ ...savedAudit, project }],
        21,
      ]);
    });

    it('limita el historial a los proyectos del usuario y pagina', async () => {
      const result = await service.list(user, { page: 2, limit: 20 });

      expect(builder.where).toHaveBeenCalledWith(
        'project.owner_id = :ownerId',
        { ownerId: 'usuario-1' },
      );
      expect(builder.orderBy).toHaveBeenCalledWith('audit.createdAt', 'DESC');
      expect(builder.skip).toHaveBeenCalledWith(20);
      expect(builder.take).toHaveBeenCalledWith(20);
      expect(builder.andWhere).not.toHaveBeenCalled();
      expect(result).toMatchObject({ total: 21, page: 2, limit: 20 });
      expect(result.items).toHaveLength(1);
    });

    it('filtra por proyecto y estado cuando se indican', async () => {
      await service.list(user, {
        page: 1,
        limit: 10,
        projectId: 'proyecto-1',
        status: AuditStatus.COMPLETED,
      });

      expect(builder.andWhere).toHaveBeenCalledWith('project.id = :projectId', {
        projectId: 'proyecto-1',
      });
      expect(builder.andWhere).toHaveBeenCalledWith('audit.status = :status', {
        status: AuditStatus.COMPLETED,
      });
    });
  });

  describe('findOne', () => {
    it('busca la auditoría solo entre los proyectos del usuario', async () => {
      audits.findOne.mockResolvedValue({ ...savedAudit, project });
      checkResults.find.mockResolvedValue([]);

      const detail = await service.findOne(user, 'auditoria-1');

      expect(audits.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'auditoria-1', project: { owner: { id: 'usuario-1' } } },
        }),
      );
      expect(detail.id).toBe('auditoria-1');
      expect(detail.totals.totalChecks).toBe(0);
    });

    it('responde que no existe si pertenece a otra persona', async () => {
      audits.findOne.mockResolvedValue(null);

      await expect(service.findOne(user, 'ajena')).rejects.toBeInstanceOf(
        NotFoundException,
      );
      expect(checkResults.find).not.toHaveBeenCalled();
    });
  });
});
