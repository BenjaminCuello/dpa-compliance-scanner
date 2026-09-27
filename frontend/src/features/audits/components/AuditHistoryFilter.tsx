import { AUDIT_STATUS_LABELS } from '../labels';
import type { AuditStatus } from '../types';

const STATUSES = Object.keys(AUDIT_STATUS_LABELS) as AuditStatus[];

interface AuditHistoryFilterProps {
  value: AuditStatus | '';
  onChange: (status: AuditStatus | '') => void;
}

/** Filtro del historial por estado de la auditoría. */
export function AuditHistoryFilter({
  value,
  onChange,
}: AuditHistoryFilterProps) {
  return (
    <label className="flex items-center gap-2 text-sm font-medium text-text">
      Estado
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as AuditStatus | '')}
        className="rounded-md border border-border bg-bg px-3 py-1.5 text-sm text-text focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none"
      >
        <option value="">Todos</option>
        {STATUSES.map((status) => (
          <option key={status} value={status}>
            {AUDIT_STATUS_LABELS[status]}
          </option>
        ))}
      </select>
    </label>
  );
}
