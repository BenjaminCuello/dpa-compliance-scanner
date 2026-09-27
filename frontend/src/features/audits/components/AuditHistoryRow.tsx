import { RotateCcw } from 'lucide-react';
import type { MouseEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { formatDateTime } from '../../../lib/format/date';
import type { AuditSummary } from '../types';
import { AuditStatusBadge } from './AuditStatusBadge';
import { ComplianceScore } from './ComplianceScore';

interface AuditHistoryRowProps {
  audit: AuditSummary;
  onReaudit: (projectId: string) => void;
  /** `true` mientras se re-audita el proyecto de esta fila. */
  isReauditing: boolean;
}

/**
 * Fila del historial. El acceso por teclado es el enlace del proyecto; el
 * clic en el resto de la fila es un atajo para el mouse.
 */
export function AuditHistoryRow({
  audit,
  onReaudit,
  isReauditing,
}: AuditHistoryRowProps) {
  const navigate = useNavigate();
  const { project } = audit;
  const detailPath = `/auditorias/${audit.id}`;
  const isActive = audit.status === 'pending' || audit.status === 'running';

  const handleRowClick = (event: MouseEvent<HTMLTableRowElement>) => {
    if ((event.target as HTMLElement).closest('a, button')) return;
    navigate(detailPath);
  };

  return (
    <tr
      onClick={handleRowClick}
      className="cursor-pointer border-t border-border transition-colors hover:bg-bg-soft"
    >
      <td className="max-w-xs px-4 py-3">
        <Link
          to={detailPath}
          aria-label={`Ver detalle de la auditoría de ${project.name}`}
          className="block truncate text-sm font-medium text-text hover:text-accent-text focus-visible:rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          {project.name}
        </Link>
        <span
          title={project.repositoryUrl}
          className="block truncate font-mono text-xs text-text-muted"
        >
          {project.repositoryUrl}
        </span>
      </td>
      <td className="px-4 py-3">
        <AuditStatusBadge status={audit.status} />
      </td>
      <td className="px-4 py-3 text-sm">
        <ComplianceScore score={audit.complianceScore} />
      </td>
      <td className="px-4 py-3 font-mono text-xs whitespace-nowrap text-text-muted">
        {formatDateTime(audit.createdAt)}
      </td>
      <td className="px-4 py-3 text-right">
        <button
          type="button"
          onClick={() => onReaudit(project.id)}
          disabled={isActive || isReauditing}
          title={isActive ? 'La auditoría aún está en curso' : undefined}
          className="inline-flex items-center gap-1 rounded-md border border-border bg-bg px-2.5 py-1 text-xs font-medium whitespace-nowrap text-text transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RotateCcw size={12} aria-hidden="true" />
          {isReauditing ? 'Iniciando…' : 'Volver a auditar'}
        </button>
      </td>
    </tr>
  );
}
