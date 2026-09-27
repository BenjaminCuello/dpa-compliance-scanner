import { CheckCircle2, Clock, Loader2, XCircle } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Badge, type BadgeTone } from '../../../components/Badge';
import { AUDIT_STATUS_LABELS } from '../labels';
import type { AuditStatus } from '../types';

const STYLES: Record<AuditStatus, { tone: BadgeTone; icon: LucideIcon }> = {
  pending: { tone: 'muted', icon: Clock },
  running: { tone: 'accent', icon: Loader2 },
  completed: { tone: 'success', icon: CheckCircle2 },
  failed: { tone: 'critical', icon: XCircle },
};

/** Estado de una auditoría con texto, ícono y color. */
export function AuditStatusBadge({ status }: { status: AuditStatus }) {
  const { tone, icon } = STYLES[status];

  return (
    <Badge
      tone={tone}
      icon={icon}
      iconClassName={status === 'running' ? 'animate-spin' : ''}
    >
      {AUDIT_STATUS_LABELS[status]}
    </Badge>
  );
}
