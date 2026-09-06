# src

Código fuente de la aplicación React.

- `App.tsx`: componente raíz, define el `BrowserRouter` y los providers
  globales.
- `main.tsx`: punto de entrada que monta la aplicación en el DOM.
- `index.css`: importa Tailwind CSS y define estilos base.
- `features/`: lógica de negocio agrupada por dominio (por ahora, `auth`).
- `layouts/`: estructuras de página compartidas por las vistas autenticadas.
- `lib/`: utilidades técnicas transversales, como el cliente HTTP
  (`lib/http/`).
- `pages/`: componentes de página, uno por ruta.
- `routes/`: definición de rutas y guardas de rutas privadas.
- `test/`: configuración compartida para las pruebas con Vitest.
