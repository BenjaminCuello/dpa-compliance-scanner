import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import { HttpExceptionFilter } from '../common/filters/http-exception.filter';
import { setupTrustedProxy } from './proxy.setup';

/**
 * Aplica la configuración común de la API: cabeceras seguras, CORS, prefijo,
 * validación de entrada y formato de errores.
 *
 * Vive aquí, y no en `main.ts`, para que las pruebas de integración levanten la
 * aplicación tal como se ejecuta en producción.
 * @param app Aplicación Nest sobre Express.
 * @returns El prefijo global aplicado a las rutas.
 */
export function configureApp(app: NestExpressApplication): string {
  const config = app.get(ConfigService);
  const apiPrefix = config.get<string>('app.apiPrefix', 'api');

  setupTrustedProxy(app, config.get<number>('app.trustProxyHops', 0));
  app.use(helmet());
  app.enableCors({
    origin: config.get<string[]>('app.corsOrigins', []),
    credentials: true,
  });
  app.setGlobalPrefix(apiPrefix);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());

  return apiPrefix;
}
