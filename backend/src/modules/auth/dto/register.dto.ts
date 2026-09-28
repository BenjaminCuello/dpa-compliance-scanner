import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

// class-validator informa las reglas en orden inverso a su declaración. La
// regla de obligatoriedad va al final de cada campo para que su mensaje sea el
// primero cuando el campo no se envía.

/** Datos que entrega quien crea una cuenta. */
export class RegisterDto {
  @ApiProperty({
    example: 'ana@ejemplo.cl',
    description: 'Correo único, máximo 180 caracteres',
  })
  @MaxLength(180, { message: 'El correo no puede superar los 180 caracteres' })
  @IsEmail({}, { message: 'El correo no tiene un formato válido' })
  @IsNotEmpty({ message: 'El correo es obligatorio' })
  email: string;

  @ApiProperty({ example: 'Ana Pérez', description: 'Máximo 120 caracteres' })
  @MaxLength(120, { message: 'El nombre no puede superar los 120 caracteres' })
  @IsString({ message: 'El nombre debe ser texto' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  name: string;

  @ApiProperty({
    example: 'Clave.Segura2026',
    description:
      'Entre 10 y 72 caracteres, con al menos una minúscula, una mayúscula y un número',
  })
  @Matches(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message:
      'La contraseña debe incluir al menos una minúscula, una mayúscula y un número',
  })
  @MaxLength(72, {
    message: 'La contraseña no puede superar los 72 caracteres',
  })
  @MinLength(10, { message: 'La contraseña debe tener al menos 10 caracteres' })
  @IsString({ message: 'La contraseña debe ser texto' })
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  password: string;
}
