import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  /** Deshabilita ambos botones, p. ej. mientras carga la página. */
  disabled?: boolean;
}

const buttonClasses =
  'inline-flex items-center gap-1 rounded-md border border-border bg-bg px-3 py-1.5 text-sm text-text transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:opacity-50';

/** Navegación entre páginas: anterior, siguiente e indicador de posición. */
export function Pagination({
  page,
  totalPages,
  onPageChange,
  disabled = false,
}: PaginationProps) {
  return (
    <nav
      aria-label="Paginación"
      className="flex items-center justify-between gap-3"
    >
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={disabled || page <= 1}
        className={buttonClasses}
      >
        <ChevronLeft size={16} aria-hidden="true" />
        Anterior
      </button>
      <span className="text-sm text-text-muted" aria-live="polite">
        Página {page} de {totalPages}
      </span>
      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={disabled || page >= totalPages}
        className={buttonClasses}
      >
        Siguiente
        <ChevronRight size={16} aria-hidden="true" />
      </button>
    </nav>
  );
}
