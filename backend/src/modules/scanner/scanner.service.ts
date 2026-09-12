import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { mkdir, realpath, stat } from 'node:fs/promises';
import { isAbsolute, relative, sep } from 'node:path';
import { RuleCatalogService } from './catalog/rule-catalog.service';
import { InvalidScanTargetError } from './errors/scanner.errors';
import { ScanReport } from './interfaces/scan-report.interface';
import { evaluateChecks, summarize } from './report/scan-report.builder';
import { toFindings, toIssues } from './semgrep/semgrep-output.parser';
import { SemgrepRunnerService } from './semgrep/semgrep-runner.service';

/** Orquesta un escaneo completo y entrega el reporte estructurado. */
@Injectable()
export class ScannerService implements OnModuleInit {
  private readonly logger = new Logger(ScannerService.name);

  constructor(
    private readonly config: ConfigService,
    private readonly catalog: RuleCatalogService,
    private readonly runner: SemgrepRunnerService,
  ) {}

  /** Crea el directorio de trabajo si todavía no existe. */
  async onModuleInit(): Promise<void> {
    await mkdir(this.config.get<string>('scanner.workspaceDir', ''), {
      recursive: true,
    });
  }

  /**
   * Escanea un proyecto ubicado dentro del directorio de trabajo del escáner.
   * @param targetDir Ruta del proyecto a analizar.
   * @throws InvalidScanTargetError si la ruta no existe, no es un directorio o
   * queda fuera del directorio de trabajo.
   */
  async scan(targetDir: string): Promise<ScanReport> {
    const target = await this.resolveTarget(targetDir);
    const startedAt = new Date();

    const output = await this.runner.run(target);
    const checks = evaluateChecks(
      this.catalog.getChecks(),
      toFindings(output, target),
    );
    const finishedAt = new Date();

    this.logger.log(
      `Escaneo completado en ${finishedAt.getTime() - startedAt.getTime()} ms`,
    );

    return {
      engine: { name: 'semgrep', version: output.version },
      startedAt: startedAt.toISOString(),
      finishedAt: finishedAt.toISOString(),
      durationMs: finishedAt.getTime() - startedAt.getTime(),
      scannedFiles: output.paths?.scanned?.length ?? 0,
      summary: summarize(checks),
      checks,
      issues: toIssues(output, target),
    };
  }

  /**
   * Resuelve enlaces simbólicos y verifica que el destino quede dentro del
   * directorio de trabajo, para que nunca se analicen rutas arbitrarias del
   * servidor.
   */
  private async resolveTarget(targetDir: string): Promise<string> {
    if (!targetDir || !isAbsolute(targetDir)) {
      throw new InvalidScanTargetError('La ruta a escanear debe ser absoluta');
    }

    const workspace = this.config.get<string>('scanner.workspaceDir', '');
    let target: string;
    let root: string;

    try {
      [target, root] = await Promise.all([
        realpath(targetDir),
        realpath(workspace),
      ]);
    } catch {
      throw new InvalidScanTargetError('La ruta a escanear no existe');
    }

    const fromRoot = relative(root, target);

    if (
      !fromRoot ||
      fromRoot.startsWith('..') ||
      fromRoot.startsWith(sep) ||
      isAbsolute(fromRoot)
    ) {
      throw new InvalidScanTargetError(
        'La ruta a escanear debe ubicarse dentro del directorio de trabajo',
      );
    }

    if (!(await stat(target)).isDirectory()) {
      throw new InvalidScanTargetError(
        'La ruta a escanear debe ser un directorio',
      );
    }

    return target;
  }
}
