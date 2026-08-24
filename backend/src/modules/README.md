# modules

Módulos de dominio. Cada uno agrupa su controlador, servicio, DTOs y pruebas, y se
importa desde `app.module.ts`.

- `health/`: endpoint de diagnóstico del servicio y sus dependencias.

Módulos previstos para las siguientes tareas:

- `projects/`: registro de proyectos o repositorios a auditar.
- `scanner/`: ejecución de los controles técnicos asociados a la Ley 21.719.
- `rules/`: catálogo de controles y su ponderación.
- `reports/`: resultados agregados que alimentan el dashboard.
