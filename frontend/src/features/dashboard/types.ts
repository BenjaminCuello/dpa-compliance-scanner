import type { AuditDetail, AuditSummary, CheckSeverity } from '../audits/types';

/** Indicadores generales del panel. */
export interface DashboardOverview {
  /** Proyectos distintos presentes en el historial. */
  projectsCount: number;
  /** Auditorías terminadas con éxito. */
  completedCount: number;
  /** Promedio del último puntaje de cada proyecto; `null` si no hay. */
  averageScore: number | null;
  /** Hallazgos críticos en la última auditoría de cada proyecto. */
  criticalFindings: number;
}

/** Indicadores de un proyecto. */
export interface ProjectOverview {
  auditsCount: number;
  lastScore: number | null;
  previousScore: number | null;
  /** Diferencia entre el último puntaje y el anterior; `null` sin anterior. */
  scoreDelta: number | null;
  /** `null` si no se cargó el detalle de la última auditoría. */
  criticalFindings: number | null;
}

/** Punto de la evolución del puntaje de un proyecto. */
export interface ScoreTrendPoint {
  auditId: string;
  finishedAt: string;
  score: number;
}

/** Hallazgos de una severidad. */
export interface SeverityCount {
  severity: CheckSeverity;
  count: number;
}

/** Último puntaje de un proyecto. */
export interface ProjectScore {
  projectId: string;
  name: string;
  score: number;
}

/** Control incumplido agrupado entre proyectos. */
export interface FailedControl {
  code: string;
  title: string;
  severity: CheckSeverity;
  projectsAffected: number;
  findings: number;
}

/** Datos crudos del panel, tal como los entrega `loadDashboardData`. */
export interface DashboardData {
  summaries: AuditSummary[];
  latestDetails: AuditDetail[];
  /** `true` si el historial superó el tope de páginas y quedó incompleto. */
  isTruncated: boolean;
}

/** Colores resueltos del tema actual, para pasarlos a Recharts. */
export interface ChartColors {
  primary: string;
  severity: Record<CheckSeverity, string>;
  border: string;
  text: string;
  textMuted: string;
}
