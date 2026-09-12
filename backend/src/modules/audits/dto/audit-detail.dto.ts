import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CheckSeverity, CheckStatus } from '../enums';
import { AuditSummaryDto } from './audit-summary.dto';

export class AuditFindingDto {
  @ApiProperty({
    example: 'La credencial "dbPassword" está escrita en el código.',
  })
  message: string;

  @ApiProperty({ type: String, nullable: true, example: 'src/database.ts' })
  filePath: string | null;

  @ApiProperty({ type: Number, nullable: true, example: 12 })
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

  @ApiProperty({ enum: CheckSeverity })
  severity: CheckSeverity;

  @ApiProperty({ enum: CheckStatus })
  status: CheckStatus;

  @ApiPropertyOptional({ description: 'Cómo corregir el incumplimiento' })
  remediation?: string;

  @ApiProperty({ type: [AuditFindingDto] })
  findings: AuditFindingDto[];
}

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
