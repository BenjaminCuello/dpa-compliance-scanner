# features/dashboard/components

Componentes visuales del panel de cumplimiento. `pages/DashboardPage.tsx`
solo los compone; los cálculos viven en `../aggregations.ts` y
`../projects.ts`.

## Tarjetas y tablas

- `DashboardCard.tsx`: tarjeta estándar con título de sección y un espacio
  para acciones a la derecha.
- `ChartCard.tsx`: tarjeta de gráfico con el botón "Ver tabla" / "Ver
  gráfico" (`aria-pressed`), la tabla equivalente, una nota opcional bajo el
  gráfico y un mensaje que reemplaza al contenido cuando aún no hay datos.
- `ChartTable.tsx`: tabla de dos columnas equivalente a un gráfico.
- `tableStyles.ts`: clases compartidas de las tablas (sin mayúsculas
  sostenidas en la cabecera).
- `StatCards.tsx`: grilla de indicadores con el patrón de
  `AuditTotalsCards`. `OverviewStats.tsx` y `ProjectStats.tsx` la usan para
  cada vista; `ProjectStats` muestra la variación del puntaje con signo y un
  ícono de flecha, o "Primera auditoría".
- `FailedControlsTable.tsx`: controles incumplidos con código, título,
  `SeverityBadge`, proyectos afectados (solo en la vista de todos) y
  hallazgos.
- `RecentAudits.tsx`: últimas auditorías con enlace al detalle y a
  `/auditorias`.
- `ProjectFilter.tsx`: select "Proyecto" con "Todos los proyectos".

## Gráficos

- `ProjectScoresChart.tsx` / `ProjectScoresCard.tsx`: barras horizontales
  con el último puntaje de cada proyecto, de menor a mayor, eje de 0 a 100 %
  y referencia en 80 ("Bueno"). El clic en una barra (o en el nombre, en la
  tabla) elige el proyecto en el filtro.
- `SeverityChart.tsx` / `SeverityCard.tsx`: hallazgos por severidad, de
  crítica a baja, con la rampa `chart-severity-*`.
- `ScoreTrendChart.tsx` / `ScoreTrendCard.tsx`: evolución del puntaje con
  línea de 2 px y puntos de 8 px con anillo del fondo. Con una sola
  auditoría completada avisa que hacen falta dos.
- `ChartTooltip.tsx`: tooltip en español. Recharts lo muestra igual con el
  mouse que con el foco del teclado (flechas sobre el gráfico).
- `ValueLabel.tsx`: valor al final de la barra sobre un rectángulo del color
  del fondo, para que la grilla y la línea de referencia no lo atraviesen.
- `BarShape.tsx`: forma de barra propia; sin ella Recharts descarta las
  barras en 0 y su valor no se muestra.
- `chartStyles.ts`: grosor máximo de barra (24 px), alto por fila (36 px),
  alto del contenedor con los ejes incluidos, props de ejes y grilla (1 px
  sólido en `border`, texto en `text-muted`) y el anillo de foco del SVG.

Todas las series llevan `isAnimationActive={false}` y ningún gráfico tiene
leyenda: el título de la tarjeta dice qué se grafica.
