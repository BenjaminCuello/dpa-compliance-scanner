import { CheckSeverity, CheckStatus } from '../../audits/enums';
import { CheckCategory } from './check-definition.interface';

/** Hallazgo concreto de una regla en un archivo del proyecto. */
export interface ScanFinding {
  checkCode: string;
  ruleId: string;
  severity: CheckSeverity;
  message: string;
  /** Ruta relativa a la raíz del proyecto escaneado. */
  filePath: string;
  line: number;
  endLine: number;
}

/** Resultado de un control del catálogo tras el escaneo. */
export interface CheckEvaluation {
  code: string;
  title: string;
  category: CheckCategory;
  severity: CheckSeverity;
  status: CheckStatus;
  remediation: string;
  findings: ScanFinding[];
}

export interface ScanSummary {
  totalChecks: number;
  passedChecks: number;
  failedChecks: number;
  totalFindings: number;
  findingsBySeverity: Record<CheckSeverity, number>;
}

/** Problema que Semgrep informó sin detener el escaneo. */
export interface ScanIssue {
  level: string;
  message: string;
  filePath?: string;
}

/** Reporte completo de un escaneo, listo para persistirse o exponerse. */
export interface ScanReport {
  engine: { name: 'semgrep'; version: string };
  startedAt: string;
  finishedAt: string;
  durationMs: number;
  scannedFiles: number;
  summary: ScanSummary;
  checks: CheckEvaluation[];
  issues: ScanIssue[];
}
