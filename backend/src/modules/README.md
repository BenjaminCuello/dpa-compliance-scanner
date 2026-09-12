# modules

Módulos de dominio. Cada uno agrupa su controlador, servicio, DTOs y pruebas, y se
importa desde `app.module.ts`.

- `health/`: endpoint de diagnóstico del servicio y sus dependencias.
- `auth/`: registro, inicio de sesión y protección de los endpoints.
- `users/`: entidad de usuario y acceso a los datos de las cuentas.
- `projects/`: proyectos o repositorios a auditar.
- `audits/`: inicio, ejecución e historial de auditorías, y sus resultados.
- `scanner/`: ejecución de Semgrep y armado del reporte de controles.

