/** Texto para fechas ausentes o inválidas. */
export const EMPTY_DATE = '—';

const dateFormatter = new Intl.DateTimeFormat('es-CL', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

const dateTimeFormatter = new Intl.DateTimeFormat('es-CL', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

type DateInput = string | Date | null | undefined;

function toDate(value: DateInput): Date | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** Fecha corta en la zona horaria del navegador, p. ej. `27-09-2026`. */
export function formatDate(value: DateInput): string {
  const date = toDate(value);
  return date ? dateFormatter.format(date) : EMPTY_DATE;
}

/** Fecha y hora cortas, p. ej. `27-09-2026, 14:05`. */
export function formatDateTime(value: DateInput): string {
  const date = toDate(value);
  return date ? dateTimeFormatter.format(date) : EMPTY_DATE;
}
