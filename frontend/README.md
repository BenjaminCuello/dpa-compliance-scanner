# frontend

Aplicación web del DPA Compliance Scanner, construida con
[Vite](https://vite.dev/), React y TypeScript.

## Requisitos

- Node.js 22 o superior.

## Desarrollo local

```bash
cp .env.example .env
npm install
npm run dev
```

La app queda disponible en `http://localhost:5173`. La variable `VITE_API_URL`
del `.env` debe apuntar al backend (por defecto `http://localhost:3000/api`).

## Scripts disponibles

| Script | Descripción |
|--------|-------------|
| `npm run dev` | Levanta el servidor de desarrollo con recarga en caliente. |
| `npm run build` | Compila TypeScript y genera el build de producción en `dist/`. |
| `npm run preview` | Sirve localmente el build de producción. |
| `npm run lint` | Corre ESLint sobre todo el proyecto. |
| `npm run format` | Formatea el código con Prettier. |
| `npm test` | Corre las pruebas unitarias con Vitest. |

## Stack

- **Vite** como bundler y servidor de desarrollo.
- **React 19** + **React Router** para la interfaz y el enrutamiento.
- **Tailwind CSS v4** para los estilos.
- **Axios** para las llamadas HTTP al backend.
- **Vitest** + **Testing Library** para las pruebas unitarias.

## Estructura

```
src/
├── features/   # Lógica de negocio por dominio (ver src/README.md)
├── layouts/    # Estructuras de página compartidas (header, sidebar)
├── lib/        # Utilidades técnicas transversales (cliente HTTP, etc.)
├── pages/      # Componentes de página asociados a una ruta
├── routes/     # Definición de rutas y protección de rutas privadas
└── test/       # Configuración compartida de pruebas
```

Cada una de estas carpetas incluye su propio `README.md` con más detalle.
