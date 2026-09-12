import { ApiProperty } from '@nestjs/swagger';
import { AuditStatus } from '../enums';

export class AuditProjectDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ example: 'organizacion/proyecto' })
  name: string;

  @ApiProperty({ example: 'https://github.com/organizacion/proyecto' })
  repositoryUrl: string;
}

/** Datos generales de una auditoría, usados en el historial. */
export class AuditSummaryDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ enum: AuditStatus })
  status: AuditStatus;

  @ApiProperty({
    type: Number,
    nullable: true,
    example: 77.78,
    description: 'Porcentaje de controles aprobados; null hasta que termina',
  })
  complianceScore: number | null;

  @ApiProperty({ type: AuditProjectDto })
  project: AuditProjectDto;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty({ type: Date, nullable: true })
  startedAt: Date | null;

  @ApiProperty({ type: Date, nullable: true })
  finishedAt: Date | null;

  @ApiProperty({ type: String, nullable: true })
  errorMessage: string | null;
}

/** Página del historial de auditorías. */
export class AuditListDto {
  @ApiProperty({ type: [AuditSummaryDto] })
  items: AuditSummaryDto[];

  @ApiProperty({ example: 42 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 20 })
  limit: number;
}
