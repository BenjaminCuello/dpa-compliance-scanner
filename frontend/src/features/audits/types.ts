/** Etapas de una auditoría, según el enum `AuditStatus`. */
export type AuditStatus = 'pending' | 'running' | 'completed' | 'failed';

/** Impacto de un control incumplido, según el enum `CheckSeverity`. */
export type CheckSeverity = 'low' | 'medium' | 'high' | 'critical';

/** Resultado de un control, según el enum `CheckStatus`. */
export type CheckStatus = 'passed' | 'failed' | 'skipped';

/** Proyecto auditado, según `AuditProjectDto`. */
export interface AuditProject {
  id: string;
  name: string;
  repositoryUrl: string;
}

/** Datos generales de una auditoría, según `AuditSummaryDto`. */
export interface AuditSummary {
  id: string;
  status: AuditStatus;
  /** Porcentaje de controles aprobados; `null` hasta que termina. */
  complianceScore: number | null;
  project: AuditProject;
  /** Fechas en formato ISO 8601. */
  createdAt: string;
  startedAt: string | null;
  finishedAt: string | null;
  errorMessage: string | null;
}

/** Hallazgo de un control incumplido, según `AuditFindingDto`. */
export interface AuditFinding {
  message: string;
  filePath: string | null;
  line: number | null;
}

/** Resultado de un control dentro de la auditoría, según `AuditCheckDto`. */
export interface AuditCheck {
  code: string;
  title: string;
  category?: string;
  severity: CheckSeverity;
  status: CheckStatus;
  remediation?: string;
  findings: AuditFinding[];
}

/** Totales de la auditoría, según `AuditTotalsDto`. */
export interface AuditTotals {
  totalChecks: number;
  passedChecks: number;
  failedChecks: number;
  totalFindings: number;
  findingsBySeverity: Record<CheckSeverity, number>;
}

/** Auditoría con el resultado de cada control, según `AuditDetailDto`. */
export interface AuditDetail extends AuditSummary {
  totals: AuditTotals;
  checks: AuditCheck[];
}

/** Página del historial de auditorías, según `AuditListDto`. */
export interface AuditList {
  items: AuditSummary[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Payload de `POST /audits`, según `StartAuditDto`. Se indica un repositorio
 * nuevo o un proyecto ya registrado, nunca ambos.
 */
export type StartAuditPayload =
  | { repositoryUrl: string; projectName?: string; projectId?: never }
  | { projectId: string; repositoryUrl?: never; projectName?: never };

/** Filtros y paginación de `GET /audits`, según `ListAuditsQueryDto`. */
export interface ListAuditsParams {
  projectId?: string;
  status?: AuditStatus | '';
  page?: number;
  limit?: number;
}
