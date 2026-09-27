import { useMemo } from 'react';
import type { AuditDetail, AuditSummary } from '../../audits/types';
import {
  computeOverview,
  findingsBySeverity,
  latestCompletedByProject,
  projectScores,
  topFailedControls,
} from '../aggregations';
import { recentAudits } from '../projects';
import { FailedControlsTable } from './FailedControlsTable';
import { OverviewStats } from './OverviewStats';
import { ProjectScoresCard } from './ProjectScoresCard';
import { RecentAudits } from './RecentAudits';
import { SeverityCard } from './SeverityCard';

/** Texto de los gráficos mientras no hay auditorías completadas. */
export const PENDING_CHART_MESSAGE =
  'El gráfico aparecerá cuando termine la primera auditoría.';

interface AllProjectsViewProps {
  summaries: AuditSummary[];
  latestDetails: AuditDetail[];
  onSelectProject: (projectId: string) => void;
}

/** Vista "Todos los proyectos" del panel. */
export function AllProjectsView({
  summaries,
  latestDetails,
  onSelectProject,
}: AllProjectsViewProps) {
  const view = useMemo(() => {
    const latest = latestCompletedByProject(summaries);
    return {
      overview: computeOverview(summaries, latestDetails),
      scores: projectScores(latest),
      severity: findingsBySeverity(latestDetails),
      controls: topFailedControls(latestDetails),
      recent: recentAudits(summaries),
      pending: latest.length === 0 ? PENDING_CHART_MESSAGE : null,
    };
  }, [summaries, latestDetails]);

  return (
    <>
      <OverviewStats overview={view.overview} />
      <div className="grid gap-6 lg:grid-cols-2">
        <ProjectScoresCard
          scores={view.scores}
          onSelectProject={onSelectProject}
          emptyMessage={view.pending}
        />
        <SeverityCard counts={view.severity} emptyMessage={view.pending} />
      </div>
      <FailedControlsTable
        title="Controles más incumplidos"
        controls={view.controls}
        showProjects
        emptyMessage={
          view.pending
            ? 'Los controles aparecerán cuando termine la primera auditoría.'
            : 'No hay controles incumplidos en las últimas auditorías.'
        }
      />
      <RecentAudits audits={view.recent} />
    </>
  );
}
