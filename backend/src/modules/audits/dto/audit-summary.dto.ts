import { ApiProperty } from '@nestjs/swagger';
import { AuditStatus } from '../enums';

export class AuditProjectDto {
  @ApiProperty({
    format: 'uuid',
    example: '0f8fad5b-d9cb-469f-a165-70867728950e',
  })
  id: string;

  @ApiProperty({ example: 'organizacion/proyecto' })
  name: string;

  @ApiProperty({ example: 'https://github.com/organizacion/proyecto' })
  repositoryUrl: string;
}

/** Datos generales de una auditoría, usados en el historial. */
export class AuditSummaryDto {
  @ApiProperty({
    format: 'uuid',
    example: '3f2b8c1e-6d4a-4f7b-9c2e-1a5d8e7f6b40',
  })
  id: string;

  @ApiProperty({
    enum: AuditStatus,
    example: AuditStatus.COMPLETED,
    description: 'pending → running → completed | failed',
  })
  status: AuditStatus;

  @ApiProperty({
    type: Number,
    nullable: true,
    example: 77.78,
    description: 'Porcentaje de controles aprobados; null hasta que termina',
  })
  complianceScore: number | null;

  @ApiProperty({ type: AuditProjectDto, description: 'Proyecto auditado' })
  project: AuditProjectDto;

  @ApiProperty({
    format: 'date-time',
    example: '2026-09-27T14:00:00.000Z',
    description: 'Momento en que se solicitó',
  })
  createdAt: Date;

  @ApiProperty({
    type: String,
    format: 'date-time',
    nullable: true,
    example: '2026-09-27T14:00:01.000Z',
    description: 'Inicio del análisis; null mientras está pendiente',
  })
  startedAt: Date | null;

  @ApiProperty({
    type: String,
    format: 'date-time',
    nullable: true,
    example: '2026-09-27T14:00:09.000Z',
    description: 'Término del análisis; null mientras está en curso',
  })
  finishedAt: Date | null;

  @ApiProperty({
    type: String,
    nullable: true,
    example: null,
    description: 'Motivo de la falla cuando el estado es failed',
  })
  errorMessage: string | null;
}

/** Página del historial de auditorías. */
export class AuditListDto {
  @ApiProperty({
    type: [AuditSummaryDto],
    description: 'Auditorías de la página, la más reciente primero',
  })
  items: AuditSummaryDto[];

  @ApiProperty({ example: 42, description: 'Total de auditorías del filtro' })
  total: number;

  @ApiProperty({ example: 1, description: 'Página actual, desde 1' })
  page: number;

  @ApiProperty({ example: 20, description: 'Resultados por página' })
  limit: number;
}
