import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { RuleCatalogService } from '../scanner/catalog/rule-catalog.service';
import { User } from '../users/entities/user.entity';
import { AuditProjectResolver } from './audit-project.resolver';
import { AuditDetailDto } from './dto/audit-detail.dto';
import { AuditListDto, AuditSummaryDto } from './dto/audit-summary.dto';
import { ListAuditsQueryDto } from './dto/list-audits-query.dto';
import { StartAuditDto } from './dto/start-audit.dto';
import { Audit } from './entities/audit.entity';
import { CheckResult } from './entities/check-result.entity';
import { AuditRunnerService } from './execution/audit-runner.service';
import { toAuditDetail, toAuditSummary } from './mappers/audit-response.mapper';

const UNIQUE_VIOLATION = '23505';

/** Inicio y consulta de auditorías, siempre acotado a los proyectos del usuario. */
@Injectable()
export class AuditsService {
  constructor(
    @InjectRepository(Audit) private readonly audits: Repository<Audit>,
    @InjectRepository(CheckResult)
    private readonly checkResults: Repository<CheckResult>,
    private readonly projectResolver: AuditProjectResolver,
    private readonly runner: AuditRunnerService,
    private readonly catalog: RuleCatalogService,
  ) {}

  /**
   * Registra la auditoría y la deja en cola; responde sin esperar el escaneo.
   * @throws BadRequestException si la URL no es válida o faltan datos.
   * @throws NotFoundException si el proyecto no pertenece al usuario.
   * @throws ConflictException si el proyecto ya tiene una auditoría en curso.
   */
  async start(user: User, dto: StartAuditDto): Promise<AuditSummaryDto> {
    const project = await this.projectResolver.resolve(user, dto);

    let audit: Audit;

    try {
      audit = await this.audits.save(this.audits.create({ project }));
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        (error.driverError as { code?: string }).code === UNIQUE_VIOLATION
      ) {
        throw new ConflictException(
          'El proyecto ya tiene una auditoría en curso',
        );
      }

      throw error;
    }

    this.runner.enqueue(audit.id);
    return toAuditSummary({ ...audit, project });
  }

  /** Historial del usuario, del más reciente al más antiguo. */
  async list(user: User, query: ListAuditsQueryDto): Promise<AuditListDto> {
    const builder = this.audits
      .createQueryBuilder('audit')
      .innerJoinAndSelect('audit.project', 'project')
      .where('project.owner_id = :ownerId', { ownerId: user.id })
      .orderBy('audit.createdAt', 'DESC')
      .skip((query.page - 1) * query.limit)
      .take(query.limit);

    if (query.projectId) {
      builder.andWhere('project.id = :projectId', {
        projectId: query.projectId,
      });
    }

    if (query.status) {
      builder.andWhere('audit.status = :status', { status: query.status });
    }

    const [items, total] = await builder.getManyAndCount();

    return {
      items: items.map(toAuditSummary),
      total,
      page: query.page,
      limit: query.limit,
    };
  }

  /**
   * Detalle con los resultados de cada control.
   * @throws NotFoundException si no existe o pertenece a otro usuario.
   */
  async findOne(user: User, auditId: string): Promise<AuditDetailDto> {
    const audit = await this.audits.findOne({
      where: { id: auditId, project: { owner: { id: user.id } } },
      relations: { project: true },
    });

    if (!audit) {
      throw new NotFoundException('Auditoría no encontrada');
    }

    const rows = await this.checkResults.find({
      where: { audit: { id: auditId } },
      order: { code: 'ASC', filePath: 'ASC', lineNumber: 'ASC' },
    });

    return toAuditDetail(audit, rows, this.catalog.getChecks());
  }
}
