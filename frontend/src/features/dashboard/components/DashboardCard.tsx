import { useId, type ReactNode } from 'react';

interface DashboardCardProps {
  title: string;
  /** Controles a la derecha del título, p. ej. un botón o un enlace. */
  actions?: ReactNode;
  children: ReactNode;
}

/** Tarjeta estándar del panel con título de sección. */
export function DashboardCard({
  title,
  actions,
  children,
}: DashboardCardProps) {
  const titleId = useId();

  return (
    <section
      aria-labelledby={titleId}
      className="min-w-0 rounded-md border border-border bg-bg p-4"
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 id={titleId} className="text-sm font-semibold text-text">
          {title}
        </h2>
        {actions}
      </div>
      {children}
    </section>
  );
}
