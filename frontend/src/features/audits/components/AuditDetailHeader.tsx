import { ExternalLink } from 'lucide-react';
import { formatDateTime } from '../../../lib/format/date';
import type { AuditSummary } from '../types';
import { AuditStatusBadge } from './AuditStatusBadge';
import { ComplianceScore } from './ComplianceScore';
import { ReauditButton } from './ReauditButton';

interface AuditDetailHeaderProps {
  audit: AuditSummary;
}

/**
 * Encabezado del detalle: proyecto, repositorio, estado, puntaje y fechas.
 * Una auditoría terminada (completada o fallida) se puede volver a auditar.
 */
export function AuditDetailHeader({ audit }: AuditDetailHeaderProps) {
  const { project } = audit;
  const isFinished = audit.status === 'completed' || audit.status === 'failed';

  const dates = [
    { label: 'Inicio', value: audit.startedAt },
    { label: 'Término', value: audit.finishedAt },
  ];

  return (
    <header className="space-y-4 rounded-md border border-border bg-bg p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-semibold break-words text-text">
              {project.name}
            </h1>
            <AuditStatusBadge status={audit.status} />
          </div>
          <a
            href={project.repositoryUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex max-w-full items-center gap-1 font-mono text-xs text-accent-text hover:underline"
          >
            <span className="truncate">{project.repositoryUrl}</span>
            <ExternalLink size={12} aria-hidden="true" className="shrink-0" />
            <span className="sr-only">(se abre en una pestaña nueva)</span>
          </a>
        </div>
        {isFinished && <ReauditButton projectId={project.id} />}
      </div>

      <dl className="grid grid-cols-2 gap-4 border-t border-border pt-4 sm:grid-cols-3">
        <div>
          <dt className="text-xs text-text-muted">Puntaje de cumplimiento</dt>
          <dd className="mt-1 text-lg">
            <ComplianceScore score={audit.complianceScore} />
          </dd>
        </div>
        {dates.map(({ label, value }) => (
          <div key={label}>
            <dt className="text-xs text-text-muted">{label}</dt>
            <dd className="mt-1 font-mono text-sm text-text">
              {formatDateTime(value)}
            </dd>
          </div>
        ))}
      </dl>
    </header>
  );
}
