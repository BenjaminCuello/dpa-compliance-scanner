# lib/format

Utilidades de formato para mostrar datos en la interfaz.

- `date.ts`: `formatDate` (`27-09-2026`) y `formatDateTime`
  (`27-09-2026, 14:05`). Aceptan un texto ISO 8601, un `Date`, `null` o
  `undefined`; si no hay fecha o no es válida devuelven `—` (`EMPTY_DATE`).
- `number.ts`: `formatPercent` (`85,5%`), con un decimal y coma decimal;
  devuelve `—` (`EMPTY_PERCENT`) si el valor es `null` o `undefined`.

## Decisión de diseño

Se usa `Intl.DateTimeFormat` (y `Intl.NumberFormat` para números) con la configuración regional `es-CL` y la zona
horaria del navegador, sin dependencias adicionales. Los formateadores se
crean una sola vez a nivel de módulo porque construirlos es costoso y se
usan en listas.
