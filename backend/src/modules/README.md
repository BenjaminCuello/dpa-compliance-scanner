# modules

Módulos de dominio. Cada uno agrupa su controlador, servicio, DTOs y pruebas, y se
importa desde `app.module.ts`.

- `health/`: endpoint de diagnóstico del servicio y sus dependencias.
- `auth/`: registro, inicio de sesión y protección de los endpoints.
- `users/`: entidad de usuario y acceso a los datos de las cuentas.
- `projects/`: proyectos o repositorios a auditar.
- `audits/`: auditorías y el resultado de cada control evaluado.

`projects` y `audits` contienen por ahora solo el modelo de datos; sus servicios
y endpoints se agregan en las tareas siguientes.
