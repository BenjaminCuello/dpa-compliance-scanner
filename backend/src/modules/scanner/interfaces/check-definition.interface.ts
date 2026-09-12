import { CheckSeverity } from '../../audits/enums';

/** Categorías de controles que evalúa el escáner. */
export type CheckCategory = 'secrets' | 'configuration';

/**
 * Control técnico del catálogo. Un mismo control puede implementarse con
 * varias reglas de Semgrep, por ejemplo una por lenguaje.
 */
export interface CheckDefinition {
  code: string;
  title: string;
  category: CheckCategory;
  severity: CheckSeverity;
  remediation: string;
  /** Identificadores de las reglas de Semgrep que implementan el control. */
  ruleIds: string[];
}
