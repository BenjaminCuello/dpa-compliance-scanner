import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import {
  appConfig,
  authConfig,
  databaseConfig,
  envValidationSchema,
  scannerConfig,
} from './config';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { HealthModule } from './modules/health/health.module';
import { ScannerModule } from './modules/scanner/scanner.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [appConfig, authConfig, databaseConfig, scannerConfig],
      validationSchema: envValidationSchema,
      validationOptions: { abortEarly: false },
    }),
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          ttl: config.get<number>('app.throttle.ttl', 60) * 1000,
          limit: config.get<number>('app.throttle.limit', 60),
        },
      ],
    }),
    DatabaseModule,
    AuthModule,
    HealthModule,
    ScannerModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    // Exige token en toda la API; los endpoints públicos usan @Public().
    { provide: APP_GUARD, useClass: JwtAuthGuard },
  ],
})
export class AppModule {}
