import { describe, expect, it } from 'vitest';
import { formatDate, formatDateTime } from './date';

describe('formato de fechas', () => {
  it('muestra un guion largo cuando no hay fecha', () => {
    expect(formatDate(null)).toBe('—');
    expect(formatDateTime(null)).toBe('—');
    expect(formatDateTime('no-es-fecha')).toBe('—');
  });

  it('formatea una fecha conocida en es-CL', () => {
    const date = new Date(2026, 8, 27, 14, 5);

    expect(formatDate(date)).toBe('27-09-2026');
    expect(formatDateTime(date)).toBe('27-09-2026, 14:05');
  });
});
