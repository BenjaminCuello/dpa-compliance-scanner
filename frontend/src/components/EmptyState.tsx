import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  /** Llamado a la acción, p. ej. un botón o enlace. */
  action?: ReactNode;
}

/** Mensaje para listas o secciones sin contenido. */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-md border border-dashed border-border px-6 py-12 text-center">
      <Icon size={24} aria-hidden="true" className="text-text-muted" />
      <p className="text-sm font-medium text-text">{title}</p>
      {description && (
        <p className="max-w-md text-sm text-text-muted">{description}</p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
