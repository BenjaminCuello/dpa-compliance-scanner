import { formatPercent } from '../../../lib/format/number';
import {
  COMPLIANCE_LEVEL_LABELS,
  classifyComplianceScore,
  type ComplianceLevel,
} from '../compliance';

const LEVEL_CLASSES: Record<ComplianceLevel, string> = {
  good: 'text-success-text',
  fair: 'text-warning-text',
  low: 'text-critical-text',
  none: 'text-text-muted',
};

interface ComplianceScoreProps {
  score: number | null;
  className?: string;
}

/**
 * Puntaje de cumplimiento con un decimal, coloreado según los umbrales de
 * `compliance.ts`. El nivel también va como texto para lectores de pantalla.
 */
export function ComplianceScore({
  score,
  className = '',
}: ComplianceScoreProps) {
  const level = classifyComplianceScore(score);
  const label = COMPLIANCE_LEVEL_LABELS[level];

  return (
    <span
      title={`Cumplimiento: ${label}`}
      className={`font-mono font-medium tabular-nums ${LEVEL_CLASSES[level]} ${className}`.trim()}
    >
      {formatPercent(score)}
      <span className="sr-only"> ({label})</span>
    </span>
  );
}
