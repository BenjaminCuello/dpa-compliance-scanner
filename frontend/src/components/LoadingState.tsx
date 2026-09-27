import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
}

/** Indicador de carga para secciones que esperan datos del backend. */
export function LoadingState({ message = 'Cargando…' }: LoadingStateProps) {
  return (
    <div
      role="status"
      className="flex items-center justify-center gap-2 py-12 text-sm text-text-muted"
    >
      <Loader2 size={16} aria-hidden="true" className="animate-spin" />
      {message}
    </div>
  );
}
