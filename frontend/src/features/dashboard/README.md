# features/dashboard

Panel de cumplimiento (`/dashboard`): carga, cálculos, colores de los
gráficos, filtro por proyecto y componentes visuales (en `components/`).

## De dónde salen los datos

El backend no tiene un endpoint de estadísticas: todo se calcula en el
navegador a partir de dos rutas existentes.

1. `GET /audits`, de a 100 auditorías por página (el máximo que acepta), del
   más reciente al más antiguo, hasta completar `total`.
2. `GET /audits/:id` de la última auditoría completada de cada proyecto, para
   obtener `totals` y `checks`.

### Topes

| Tope                  | Valor                                         | Constante        |
| --------------------- | --------------------------------------------- | ---------------- |
| Páginas del historial | 5 (500 auditorías)                            | `MAX_PAGES`      |
| Detalles cargados     | 20 proyectos, los auditados más recientemente | `MAX_DETAILS`    |
| Detalles en paralelo  | 4                                             | `MAX_CONCURRENT` |

El backend limita las peticiones por usuario (120 por minuto por defecto).
Con estos topes una carga completa hace como máximo 25 peticiones, lo que
deja margen para recargar el panel, y el tiempo de carga no crece con el
tamaño del historial. Si el historial supera las 500 auditorías,
`isTruncated` es `true` para que la interfaz lo avise.

Si falla el detalle de un proyecto, el panel sigue con los demás. Solo se
informa `error` cuando falla el listado.

## Archivos

- `types.ts`: formas de los datos calculados y de `ChartColors`.
- `aggregations.ts`: funciones puras, sin React ni HTTP.
  `latestCompletedByProject`, `computeOverview`, `computeProjectOverview`,
  `scoreTrend` y `projectScores`. También reexporta las de
  `failedControls.ts`. `averageScore` se calcula desde el listado para
  incluir a los proyectos cuyo detalle no se cargó.
- `failedControls.ts`: `findingsBySeverity` (en `SEVERITY_ORDER`) y
  `topFailedControls`, que agrupa controles incumplidos por `code` y los
  ordena por proyectos afectados y luego por severidad.
- `concurrency.ts`: `mapWithConcurrency`, que ejecuta tareas con un máximo
  de tareas en vuelo y no se detiene ante un rechazo.
- `loadDashboardData.ts`: recorre el historial y carga los detalles con los
  topes de arriba.
- `useDashboardData.ts`: expone `summaries`, `latestDetails`, `isLoading`,
  `error`, `reload` e `isTruncated`. Al recargar conserva los datos
  anteriores mientras llegan los nuevos e ignora respuestas tardías.
- `projects.ts`: `projectOptions` (proyectos del historial, sin repetir y
  ordenados por nombre, para el filtro) y `recentAudits` (las 5 primeras del
  listado, de todos los proyectos o de uno).
- `useProjectFilter.ts`: proyecto elegido, guardado en `?proyecto=<id>` con
  `useSearchParams` para que el botón Atrás y los enlaces conserven la
  selección. Con los datos ya cargados, un id que no existe vuelve a "Todos"
  y limpia el parámetro sin agregar una entrada al historial.
- `useChartColors.ts`: lee los tokens `--color-chart-*`, `--color-bg`,
  `--color-border`, `--color-text` y `--color-text-muted` con `getComputedStyle`, porque
  Recharts necesita valores y no clases. Los vuelve a leer cuando cambia la
  clase de `<html>` (un `MutationObserver`), en lugar de usar `useTheme`: el
  `ThemeProvider` cambia la clase `dark` en un efecto que corre después de
  los efectos de sus hijos, así que leer en el efecto del hijo tomaría los
  colores del tema anterior. `bg` se usa para el anillo de los puntos de la
  línea y para el fondo de las etiquetas de valor.
- `testFixtures.ts`: `makeSummary`, `makeDetail`, `makeDashboardState` (el
  resultado de `useDashboardData`) y `sampleDashboard` (tres proyectos de
  ejemplo) para las pruebas.
- `components/`: tarjetas, gráficos, tablas y vistas del panel. Ver su
  README.

## Vistas

- **Todos los proyectos**: indicadores, cumplimiento por proyecto (como
  máximo los 10 de menor puntaje en el gráfico; la tabla los incluye todos),
  hallazgos por severidad y controles más incumplidos (de los detalles
  cargados) y las 5 auditorías más recientes.
- **Un proyecto**: indicadores con la variación respecto de la auditoría
  anterior, evolución del puntaje, hallazgos por severidad y controles
  incumplidos de la última auditoría completada (todos, con
  `topFailedControls([detalle], Infinity)`) y sus auditorías recientes. Si
  el detalle de la última no se cargó, esas tarjetas lo avisan.

## Colores de los gráficos

Los tokens `--color-chart-*` están en `src/index.css`, en un bloque
`@theme static` para que Tailwind los emita aunque ninguna clase los use. En
modo oscuro la rampa de severidad se invierte: lo más severo es lo de más
contraste con el fondo.
