import { AlertCircle, RotateCcw } from 'lucide-react';

interface ErrorStateProps {
  message: string;
  /** Si se indica, muestra un botón para reintentar. */
  onRetry?: () => void;
}

/** Aviso de error con reintento opcional. */
export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="flex flex-wrap items-center gap-3 rounded-md border border-critical/30 bg-critical/10 p-3 text-sm text-critical-text"
    >
      <AlertCircle size={16} aria-hidden="true" className="shrink-0" />
      <p className="flex-1">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-1 rounded border border-critical/30 px-2 py-1 text-xs font-medium hover:bg-critical/10"
        >
          <RotateCcw size={12} aria-hidden="true" />
          Reintentar
        </button>
      )}
    </div>
  );
}
