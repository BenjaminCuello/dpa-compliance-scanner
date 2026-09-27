import { AlertCircle, AlertTriangle, Info, ShieldAlert } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Badge } from '../../../components/Badge';
import { CHECK_SEVERITY_LABELS } from '../labels';
import type { CheckSeverity } from '../types';

/** Colores de los tokens `severity-*` de `src/index.css`. */
const STYLES: Record<CheckSeverity, { color: string; icon: LucideIcon }> = {
  critical: {
    color:
      'border-severity-critical/30 bg-severity-critical/10 text-severity-critical',
    icon: ShieldAlert,
  },
  high: {
    color: 'border-severity-high/30 bg-severity-high/10 text-severity-high',
    icon: AlertTriangle,
  },
  medium: {
    color:
      'border-severity-medium/30 bg-severity-medium/10 text-severity-medium',
    icon: AlertCircle,
  },
  low: {
    color: 'border-severity-low/30 bg-severity-low/10 text-severity-low',
    icon: Info,
  },
};

/** Severidad de un control con texto, ícono y color. */
export function SeverityBadge({ severity }: { severity: CheckSeverity }) {
  const { color, icon } = STYLES[severity];

  return (
    <Badge icon={icon} colorClassName={color}>
      {CHECK_SEVERITY_LABELS[severity]}
    </Badge>
  );
}
