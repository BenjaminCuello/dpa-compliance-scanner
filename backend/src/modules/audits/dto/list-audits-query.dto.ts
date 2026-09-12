import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator';
import { AuditStatus } from '../enums';

/** Filtros y paginación del historial de auditorías. */
export class ListAuditsQueryDto {
  @ApiPropertyOptional({ description: 'Limita el historial a un proyecto' })
  @IsOptional()
  @IsUUID('4', { message: 'El identificador del proyecto no es válido' })
  projectId?: string;

  @ApiPropertyOptional({ enum: AuditStatus })
  @IsOptional()
  @IsEnum(AuditStatus, { message: 'El estado indicado no existe' })
  status?: AuditStatus;

  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'La página debe ser un número entero' })
  @Min(1, { message: 'La página debe ser mayor o igual a 1' })
  page = 1;

  @ApiPropertyOptional({ default: 20, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El límite debe ser un número entero' })
  @Min(1, { message: 'El límite debe ser mayor o igual a 1' })
  @Max(100, { message: 'El límite no puede superar 100 resultados' })
  limit = 20;
}
