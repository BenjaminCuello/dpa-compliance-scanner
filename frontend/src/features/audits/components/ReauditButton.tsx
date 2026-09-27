import { RotateCcw } from 'lucide-react';
import { ErrorState } from '../../../components/ErrorState';
import { useStartAudit } from '../useStartAudit';

interface ReauditButtonProps {
  projectId: string;
}

/**
 * Inicia una nueva auditoría del proyecto y navega a su detalle. Los errores
 * del backend (p. ej. un 409 por auditoría en curso) aparecen bajo el botón.
 */
export function ReauditButton({ projectId }: ReauditButtonProps) {
  const { start, isSubmitting, error } = useStartAudit();

  return (
    <div className="flex flex-col items-start gap-2 sm:items-end">
      <button
        type="button"
        onClick={() => void start({ projectId })}
        disabled={isSubmitting}
        className="inline-flex items-center gap-2 rounded bg-accent-strong px-4 py-2 text-sm font-medium whitespace-nowrap text-white hover:bg-accent-strong-hover disabled:opacity-60"
      >
        <RotateCcw size={16} aria-hidden="true" />
        {isSubmitting ? 'Iniciando…' : 'Volver a auditar'}
      </button>
      {error && <ErrorState message={error} />}
    </div>
  );
}
