import { SemgrepOutput } from '../../src/modules/scanner/semgrep/semgrep-output.interface';
import { SemgrepRunnerService } from '../../src/modules/scanner/semgrep/semgrep-runner.service';

/** Hallazgo listo para armar salidas de Semgrep en las pruebas. */
export interface FakeFinding {
  ruleId: string;
  code: string;
  severity: string;
  message: string;
  file: string;
  line: number;
}

const DEFAULT_FINDINGS: FakeFinding[] = [
  {
    ruleId: 'dpa-hardcoded-credential',
    code: 'DPA-SEC-001',
    severity: 'critical',
    message: 'La credencial "dbPassword" está escrita en el código.',
    file: 'src/database.ts',
    line: 12,
  },
  {
    ruleId: 'dpa-cors-any-origin',
    code: 'DPA-CFG-002',
    severity: 'medium',
    message: 'La API acepta peticiones de cualquier origen.',
    file: 'src/server.ts',
    line: 4,
  },
];

function toResult(finding: FakeFinding, targetDir: string) {
  return {
    check_id: `semgrep.rules.${finding.ruleId}`,
    path: `${targetDir}/${finding.file}`,
    start: { line: finding.line, col: 1 },
    end: { line: finding.line, col: 40 },
    extra: {
      message: finding.message,
      severity: 'ERROR',
      metadata: { 'dpa-code': finding.code, 'dpa-severity': finding.severity },
      lines: 'const dbPassword = "no-debe-guardarse";',
    },
  };
}

/**
 * Reemplaza la ejecución real de Semgrep. Evita depender del binario y permite
 * decidir qué encuentra cada escaneo.
 */
export class FakeSemgrepRunner implements Pick<SemgrepRunnerService, 'run'> {
  private findings: FakeFinding[] = DEFAULT_FINDINGS;
  private failure: Error | null = null;
  private delayMs = 0;

  /** Define los hallazgos del próximo escaneo. */
  returns(findings: FakeFinding[]): void {
    this.findings = findings;
    this.failure = null;
  }

  /** Hace fallar el próximo escaneo con el error indicado. */
  fails(error: Error): void {
    this.failure = error;
  }

  /** Demora el escaneo, para observar una auditoría mientras está en curso. */
  takes(milliseconds: number): void {
    this.delayMs = milliseconds;
  }

  async run(targetDir: string): Promise<SemgrepOutput> {
    if (this.delayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, this.delayMs));
    }

    if (this.failure) {
      const error = this.failure;
      this.failure = null;
      throw error;
    }

    return {
      version: '1.176.1',
      results: this.findings.map((finding) => toResult(finding, targetDir)),
      errors: [],
      paths: { scanned: ['a.ts', 'b.ts', 'c.ts'] },
    };
  }
}
