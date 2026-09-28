/**
 * Contenedor de tabla con su propio scroll horizontal. `relative` mantiene
 * dentro del recorte los textos `sr-only` (absolutos) de las celdas.
 */
export const TABLE_WRAPPER =
  'relative overflow-x-auto rounded-md border border-border';
/** Cabecera de columna: sin mayúsculas sostenidas. */
export const TH = 'px-2 py-2 text-xs font-medium text-text-muted';
/** Celda estándar. */
export const TD = 'px-2 py-2 text-sm text-text';
/** Celda numérica alineada a la derecha. */
export const TD_NUMBER = `${TD} text-right tabular-nums`;
