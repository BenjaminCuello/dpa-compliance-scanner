import { ArrowDown, ArrowRight, ArrowUp, Minus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatScoreDelta } from '../../../lib/format/number';
import { ComplianceScore } from '../../audits/components/ComplianceScore';
import type { ProjectOverview } from '../types';
import { StatCards } from './StatCards';

/** Variación respecto de la auditoría anterior, con signo e ícono. */
function ScoreDelta({ overview }: { overview: ProjectOverview }) {
  if (overview.lastScore === null) return <>Sin auditorías completadas</>;
  if (overview.scoreDelta === null) return <>Primera auditoría</>;

  const { scoreDelta } = overview;
  const Icon = scoreDelta > 0 ? ArrowUp : scoreDelta < 0 ? ArrowDown : Minus;
  const tone =
    scoreDelta > 0
      ? 'text-success-text'
      : scoreDelta < 0
        ? 'text-critical-text'
        : 'text-text-muted';

  return (
    <span className="inline-flex items-center gap-1">
      <Icon size={16} aria-hidden="true" className={tone} />
      <span className={`font-medium ${tone}`}>
        {formatScoreDelta(scoreDelta)}
      </span>{' '}
      respecto de la anterior
    </span>
  );
}

interface ProjectStatsProps {
  overview: ProjectOverview;
  /** Auditoría enlazada en "Ver última auditoría"; `null` si no hay. */
  lastAuditId: string | null;
}

/** Indicadores de la vista de un proyecto. */
export function ProjectStats({ overview, lastAuditId }: ProjectStatsProps) {
  return (
    <StatCards
      items={[
        { label: 'Auditorías realizadas', value: overview.auditsCount },
        {
          label: 'Último puntaje',
          value: <ComplianceScore score={overview.lastScore} />,
          detail: <ScoreDelta overview={overview} />,
        },
        {
          label: 'Hallazgos críticos',
          value: overview.criticalFindings ?? '—',
          detail: 'En la última auditoría completada',
        },
        {
          label: 'Detalle',
          value: lastAuditId ? (
            <Link
              to={`/auditorias/${lastAuditId}`}
              className="inline-flex items-center gap-1 text-sm font-medium text-accent-text hover:text-accent-hover focus-visible:rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              Ver última auditoría
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          ) : (
            '—'
          ),
        },
      ]}
    />
  );
}
