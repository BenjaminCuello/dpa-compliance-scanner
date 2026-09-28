import { Info } from 'lucide-react';
import type { ReactNode } from 'react';

/** Aviso informativo (no de error), anunciado a lectores de pantalla. */
export function InfoNotice({ children }: { children: ReactNode }) {
  return (
    <p
      role="status"
      className="flex items-start gap-2 rounded-md border border-accent/30 bg-accent/10 p-2 text-sm text-accent-text"
    >
      <Info size={16} aria-hidden="true" className="mt-0.5 shrink-0" />
      <span>{children}</span>
    </p>
  );
}
