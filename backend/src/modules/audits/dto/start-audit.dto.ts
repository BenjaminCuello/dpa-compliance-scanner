import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  ValidateIf,
} from 'class-validator';

/**
 * Datos para iniciar una auditoría. Se indica un repositorio nuevo o un
 * proyecto ya registrado, pero no ambos.
 */
export class StartAuditDto {
  @ApiPropertyOptional({
    example: 'https://github.com/organizacion/proyecto',
    description:
      'Repositorio público a auditar. Crea el proyecto si no existe.',
  })
  @ValidateIf((dto: StartAuditDto) => dto.projectId === undefined)
  // class-validator informa las reglas en orden inverso: la obligatoriedad va
  // al final para que sea el primer mensaje cuando el campo no se envía.
  @MaxLength(500, {
    message: 'La URL del repositorio no puede superar los 500 caracteres',
  })
  @IsString({ message: 'La URL del repositorio debe ser texto' })
  @IsNotEmpty({ message: 'Indica la URL del repositorio o el proyecto' })
  repositoryUrl?: string;

  @ApiPropertyOptional({
    example: 'Portal de clientes',
    description:
      'Nombre del proyecto al crearlo. Por omisión se usa la ruta del repositorio.',
  })
  @IsOptional()
  @IsString({ message: 'El nombre del proyecto debe ser texto' })
  @IsNotEmpty({ message: 'El nombre del proyecto no puede estar vacío' })
  @MaxLength(120, {
    message: 'El nombre del proyecto no puede superar los 120 caracteres',
  })
  projectName?: string;

  @ApiPropertyOptional({
    description: 'Proyecto ya registrado que se quiere volver a auditar.',
  })
  @IsOptional()
  @IsUUID('4', { message: 'El identificador del proyecto no es válido' })
  projectId?: string;
}
