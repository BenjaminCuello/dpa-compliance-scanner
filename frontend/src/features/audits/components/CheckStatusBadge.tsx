import { CheckCircle2, MinusCircle, XCircle } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Badge, type BadgeTone } from '../../../components/Badge';
import { CHECK_STATUS_LABELS } from '../labels';
import type { CheckStatus } from '../types';

const STYLES: Record<CheckStatus, { tone: BadgeTone; icon: LucideIcon }> = {
  passed: { tone: 'success', icon: CheckCircle2 },
  failed: { tone: 'critical', icon: XCircle },
  skipped: { tone: 'muted', icon: MinusCircle },
};

/** Resultado de un control con texto, ícono y color. */
export function CheckStatusBadge({ status }: { status: CheckStatus }) {
  const { tone, icon } = STYLES[status];

  return (
    <Badge tone={tone} icon={icon}>
      {CHECK_STATUS_LABELS[status]}
    </Badge>
  );
}
