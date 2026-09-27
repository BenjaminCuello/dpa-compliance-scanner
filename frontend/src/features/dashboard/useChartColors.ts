import { useEffect, useState } from 'react';
import type { ChartColors } from './types';

function readColors(): ChartColors {
  const style = getComputedStyle(document.documentElement);
  const read = (name: string) => style.getPropertyValue(name).trim();

  return {
    primary: read('--color-chart-primary'),
    severity: {
      low: read('--color-chart-severity-low'),
      medium: read('--color-chart-severity-medium'),
      high: read('--color-chart-severity-high'),
      critical: read('--color-chart-severity-critical'),
    },
    bg: read('--color-bg'),
    border: read('--color-border'),
    text: read('--color-text'),
    textMuted: read('--color-text-muted'),
  };
}

/**
 * Colores de los gráficos resueltos desde los tokens de `index.css`, porque
 * Recharts necesita valores y no clases. Se vuelven a leer cuando cambia la
 * clase de `<html>` (el tema oscuro agrega `dark`), sin depender del orden en
 * que React ejecuta los efectos del `ThemeProvider`.
 */
export function useChartColors(): ChartColors {
  const [colors, setColors] = useState(readColors);

  useEffect(() => {
    const observer = new MutationObserver(() => setColors(readColors()));
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    return () => observer.disconnect();
  }, []);

  return colors;
}
