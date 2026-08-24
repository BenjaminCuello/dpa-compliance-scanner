import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

/**
 * Publica la documentación OpenAPI del backend.
 * @param app Instancia de la aplicación Nest ya creada.
 * @param apiPrefix Prefijo global de la API, usado para ubicar la ruta /docs.
 */
export function setupSwagger(app: INestApplication, apiPrefix: string): void {
  const config = new DocumentBuilder()
    .setTitle('DPA Compliance Scanner API')
    .setDescription(
      'API de auditoría de controles técnicos asociados a la Ley 21.719 de protección de datos personales.',
    )
    .setVersion('0.1.0')
    .addTag('Health', 'Estado del servicio y sus dependencias')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(`${apiPrefix}/docs`, app, document, {
    swaggerOptions: { persistAuthorization: true },
  });
}
