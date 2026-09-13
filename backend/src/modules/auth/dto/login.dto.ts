import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

/** Credenciales entregadas al iniciar sesión. */
export class LoginDto {
  @ApiProperty({ example: 'ana@ejemplo.cl' })
  @IsEmail({}, { message: 'El correo no tiene un formato válido' })
  @IsNotEmpty({ message: 'El correo es obligatorio' })
  email: string;

  @ApiProperty({ example: 'Clave.Segura2026' })
  @IsString({ message: 'La contraseña debe ser texto' })
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  password: string;
}
