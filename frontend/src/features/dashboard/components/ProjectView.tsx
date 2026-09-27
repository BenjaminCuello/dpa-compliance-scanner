import { useMemo } from 'react';
import type { AuditDetail, AuditSummary } from '../../audits/types';
import {
  computeProjectOverview,
  findingsBySeverity,
  latestCompletedByProject,
  scoreTrend,
  topFailedControls,
} from '../aggregations';
import { recentAudits } from '../projects';
import { PENDING_CHART_MESSAGE } from './AllProjectsView';
import { FailedControlsTable } from './FailedControlsTable';
import { ProjectStats } from './ProjectStats';
import { RecentAudits } from './RecentAudits';
import { ScoreTrendCard } from './ScoreTrendCard';
import { SeverityCard } from './SeverityCard';

const MISSING_DETAIL_MESSAGE =
  'No se pudo cargar el detalle de la última auditoría.';

interface ProjectViewProps {
  projectId: string;
  summaries: AuditSummary[];
  latestDetails: AuditDetail[];
}

/** Vista de un proyecto: su evolución y el resultado de su última auditoría. */
export function ProjectView({
  projectId,
  summaries,
  latestDetails,
}: ProjectViewProps) {
  const view = useMemo(() => {
    const own = summaries.filter((audit) => audit.project.id === projectId);
    const [last] = latestCompletedByProject(own);
    const detail = latestDetails.find((item) => item.id === last?.id) ?? null;
    const missing = last && !detail ? MISSING_DETAIL_MESSAGE : null;

    return {
      overview: computeProjectOverview(own, detail),
      lastAuditId: last?.id ?? own[0]?.id ?? null,
      trend: scoreTrend(own, projectId),
      severity: detail ? findingsBySeverity([detail]) : [],
      controls: detail ? topFailedControls([detail], Infinity) : [],
      recent: recentAudits(own),
      pending: last ? null : PENDING_CHART_MESSAGE,
      detailMessage: last ? missing : PENDING_CHART_MESSAGE,
    };
  }, [projectId, summaries, latestDetails]);

  return (
    <>
      <ProjectStats overview={view.overview} lastAuditId={view.lastAuditId} />
      <div className="grid gap-6 lg:grid-cols-2">
        <ScoreTrendCard points={view.trend} emptyMessage={view.pending} />
        <SeverityCard
          title="Hallazgos por severidad en la última auditoría"
          counts={view.severity}
          emptyMessage={view.detailMessage}
        />
      </div>
      <FailedControlsTable
        title="Controles incumplidos en la última auditoría"
        controls={view.controls}
        emptyMessage={
          view.detailMessage ??
          'La última auditoría no tiene controles incumplidos.'
        }
      />
      <RecentAudits audits={view.recent} />
    </>
  );
}
