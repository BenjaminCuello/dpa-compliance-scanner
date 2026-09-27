import { CHECK_SEVERITY_LABELS } from '../../audits/labels';
import type { SeverityCount } from '../types';
import { ChartCard } from './ChartCard';
import { ChartTable } from './ChartTable';
import { SeverityChart } from './SeverityChart';

interface SeverityCardProps {
  title?: string;
  counts: SeverityCount[];
  emptyMessage?: string | null;
}

/** Hallazgos por severidad, con gráfico y tabla equivalente. */
export function SeverityCard({
  title = 'Hallazgos por severidad',
  counts,
  emptyMessage,
}: SeverityCardProps) {
  return (
    <ChartCard
      title={title}
      emptyMessage={emptyMessage}
      chart={<SeverityChart counts={counts} />}
      table={
        <ChartTable
          caption="Hallazgos por severidad, de crítica a baja"
          headers={['Severidad', 'Hallazgos']}
          rows={counts.map(({ severity, count }) => ({
            key: severity,
            label: CHECK_SEVERITY_LABELS[severity],
            value: count,
          }))}
        />
      }
    />
  );
}
