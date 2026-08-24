import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { setupSwagger } from './bootstrap/swagger.setup';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const config = app.get(ConfigService);

  const apiPrefix = config.get<string>('app.apiPrefix', 'api');
  const port = config.get<number>('app.port', 3000);

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

  setupSwagger(app, apiPrefix);

  await app.listen(port, '0.0.0.0');
  Logger.log(
    `Backend disponible en http://localhost:${port}/${apiPrefix}`,
    'Bootstrap',
  );
}

void bootstrap();
