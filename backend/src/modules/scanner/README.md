# scanner

Ejecuta Semgrep sobre un proyecto y convierte su salida en un reporte
estructurado de controles aprobados y fallidos.

No expone endpoints: lo consume el módulo de auditorías, que decide qué
proyecto escanear y persiste el resultado.

## Flujo

1. `ScannerService.scan(ruta)` valida que la ruta sea absoluta, exista, sea un
   directorio y quede dentro de `SCANNER_WORKSPACE_DIR`. Los enlaces simbólicos
   se resuelven antes de comparar, así que no sirven para salir de ahí.
2. `SemgrepRunnerService` ejecuta `semgrep scan --json` con `execFile`, sin shell,
   con tiempo máximo y excluyendo dependencias y artefactos de compilación.
3. `semgrep-output.parser` valida el JSON y lo traduce a hallazgos.
4. `scan-report.builder` cruza los hallazgos con el catálogo: un control falla si
   alguna de sus reglas encontró algo.

## Archivos

| Archivo | Responsabilidad |
|---------|-----------------|
| `scanner.service.ts` | Orquesta el escaneo y valida la ruta objetivo. |
| `semgrep/semgrep-runner.service.ts` | Proceso hijo de Semgrep y manejo de sus fallos. |
| `semgrep/semgrep-output.parser.ts` | Validación y traducción de la salida. |
| `catalog/rule-catalog.service.ts` | Lee las reglas YAML y arma el catálogo de controles. |
| `report/scan-report.builder.ts` | Estado de cada control y totales del reporte. |
| `interfaces/` | Forma del catálogo y del reporte. |
| `errors/scanner.errors.ts` | Errores propios del escáner. |

## Reporte

```json
{
  "engine": { "name": "semgrep", "version": "1.176.1" },
  "startedAt": "2026-09-12T22:59:30.120Z",
  "finishedAt": "2026-09-12T22:59:30.827Z",
  "durationMs": 707,
  "scannedFiles": 5,
  "summary": {
    "totalChecks": 9, "passedChecks": 3, "failedChecks": 6, "totalFindings": 6,
    "findingsBySeverity": { "low": 0, "medium": 2, "high": 3, "critical": 1 }
  },
  "checks": [
    {
      "code": "DPA-SEC-004",
      "title": "Credenciales de base de datos en cadenas de conexión",
      "category": "secrets",
      "severity": "high",
      "status": "failed",
      "remediation": "Construir la cadena de conexión a partir de variables de entorno...",
      "findings": [
        {
          "checkCode": "DPA-SEC-004",
          "ruleId": "dpa-connection-string-credentials",
          "severity": "high",
          "message": "Una cadena de conexión incluye usuario y contraseña de una base de datos.",
          "filePath": ".env.production",
          "line": 1,
          "endLine": 1
        }
      ]
    }
  ],
  "issues": []
}
```

`checks` incluye todos los controles del catálogo, también los aprobados, para
que el resultado refleje qué se evaluó y no solo qué falló. Los estados y
severidades usan los mismos enums que la entidad `CheckResult`.

## Decisiones

- **El reporte nunca incluye el código afectado.** Semgrep entrega la línea en
  `extra.lines`, que en un hallazgo de secretos contiene la credencial expuesta.
  Solo se conservan el archivo y la línea.
- **Las rutas son relativas al proyecto.** Si alguna quedara fuera de él, se
  guarda solo el nombre del archivo para no revelar rutas del servidor.
- **Un código de salida distinto de cero no es siempre un fallo.** Semgrep puede
  terminar así y aun entregar resultados; solo se descarta el escaneo si no hay
  salida interpretable.
- **El catálogo se valida al iniciar la aplicación.** Una regla sin metadata
  impide arrancar, en lugar de producir auditorías incompletas.
