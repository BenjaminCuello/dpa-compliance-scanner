import { Loader2 } from 'lucide-react';
import type { AuditStatus } from '../types';

const MESSAGES: Partial<Record<AuditStatus, string>> = {
  pending: 'La auditoría está en cola',
  running: 'Analizando el repositorio…',
};

interface AuditProgressProps {
  status: AuditStatus;
}

/**
 * Avance de una auditoría en curso. La región `aria-live` anuncia el cambio
 * de "en cola" a "analizando" sin mover el foco.
 */
export function AuditProgress({ status }: AuditProgressProps) {
  return (
    <div
      aria-live="polite"
      className="flex items-start gap-3 rounded-md border border-accent/30 bg-accent/10 p-4"
    >
      <Loader2
        size={20}
        aria-hidden="true"
        className="mt-0.5 shrink-0 animate-spin text-accent-text"
      />
      <div>
        <p className="text-sm font-medium text-text">{MESSAGES[status]}</p>
        <p className="mt-1 text-sm text-text-muted">
          Esta página se actualiza sola cuando hay novedades.
        </p>
      </div>
    </div>
  );
}
