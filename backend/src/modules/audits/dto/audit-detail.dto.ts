import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CheckSeverity, CheckStatus } from '../enums';
import { AuditSummaryDto } from './audit-summary.dto';

/** Hallazgo concreto de un control incumplido. */
export class AuditFindingDto {
  @ApiProperty({
    description: 'Descripción del hallazgo',
    example: 'La credencial "dbPassword" está escrita en el código.',
  })
  message: string;

  @ApiProperty({
    type: String,
    nullable: true,
    example: 'src/database.ts',
    description: 'Archivo del repositorio, si aplica',
  })
  filePath: string | null;

  @ApiProperty({
    type: Number,
    nullable: true,
    example: 12,
    description: 'Línea del archivo, si aplica',
  })
  line: number | null;
}

/** Resultado de un control dentro de la auditoría. */
export class AuditCheckDto {
  @ApiProperty({ example: 'DPA-SEC-001' })
  code: string;

  @ApiProperty({ example: 'Credenciales escritas en el código' })
  title: string;

  @ApiPropertyOptional({ example: 'secrets' })
  category?: string;

  @ApiProperty({ enum: CheckSeverity, example: CheckSeverity.CRITICAL })
  severity: CheckSeverity;

  @ApiProperty({ enum: CheckStatus, example: CheckStatus.FAILED })
  status: CheckStatus;

  @ApiPropertyOptional({
    description: 'Cómo corregir el incumplimiento',
    example: 'Mueve la credencial a una variable de entorno.',
  })
  remediation?: string;

  @ApiProperty({
    type: [AuditFindingDto],
    description: 'Hallazgos; vacío si el control se aprobó',
  })
  findings: AuditFindingDto[];
}

/** Resumen numérico de los controles y hallazgos. */
export class AuditTotalsDto {
  @ApiProperty({ example: 9 })
  totalChecks: number;

  @ApiProperty({ example: 7 })
  passedChecks: number;

  @ApiProperty({ example: 2 })
  failedChecks: number;

  @ApiProperty({ example: 3 })
  totalFindings: number;

  @ApiProperty({
    example: { low: 0, medium: 1, high: 0, critical: 2 },
    description: 'Hallazgos por severidad',
  })
  findingsBySeverity: Record<CheckSeverity, number>;
}

/** Auditoría con el resultado de cada control. */
export class AuditDetailDto extends AuditSummaryDto {
  @ApiProperty({ type: AuditTotalsDto })
  totals: AuditTotalsDto;

  @ApiProperty({ type: [AuditCheckDto] })
  checks: AuditCheckDto[];
}
