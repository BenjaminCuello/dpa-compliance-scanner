import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { configureApp } from './bootstrap/app.setup';
import { setupSwagger } from './bootstrap/swagger.setup';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
  });

  const apiPrefix = configureApp(app);
  const port = app.get(ConfigService).get<number>('app.port', 3000);

  setupSwagger(app, apiPrefix);

  await app.listen(port, '0.0.0.0');
  Logger.log(
    `Backend disponible en http://localhost:${port}/${apiPrefix}`,
    'Bootstrap',
  );
}

void bootstrap();
