import { BarChart3, Table2 } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { DashboardCard } from './DashboardCard';

interface ChartCardProps {
  title: string;
  chart: ReactNode;
  /** Tabla equivalente con los mismos datos del gráfico. */
  table: ReactNode;
  /** Si se indica, reemplaza al gráfico y a la tabla (sin datos aún). */
  emptyMessage?: string | null;
  /** Nota bajo el gráfico; no se muestra en la vista de tabla. */
  note?: ReactNode;
}

/**
 * Tarjeta de gráfico con el botón "Ver tabla" / "Ver gráfico": el tooltip
 * ayuda, pero no es la única forma de leer un valor.
 */
export function ChartCard({
  title,
  chart,
  table,
  emptyMessage,
  note,
}: ChartCardProps) {
  const [showTable, setShowTable] = useState(false);
  const Icon = showTable ? BarChart3 : Table2;

  const toggle = emptyMessage ? null : (
    <button
      type="button"
      aria-pressed={showTable}
      onClick={() => setShowTable((value) => !value)}
      className="inline-flex items-center gap-1.5 rounded-md border border-border bg-bg px-3 py-1.5 text-sm text-text transition-colors hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    >
      <Icon size={16} aria-hidden="true" />
      {showTable ? 'Ver gráfico' : 'Ver tabla'}
    </button>
  );

  const renderContent = () => {
    if (emptyMessage) {
      return (
        <p className="py-8 text-center text-sm text-text-muted">
          {emptyMessage}
        </p>
      );
    }
    if (showTable) return table;
    return (
      <>
        {chart}
        {note && <p className="mt-2 text-xs text-text-muted">{note}</p>}
      </>
    );
  };

  return (
    <DashboardCard title={title} actions={toggle}>
      {renderContent()}
    </DashboardCard>
  );
}
