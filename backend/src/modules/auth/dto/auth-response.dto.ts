import { ApiProperty } from '@nestjs/swagger';

/** Datos públicos del usuario autenticado. */
export class AuthenticatedUserDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ example: 'ana@ejemplo.cl' })
  email: string;

  @ApiProperty({ example: 'Ana Pérez' })
  name: string;
}

/** Respuesta de los endpoints de registro e inicio de sesión. */
export class AuthResponseDto {
  @ApiProperty({ description: 'Token JWT para las peticiones autenticadas' })
  accessToken: string;

  @ApiProperty({ type: AuthenticatedUserDto })
  user: AuthenticatedUserDto;
}
