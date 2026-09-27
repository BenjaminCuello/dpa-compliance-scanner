import { SeverityBadge } from '../../audits/components/SeverityBadge';
import type { FailedControl } from '../types';
import { DashboardCard } from './DashboardCard';
import { TABLE_WRAPPER, TD, TD_NUMBER, TH } from './tableStyles';

interface FailedControlsTableProps {
  title: string;
  controls: FailedControl[];
  /** Muestra la columna "Proyectos afectados" (vista de todos). */
  showProjects?: boolean;
  /** Texto cuando no hay controles incumplidos que mostrar. */
  emptyMessage: string;
}

/** Tabla de controles incumplidos con su severidad y hallazgos. */
export function FailedControlsTable({
  title,
  controls,
  showProjects = false,
  emptyMessage,
}: FailedControlsTableProps) {
  if (controls.length === 0) {
    return (
      <DashboardCard title={title}>
        <p className="py-6 text-center text-sm text-text-muted">
          {emptyMessage}
        </p>
      </DashboardCard>
    );
  }

  return (
    <DashboardCard title={title}>
      <div className={TABLE_WRAPPER}>
        <table className="w-full text-left">
          <thead className="bg-bg-soft">
            <tr>
              <th scope="col" className={TH}>
                Código
              </th>
              <th scope="col" className={TH}>
                Control
              </th>
              <th scope="col" className={TH}>
                Severidad
              </th>
              {showProjects && (
                <th scope="col" className={`${TH} text-right`}>
                  Proyectos afectados
                </th>
              )}
              <th scope="col" className={`${TH} text-right`}>
                Hallazgos
              </th>
            </tr>
          </thead>
          <tbody>
            {controls.map((control) => (
              <tr key={control.code} className="border-t border-border">
                <td className={`${TD} font-mono text-xs whitespace-nowrap`}>
                  {control.code}
                </td>
                <td className={TD}>{control.title}</td>
                <td className={TD}>
                  <SeverityBadge severity={control.severity} />
                </td>
                {showProjects && (
                  <td className={TD_NUMBER}>{control.projectsAffected}</td>
                )}
                <td className={TD_NUMBER}>{control.findings}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardCard>
  );
}
