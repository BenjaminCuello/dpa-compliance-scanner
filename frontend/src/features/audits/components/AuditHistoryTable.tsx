import { useState } from 'react';
import { ErrorState } from '../../../components/ErrorState';
import type { AuditSummary } from '../types';
import { useStartAudit } from '../useStartAudit';
import { AuditHistoryRow } from './AuditHistoryRow';

const COLUMNS = ['Proyecto', 'Estado', 'Puntaje', 'Creada', 'Acciones'];

interface AuditHistoryTableProps {
  audits: AuditSummary[];
  /** Atenúa la tabla mientras se carga otra página o filtro. */
  isRefreshing?: boolean;
}

/** Tabla del historial con la acción "Volver a auditar" por fila. */
export function AuditHistoryTable({
  audits,
  isRefreshing = false,
}: AuditHistoryTableProps) {
  const { start, isSubmitting, error } = useStartAudit();
  const [reauditingId, setReauditingId] = useState<string | null>(null);

  const handleReaudit = (projectId: string) => {
    setReauditingId(projectId);
    void start({ projectId });
  };

  return (
    <div className="space-y-3">
      {error && <ErrorState message={error} />}

      <div
        aria-busy={isRefreshing}
        className={`relative overflow-x-auto rounded-md border border-border transition-opacity ${
          isRefreshing ? 'opacity-60' : ''
        }`}
      >
        <table className="w-full min-w-[720px] text-left">
          <thead className="bg-bg-soft">
            <tr>
              {COLUMNS.map((column) => (
                <th
                  key={column}
                  scope="col"
                  className="px-4 py-2 text-xs font-semibold tracking-wide text-text uppercase last:text-right"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {audits.map((audit) => (
              <AuditHistoryRow
                key={audit.id}
                audit={audit}
                onReaudit={handleReaudit}
                isReauditing={isSubmitting && reauditingId === audit.project.id}
                isReauditLocked={isSubmitting}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
