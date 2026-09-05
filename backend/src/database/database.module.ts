import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { buildDataSourceOptions } from './typeorm.options';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        ...buildDataSourceOptions({
          host: config.get<string>('database.host', 'localhost'),
          port: config.get<number>('database.port', 5432),
          username: config.get<string>('database.username', ''),
          password: config.get<string>('database.password', ''),
          database: config.get<string>('database.database', ''),
          synchronize: config.get<boolean>('database.synchronize', false),
          logging: config.get<boolean>('database.logging', false),
        }),
        migrationsRun: config.get<boolean>('database.migrationsRun', false),
      }),
    }),
  ],
})
export class DatabaseModule {}
