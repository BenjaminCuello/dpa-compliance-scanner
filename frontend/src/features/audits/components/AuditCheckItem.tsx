import { ChevronDown } from 'lucide-react';
import { useId, useState } from 'react';
import type { AuditCheck } from '../types';
import { CheckFindings } from './CheckFindings';
import { CheckStatusBadge } from './CheckStatusBadge';
import { SeverityBadge } from './SeverityBadge';

interface AuditCheckItemProps {
  check: AuditCheck;
}

/**
 * Control de la auditoría. Los incumplidos se expanden para mostrar la
 * remediación y los hallazgos.
 */
export function AuditCheckItem({ check }: AuditCheckItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const panelId = useId();
  const isFailed = check.status === 'failed';
  const toggleLabel = isExpanded ? 'Ocultar detalle' : 'Ver detalle';

  return (
    <li className="overflow-hidden rounded-md border border-border bg-bg">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 p-4">
        <div className="min-w-0 flex-1">
          <p className="font-mono text-xs text-text-muted">{check.code}</p>
          <p className="text-sm font-medium text-text">{check.title}</p>
          {check.category && (
            <p className="text-xs text-text-muted">{check.category}</p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <SeverityBadge severity={check.severity} />
          <CheckStatusBadge status={check.status} />
          {isFailed && (
            <button
              type="button"
              onClick={() => setIsExpanded((value) => !value)}
              aria-expanded={isExpanded}
              aria-controls={panelId}
              aria-label={`${toggleLabel} de ${check.code}`}
              className="inline-flex items-center gap-1 rounded-md border border-border bg-bg px-2.5 py-1 text-xs font-medium whitespace-nowrap text-text transition-colors hover:bg-surface"
            >
              {toggleLabel}
              <ChevronDown
                size={14}
                aria-hidden="true"
                className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              />
            </button>
          )}
        </div>
      </div>
      {isFailed && (
        <CheckFindings id={panelId} check={check} hidden={!isExpanded} />
      )}
    </li>
  );
}
