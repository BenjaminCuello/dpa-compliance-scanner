import { ApiProperty } from '@nestjs/swagger';

export class HealthResponseDto {
  @ApiProperty({ example: 'ok', description: 'Estado general del servicio' })
  status: 'ok' | 'degraded';

  @ApiProperty({ example: true, description: 'Conectividad con PostgreSQL' })
  database: boolean;

  @ApiProperty({ example: '0.1.0', description: 'Versión del backend' })
  version: string;

  @ApiProperty({ description: 'Marca de tiempo en formato ISO 8601' })
  timestamp: string;
}
