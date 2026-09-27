import { formatPercent } from '../../../lib/format/number';
import type { ProjectScore } from '../types';
import { ChartCard } from './ChartCard';
import { ChartTable } from './ChartTable';
import { ProjectScoresChart } from './ProjectScoresChart';

/** Proyectos que muestra el gráfico como máximo; la tabla los muestra todos. */
export const MAX_CHART_PROJECTS = 10;

interface ProjectScoresCardProps {
  /** Puntajes de menor a mayor. */
  scores: ProjectScore[];
  onSelectProject: (projectId: string) => void;
  emptyMessage?: string | null;
}

/** Cumplimiento por proyecto: gráfico de los 10 más bajos y tabla completa. */
export function ProjectScoresCard({
  scores,
  onSelectProject,
  emptyMessage,
}: ProjectScoresCardProps) {
  const isCapped = scores.length > MAX_CHART_PROJECTS;

  const rows = scores.map((score) => ({
    key: score.projectId,
    label: (
      <button
        type="button"
        onClick={() => onSelectProject(score.projectId)}
        title="Ver este proyecto en el panel"
        className="text-left text-sm text-text hover:text-accent-text focus-visible:rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        {score.name}
      </button>
    ),
    value: formatPercent(score.score),
  }));

  return (
    <ChartCard
      title="Cumplimiento por proyecto"
      emptyMessage={emptyMessage}
      note={
        isCapped
          ? `Se muestran los ${MAX_CHART_PROJECTS} proyectos con menor puntaje; la tabla incluye todos.`
          : null
      }
      chart={
        <ProjectScoresChart
          scores={scores.slice(0, MAX_CHART_PROJECTS)}
          onSelectProject={onSelectProject}
        />
      }
      table={
        <ChartTable
          caption="Último puntaje de cada proyecto, de menor a mayor"
          headers={['Proyecto', 'Puntaje']}
          rows={rows}
        />
      }
    />
  );
}
