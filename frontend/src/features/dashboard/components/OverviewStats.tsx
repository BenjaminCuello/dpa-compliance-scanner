import { ComplianceScore } from '../../audits/components/ComplianceScore';
import type { DashboardOverview } from '../types';
import { StatCards } from './StatCards';

/** Indicadores de la vista "Todos los proyectos". */
export function OverviewStats({ overview }: { overview: DashboardOverview }) {
  return (
    <StatCards
      items={[
        { label: 'Proyectos auditados', value: overview.projectsCount },
        { label: 'Auditorías completadas', value: overview.completedCount },
        {
          label: 'Cumplimiento promedio',
          value: <ComplianceScore score={overview.averageScore} />,
          detail: 'Último puntaje de cada proyecto',
        },
        {
          label: 'Hallazgos críticos vigentes',
          value: overview.criticalFindings,
          detail: 'En la última auditoría de cada proyecto',
        },
      ]}
    />
  );
}
