import { ApiProperty } from '@nestjs/swagger';

/** Datos públicos del usuario autenticado. */
export class AuthenticatedUserDto {
  @ApiProperty({
    format: 'uuid',
    example: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
  })
  id: string;

  @ApiProperty({ example: 'ana@ejemplo.cl' })
  email: string;

  @ApiProperty({ example: 'Ana Pérez' })
  name: string;
}

/** Respuesta de los endpoints de registro e inicio de sesión. */
export class AuthResponseDto {
  @ApiProperty({
    description: 'Token JWT para las peticiones autenticadas',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5YjFk...',
  })
  accessToken: string;

  @ApiProperty({
    type: AuthenticatedUserDto,
    description: 'Datos públicos del usuario',
  })
  user: AuthenticatedUserDto;
}
