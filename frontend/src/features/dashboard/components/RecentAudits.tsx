import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDate } from '../../../lib/format/date';
import { AuditStatusBadge } from '../../audits/components/AuditStatusBadge';
import { ComplianceScore } from '../../audits/components/ComplianceScore';
import type { AuditSummary } from '../../audits/types';
import { DashboardCard } from './DashboardCard';

const linkClasses =
  'hover:text-accent-text focus-visible:rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent';

/** Últimas auditorías con enlace al detalle y al historial completo. */
export function RecentAudits({ audits }: { audits: AuditSummary[] }) {
  return (
    <DashboardCard
      title="Auditorías recientes"
      actions={
        <Link
          to="/auditorias"
          className={`inline-flex items-center gap-1 text-sm text-accent-text ${linkClasses}`}
        >
          Ver historial completo
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
      }
    >
      <ul className="divide-y divide-border">
        {audits.map((audit) => (
          <li
            key={audit.id}
            className="flex flex-wrap items-center gap-x-4 gap-y-1 py-2"
          >
            <Link
              to={`/auditorias/${audit.id}`}
              aria-label={`Ver detalle de la auditoría de ${audit.project.name}`}
              title={audit.project.name}
              className={`min-w-0 flex-1 truncate text-sm font-medium text-text ${linkClasses}`}
            >
              {audit.project.name}
            </Link>
            <AuditStatusBadge status={audit.status} />
            <ComplianceScore
              score={audit.complianceScore}
              className="w-16 text-right text-sm"
            />
            <span className="font-mono text-xs whitespace-nowrap text-text-muted">
              {formatDate(audit.createdAt)}
            </span>
          </li>
        ))}
      </ul>
    </DashboardCard>
  );
}
