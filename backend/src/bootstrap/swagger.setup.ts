import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';

const API_DESCRIPTION = [
  'API de auditoría de controles técnicos asociados a la Ley 21.719 de protección de datos personales.',
  '',
  '## Autenticación',
  'Todos los endpoints exigen un token JWT, salvo `POST /auth/register`, `POST /auth/login` y `GET /health`.',
  'Obtén el token con `POST /auth/login` (o al registrarte), pulsa **Authorize** y pega el valor de `accessToken`.',
  'Sin token, o con uno vencido, la respuesta es 401.',
  '',
  '## Formato de los errores',
  'Todas las respuestas de error tienen la forma `{ statusCode, path, timestamp, message }`.',
  '`message` suele ser un objeto `{ message, error, statusCode }`, donde `message` es un texto o,',
  'en los errores de validación (400), la lista de mensajes por campo. En el 429 llega como texto.',
  '',
  '## Límites de peticiones',
  'Cada cliente tiene un límite global por minuto, configurable con `THROTTLE_LIMIT` y `THROTTLE_TTL`',
  '(120 peticiones cada 60 segundos por defecto). `POST /audits` admite además como máximo 5 por minuto.',
  'Al superarlo, la API responde 429.',
].join('\n');

/** Metadatos del documento OpenAPI, compartidos con las pruebas. */
export function buildSwaggerConfig(): Omit<OpenAPIObject, 'paths'> {
  return new DocumentBuilder()
    .setTitle('DPA Compliance Scanner API')
    .setDescription(API_DESCRIPTION)
    .setVersion('1.0.0')
    .addTag('Health', 'Estado del servicio y sus dependencias')
    .addTag('Autenticación', 'Registro, inicio de sesión y datos de la sesión')
    .addTag('Auditorías', 'Inicio, seguimiento e historial de auditorías')
    .addBearerAuth()
    .build();
}

/**
 * Publica la documentación OpenAPI del backend en `/{prefijo}/docs` y el
 * documento en JSON en `/{prefijo}/docs-json`.
 * @param app Instancia de la aplicación Nest ya creada.
 * @param apiPrefix Prefijo global de la API, usado para ubicar la ruta /docs.
 */
export function setupSwagger(app: INestApplication, apiPrefix: string): void {
  const document = SwaggerModule.createDocument(app, buildSwaggerConfig());
  SwaggerModule.setup(`${apiPrefix}/docs`, app, document, {
    swaggerOptions: { persistAuthorization: true },
  });
}
