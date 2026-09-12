import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ExecFileException, execFile } from 'node:child_process';
import {
  ScanFailedError,
  ScannerUnavailableError,
} from '../errors/scanner.errors';
import { parseSemgrepOutput } from './semgrep-output.parser';
import { SemgrepOutput } from './semgrep-output.interface';

const MAX_OUTPUT_BYTES = 64 * 1024 * 1024;
const EXCLUDED_PATHS = ['node_modules', 'dist', 'build', 'coverage', '.git'];

/** Ejecuta Semgrep como proceso hijo y entrega su salida validada. */
@Injectable()
export class SemgrepRunnerService {
  private readonly logger = new Logger(SemgrepRunnerService.name);

  constructor(private readonly config: ConfigService) {}

  /**
   * Escanea un directorio con las reglas del catálogo.
   * @param targetDir Ruta absoluta y ya validada del proyecto.
   * @throws ScannerUnavailableError si el ejecutable no existe.
   * @throws ScanFailedError si el proceso falla, se excede el tiempo o la
   * salida no puede interpretarse.
   */
  run(targetDir: string): Promise<SemgrepOutput> {
    const bin = this.config.get<string>('scanner.semgrepBin', 'semgrep');
    const timeout = this.config.get<number>('scanner.timeoutMs', 300000);
    const args = this.buildArgs(targetDir);

    return new Promise((resolve, reject) => {
      // execFile no usa una shell: la ruta viaja como argumento y no puede
      // inyectar comandos.
      execFile(
        bin,
        args,
        { timeout, maxBuffer: MAX_OUTPUT_BYTES, windowsHide: true },
        (error, stdout, stderr) => {
          try {
            resolve(this.handleCompletion(error, stdout, stderr));
          } catch (failure) {
            reject(failure as Error);
          }
        },
      );
    });
  }

  private buildArgs(targetDir: string): string[] {
    const rulesDir = this.config.get<string>(
      'scanner.rulesDir',
      'semgrep/rules',
    );

    return [
      'scan',
      '--config',
      rulesDir,
      '--json',
      '--quiet',
      '--metrics=off',
      '--disable-version-check',
      ...EXCLUDED_PATHS.flatMap((path) => ['--exclude', path]),
      targetDir,
    ];
  }

  private handleCompletion(
    error: ExecFileException | null,
    stdout: string,
    stderr: string,
  ): SemgrepOutput {
    if (error?.code === 'ENOENT') {
      throw new ScannerUnavailableError();
    }

    if (error?.killed) {
      throw new ScanFailedError('El escaneo superó el tiempo máximo permitido');
    }

    // Semgrep puede terminar con código distinto de cero y aun así entregar
    // resultados parciales en JSON; solo se considera fallo si no hay salida útil.
    if (error && !stdout.trim()) {
      this.logger.error(
        `Semgrep terminó con código ${String(error.code)}: ${stderr}`,
      );
      throw new ScanFailedError('El motor de escaneo terminó con un error');
    }

    return parseSemgrepOutput(stdout);
  }
}
