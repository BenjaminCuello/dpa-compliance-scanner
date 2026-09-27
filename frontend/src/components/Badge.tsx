import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

export type BadgeTone = 'success' | 'warning' | 'critical' | 'accent' | 'muted';

/** Clases por tono: el texto usa las variantes `*-text` por contraste. */
const TONE_CLASSES: Record<BadgeTone, string> = {
  success: 'border-success/30 bg-success/10 text-success-text',
  warning: 'border-warning/30 bg-warning/10 text-warning-text',
  critical: 'border-critical/30 bg-critical/10 text-critical-text',
  accent: 'border-accent/30 bg-accent/10 text-accent-text',
  muted: 'border-border bg-bg-soft text-text',
};

interface BadgeProps {
  children: ReactNode;
  tone?: BadgeTone;
  icon?: LucideIcon;
  /** Clases extra, p. ej. el ícono animado o un color propio del dominio. */
  iconClassName?: string;
  /** Reemplaza las clases de color del tono. */
  colorClassName?: string;
}

/** Etiqueta compacta de estado: siempre lleva texto, el color no basta. */
export function Badge({
  children,
  tone = 'muted',
  icon: Icon,
  iconClassName = '',
  colorClassName,
}: BadgeProps) {
  const iconTone = tone === 'muted' && !colorClassName ? 'text-text-muted' : '';

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap ${
        colorClassName ?? TONE_CLASSES[tone]
      }`}
    >
      {Icon && (
        <Icon
          size={12}
          aria-hidden="true"
          className={`${iconTone} ${iconClassName}`.trim() || undefined}
        />
      )}
      {children}
    </span>
  );
}
