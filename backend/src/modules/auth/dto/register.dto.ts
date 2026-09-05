import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

/** Datos que entrega quien crea una cuenta. */
export class RegisterDto {
  @ApiProperty({ example: 'ana@ejemplo.cl' })
  @IsEmail({}, { message: 'El correo no tiene un formato válido' })
  @MaxLength(180)
  email: string;

  @ApiProperty({ example: 'Ana Pérez' })
  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @MaxLength(120)
  name: string;

  @ApiProperty({
    example: 'Clave.Segura2026',
    description:
      'Mínimo 10 caracteres, con al menos una minúscula, una mayúscula y un número',
  })
  @IsString()
  @MinLength(10, { message: 'La contraseña debe tener al menos 10 caracteres' })
  @MaxLength(72, {
    message: 'La contraseña no puede superar los 72 caracteres',
  })
  @Matches(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message:
      'La contraseña debe incluir al menos una minúscula, una mayúscula y un número',
  })
  password: string;
}
