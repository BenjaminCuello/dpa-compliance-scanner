/** Texto para porcentajes ausentes. */
export const EMPTY_PERCENT = '—';

const percentFormatter = new Intl.NumberFormat('es-CL', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

/** Porcentaje con un decimal, p. ej. `85,5%`; `—` si no hay valor. */
export function formatPercent(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return EMPTY_PERCENT;
  }

  return `${percentFormatter.format(value)}%`;
}

const deltaFormatter = new Intl.NumberFormat('es-CL', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
  signDisplay: 'exceptZero',
});

/** Variación en puntos porcentuales con signo, p. ej. `+4,5 pts`. */
export function formatScoreDelta(value: number): string {
  return `${deltaFormatter.format(value)} pts`;
}
