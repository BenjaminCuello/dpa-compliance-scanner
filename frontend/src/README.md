# src

Código fuente de la aplicación React.

- `App.tsx`: componente raíz, define el `BrowserRouter` y los providers
  globales.
- `main.tsx`: punto de entrada que monta la aplicación en el DOM.
- `index.css`: importa Tailwind CSS y define los tokens de color de ambos
  temas (ver abajo).
- `components/`: componentes de interfaz genéricos, sin lógica de dominio.
- `features/`: lógica y componentes agrupados por dominio (`auth`, `audits`,
  `theme`).
- `layouts/`: estructuras de página compartidas por las vistas autenticadas.
- `lib/`: utilidades técnicas transversales, como el cliente HTTP
  (`lib/http/`) y los formatos de fecha y número (`lib/format/`).
- `pages/`: componentes de página, uno por ruta (panel, auditorías, detalle
  de auditoría, inicio de sesión y registro).
- `routes/`: definición de rutas y guardas de rutas privadas.
- `test/`: configuración compartida para las pruebas con Vitest.

## Tokens de color (`index.css`)

Se definen en `@theme` (modo claro) y se redefinen en `:root.dark`.

- `bg`, `bg-soft`, `surface`, `border`, `text`, `text-muted`: superficies y
  texto base.
- `accent`, `success`, `warning`, `critical`: fondos, bordes, íconos,
  enlaces y anillos de foco.
- `accent-strong` y `accent-strong-hover`: fondo de los botones sólidos con
  `text-white` y su hover. Tienen el mismo valor en ambos temas (5.93:1 y
  7.56:1 con texto blanco); `bg-accent` con texto blanco no alcanza AA.
- `accent-text`, `success-text`, `warning-text`, `critical-text`: las mismas
  intenciones para texto, con contraste de al menos 4.5:1 sobre `bg` y
  `surface` en ambos temas.
- `severity-critical`, `severity-high`, `severity-medium`, `severity-low`:
  severidad de los controles, aptos para texto (4.5:1 sobre `bg` y
  `surface`). Se usan en `SeverityBadge` y en los gráficos del panel.
