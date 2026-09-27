import type { ChartColors } from '../types';

/** Grosor máximo de una barra, en px. */
export const BAR_SIZE = 24;
/** Alto de cada fila de un gráfico de barras: la barra más aire. */
export const ROW_HEIGHT = 36;
/** Alto del eje X, incluido en el alto del contenedor. */
export const X_AXIS_HEIGHT = 28;
/** Alto del gráfico de evolución. */
export const LINE_CHART_HEIGHT = 240;
/** Extremo redondeado de 4 px en el final de una barra horizontal. */
export const BAR_RADIUS: [number, number, number, number] = [0, 4, 4, 0];
/** Marcas del eje de porcentaje. */
export const PERCENT_TICKS = [0, 20, 40, 60, 80, 100];

/** Alto total de un gráfico de barras horizontales, ejes incluidos. */
export function barChartHeight(rows: number, marginTop = 8): number {
  return rows * ROW_HEIGHT + X_AXIS_HEIGHT + marginTop;
}

/** Marca de eje con el porcentaje sin decimales, p. ej. `80%`. */
export function percentTick(value: number): string {
  return `${value}%`;
}

/** Ejes con línea sólida de 1 px en `border` y texto en `text-muted`. */
export function axisProps(colors: ChartColors) {
  return {
    stroke: colors.border,
    axisLine: { stroke: colors.border, strokeWidth: 1 },
    tickLine: { stroke: colors.border, strokeWidth: 1 },
    tick: { fill: colors.textMuted, fontSize: 12 },
  };
}

/** Grilla sólida de 1 px en `border`, nunca punteada. */
export function gridProps(colors: ChartColors) {
  return { stroke: colors.border, strokeWidth: 1 };
}

/** Línea de referencia del umbral "Bueno". */
export function referenceProps(colors: ChartColors) {
  return { stroke: colors.textMuted, strokeWidth: 1 };
}

/**
 * Contenedor de un gráfico: cifras alineadas y el anillo de foco del sistema
 * de diseño en el SVG, que Recharts hace enfocable para leerlo con el teclado.
 */
export const CHART_WRAPPER =
  'tabular-nums [&_.recharts-surface]:outline-none [&_.recharts-surface:focus-visible]:outline-2 [&_.recharts-surface:focus-visible]:outline-solid [&_.recharts-surface:focus-visible]:outline-offset-2 [&_.recharts-surface:focus-visible]:outline-accent';
