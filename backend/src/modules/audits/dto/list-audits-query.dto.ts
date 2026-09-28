import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator';
import { AuditStatus } from '../enums';

/** Filtros y paginación del historial de auditorías. */
export class ListAuditsQueryDto {
  @ApiPropertyOptional({
    format: 'uuid',
    description: 'Limita el historial a un proyecto (UUID v4)',
  })
  @IsOptional()
  @IsUUID('4', { message: 'El identificador del proyecto no es válido' })
  projectId?: string;

  @ApiPropertyOptional({
    enum: AuditStatus,
    description: 'Limita el historial a un estado',
  })
  @IsOptional()
  @IsEnum(AuditStatus, { message: 'El estado indicado no existe' })
  status?: AuditStatus;

  @ApiPropertyOptional({
    type: 'integer',
    default: 1,
    minimum: 1,
    description: 'Página',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'La página debe ser un número entero' })
  @Min(1, { message: 'La página debe ser mayor o igual a 1' })
  page = 1;

  @ApiPropertyOptional({
    type: 'integer',
    default: 20,
    minimum: 1,
    maximum: 100,
    description: 'Resultados por página',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El límite debe ser un número entero' })
  @Min(1, { message: 'El límite debe ser mayor o igual a 1' })
  @Max(100, { message: 'El límite no puede superar 100 resultados' })
  limit = 20;
}
