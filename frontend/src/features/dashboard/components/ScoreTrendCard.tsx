import { formatDate } from '../../../lib/format/date';
import { formatPercent } from '../../../lib/format/number';
import type { ScoreTrendPoint } from '../types';
import { ChartCard } from './ChartCard';
import { ChartTable } from './ChartTable';
import { ScoreTrendChart } from './ScoreTrendChart';

interface ScoreTrendCardProps {
  points: ScoreTrendPoint[];
  emptyMessage?: string | null;
}

/** Evolución del cumplimiento de un proyecto, con gráfico y tabla. */
export function ScoreTrendCard({ points, emptyMessage }: ScoreTrendCardProps) {
  return (
    <ChartCard
      title="Evolución del cumplimiento"
      emptyMessage={emptyMessage}
      chart={
        <>
          {points.length === 1 && (
            <p className="mb-2 text-xs text-text-muted">
              Se necesitan al menos dos auditorías completadas para ver la
              evolución.
            </p>
          )}
          <ScoreTrendChart points={points} />
        </>
      }
      table={
        <ChartTable
          caption="Puntaje de cada auditoría completada, de la más antigua a la más reciente"
          headers={['Fecha', 'Puntaje']}
          rows={points.map((point) => ({
            key: point.auditId,
            label: formatDate(point.finishedAt),
            value: formatPercent(point.score),
          }))}
        />
      }
    />
  );
}
