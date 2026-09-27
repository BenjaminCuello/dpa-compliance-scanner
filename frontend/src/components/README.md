# components

Componentes de interfaz genéricos: no conocen ningún dominio (auditorías,
autenticación) y reciben todo por props. Los componentes que usan tipos,
textos o reglas de un dominio viven en `src/features/<dominio>/components/`.

- `ThemeToggle.tsx`: botón para alternar entre modo claro y oscuro.
- `Badge.tsx`: etiqueta compacta con ícono opcional y texto. Tonos
  `success`, `warning`, `critical`, `accent` y `muted`; el texto usa las
  variantes `*-text` de `index.css` para cumplir contraste 4.5:1.
  `colorClassName` permite pasar colores propios (p. ej. severidad).
- `LoadingState.tsx`: indicador de carga con `role="status"`.
- `EmptyState.tsx`: mensaje para secciones sin contenido, con un llamado a
  la acción opcional.
- `ErrorState.tsx`: aviso de error con `role="alert"` y botón "Reintentar"
  opcional.
- `Pagination.tsx`: botones "Anterior" y "Siguiente" e indicador
  "Página X de Y".

## Decisión de diseño

El color nunca es la única señal: `Badge` siempre muestra texto y, cuando
ayuda, un ícono de `lucide-react`. Los colores salen solo de los tokens de
`src/index.css`.
