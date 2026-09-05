# src

Código fuente del backend. La organización sigue una arquitectura por capas:

| Carpeta      | Responsabilidad |
|--------------|-----------------|
| `config/`    | Carga y validación de variables de entorno. |
| `database/`  | Conexión a PostgreSQL, migraciones y convención de nombres. |
| `common/`    | Piezas transversales reutilizables (filtros, interceptores). |
| `bootstrap/` | Configuración aplicada al arrancar la aplicación (Swagger). |
| `modules/`   | Módulos de dominio, uno por área funcional. |

`app.module.ts` compone estas piezas y `main.ts` levanta el servidor HTTP.
