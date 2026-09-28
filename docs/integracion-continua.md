# Integración continua

El workflow `.github/workflows/ci.yml` se ejecuta en cada push a `main` y en
cada pull request. Si algo falla, el pull request queda marcado y no debería
mergearse.

## Qué revisa

| Trabajo | Pasos |
|---------|-------|
| **Backend** | Instala dependencias, revisa estilo, compila, ejecuta las pruebas unitarias con cobertura y las de integración contra PostgreSQL. |
| **Reglas de escaneo** | Instala Semgrep y verifica cada regla contra sus casos de prueba. |
| **Imagen de Docker** | Construye la imagen de producción del backend. |
| **Frontend** | Instala dependencias, revisa estilo sin admitir advertencias, ejecuta las pruebas unitarias y genera el build de producción. |

Los cuatro corren en paralelo. Una ejecución nueva sobre la misma rama cancela
la anterior, para no acumular trabajos que ya no interesan.

## Base de datos

Las pruebas de integración necesitan PostgreSQL, así que el trabajo del backend
levanta un servicio `postgres:16-alpine` y espera a que responda antes de
empezar. La base de pruebas se crea sola en la primera ejecución.

Las credenciales de ese servicio son de usar y tirar: viven solo mientras dura
la ejecución y no dan acceso a nada. Lo mismo ocurre con la clave de firma de
tokens que se usa en las pruebas.

## Cobertura

El umbral está configurado en el bloque `jest` de `backend/package.json`: si la
cobertura baja de ese valor, el paso falla. Cada ejecución deja además:

- Un resumen con los porcentajes en la página de la ejecución.
- El reporte HTML completo como artefacto descargable (`cobertura-backend`),
  disponible durante 14 días.

## Reproducirlo en local

Los mismos pasos, en el mismo orden. Backend:

```bash
cd backend
npm ci
npm run lint:ci
npm run build
npm run test:cov
docker compose up -d db    # desde la raíz, para las pruebas de integración
npm run test:e2e
```

Frontend:

```bash
cd frontend
npm ci
npm run lint:ci
npm test
npm run build
```

En el backend, `lint:ci` se diferencia de `npm run lint` en que no corrige
nada: solo informa, que es lo que corresponde en un pipeline. En el frontend,
`lint:ci` agrega `--max-warnings 0`, así que una advertencia también hace
fallar el trabajo.

## Variables al desplegar

Las que hay que definir en el hosting están listadas en el README del backend.

## Qué no hace todavía

- No despliega: publicar la aplicación es un paso aparte.
