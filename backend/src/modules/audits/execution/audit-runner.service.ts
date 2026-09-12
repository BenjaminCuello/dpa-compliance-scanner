import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { ScannerService } from '../../scanner/scanner.service';
import { Audit } from '../entities/audit.entity';
import { CheckResult } from '../entities/check-result.entity';
import { AuditStatus } from '../enums';
import { RepositoryFetcherService } from '../repository/repository-fetcher.service';
import { toPublicFailureMessage } from './audit-failure';
import {
  calculateComplianceScore,
  toCheckResultRows,
} from './audit-results.mapper';
import { ConcurrencyLimiter } from './concurrency-limiter';

const INSERT_BATCH_SIZE = 500;

/** Ejecuta las auditorías en segundo plano: clona, escanea y guarda. */
@Injectable()
export class AuditRunnerService implements OnApplicationBootstrap {
  private readonly logger = new Logger(AuditRunnerService.name);
  private readonly limiter: ConcurrencyLimiter;

  constructor(
    @InjectRepository(Audit) private readonly audits: Repository<Audit>,
    private readonly dataSource: DataSource,
    private readonly fetcher: RepositoryFetcherService,
    private readonly scanner: ScannerService,
    config: ConfigService,
  ) {
    this.limiter = new ConcurrencyLimiter(
      config.get<number>('audits.maxConcurrent', 2),
    );
  }

  /**
   * Las auditorías solo viven en memoria mientras corren: si el servicio se
   * reinició, las que quedaron a medias no van a terminar nunca, y su código
   * clonado quedaría ocupando disco.
   */
  async onApplicationBootstrap(): Promise<void> {
    const { affected } = await this.audits.update(
      { status: In([AuditStatus.PENDING, AuditStatus.RUNNING]) },
      {
        status: AuditStatus.FAILED,
        finishedAt: new Date(),
        errorMessage:
          'La auditoría se interrumpió porque el servicio se reinició',
      },
    );

    if (affected) {
      this.logger.warn(
        `${affected} auditorías interrumpidas marcadas como fallidas`,
      );
    }
    const leftovers = await this.fetcher.clearWorkspace();

    if (leftovers) {
      this.logger.warn(
        `${leftovers} clones de auditorías anteriores eliminados`,
      );
    }
  }

  /** Agenda la auditoría sin esperar a que termine. */
  enqueue(auditId: string): void {
    this.limiter
      .run(() => this.execute(auditId))
      .catch((error: Error) =>
        this.logger.error(
          `Error no controlado en la auditoría ${auditId}`,
          error.stack,
        ),
      );
  }

  /** Recorre el ciclo completo de una auditoría. Nunca lanza errores. */
  async execute(auditId: string): Promise<void> {
    const audit = await this.audits.findOne({
      where: { id: auditId },
      relations: { project: true },
    });

    if (!audit) {
      return;
    }

    await this.audits.update(auditId, {
      status: AuditStatus.RUNNING,
      startedAt: new Date(),
    });

    let sourceDir: string | null = null;

    try {
      sourceDir = await this.fetcher.fetch(
        audit.project.repositoryUrl,
        auditId,
      );
      const report = await this.scanner.scan(sourceDir);
      await this.complete(
        auditId,
        toCheckResultRows(report),
        calculateComplianceScore(report),
      );
    } catch (error) {
      this.logger.warn(
        `Auditoría ${auditId} fallida: ${(error as Error).message}`,
      );
      await this.audits.update(auditId, {
        status: AuditStatus.FAILED,
        finishedAt: new Date(),
        errorMessage: toPublicFailureMessage(error),
      });
    } finally {
      if (sourceDir) {
        await this.fetcher.remove(sourceDir);
      }
    }
  }

  /** Guarda resultados y estado final juntos, para no dejar datos a medias. */
  private async complete(
    auditId: string,
    rows: ReturnType<typeof toCheckResultRows>,
    complianceScore: string,
  ): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      for (let start = 0; start < rows.length; start += INSERT_BATCH_SIZE) {
        const batch = rows.slice(start, start + INSERT_BATCH_SIZE);
        await manager.insert(
          CheckResult,
          batch.map((row) => ({ ...row, audit: { id: auditId } })),
        );
      }

      await manager.update(Audit, auditId, {
        status: AuditStatus.COMPLETED,
        complianceScore,
        finishedAt: new Date(),
        errorMessage: null,
      });
    });
  }
}
