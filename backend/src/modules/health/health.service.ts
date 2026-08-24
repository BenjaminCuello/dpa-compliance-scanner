import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { HealthResponseDto } from './dto/health-response.dto';

/** Verifica la disponibilidad del backend y de sus dependencias externas. */
@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);

  private readonly version = process.env.npm_package_version ?? '0.1.0';

  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async check(): Promise<HealthResponseDto> {
    const database = await this.isDatabaseReachable();

    return {
      status: database ? 'ok' : 'degraded',
      database,
      version: this.version,
      timestamp: new Date().toISOString(),
    };
  }

  private async isDatabaseReachable(): Promise<boolean> {
    try {
      await this.dataSource.query('SELECT 1');
      return true;
    } catch (error) {
      this.logger.warn(
        `Base de datos no disponible: ${
          error instanceof Error ? error.message : 'error desconocido'
        }`,
      );
      return false;
    }
  }
}
