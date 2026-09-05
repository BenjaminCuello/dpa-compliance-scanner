# audits

Entidades del proceso de auditoría.

- `entities/audit.entity.ts`: una ejecución del escaneo sobre un proyecto. Guarda
  el estado, las marcas de inicio y término, el porcentaje de cumplimiento y, si
  falla, el motivo.
- `entities/check-result.entity.ts`: el resultado de un control individual dentro
  de una auditoría, con su código de catálogo, estado, severidad y la ubicación
  del hallazgo en el repositorio.
- `enums/`: valores admitidos para el estado de la auditoría, y para el estado y
  la severidad de cada control.

Relaciones: una auditoría pertenece a un `Project` y tiene muchos `CheckResult`.
El índice `idx_check_results_audit_status` acompaña la consulta más frecuente del
dashboard: los resultados de una auditoría agrupados por estado.
