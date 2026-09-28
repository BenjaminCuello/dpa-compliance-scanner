import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ApiErrorResponses } from '../../common/swagger/api-error-responses.decorator';
import {
  httpError,
  tooManyRequestsError,
  unauthorizedError,
  validationError,
} from '../../common/swagger/error-examples';
import { User } from '../users/entities/user.entity';
import { AuthService } from './auth.service';
import { CurrentUser, Public } from './decorators';
import { AuthResponseDto, AuthenticatedUserDto } from './dto/auth-response.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@ApiTags('Autenticación')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Crea una cuenta y devuelve un token' })
  @ApiCreatedResponse({ type: AuthResponseDto })
  @ApiErrorResponses(
    validationError('/api/auth/register', [
      'El correo no tiene un formato válido',
      'La contraseña debe tener al menos 10 caracteres',
      'La contraseña debe incluir al menos una minúscula, una mayúscula y un número',
    ]),
    httpError(
      409,
      '/api/auth/register',
      'El correo ya está registrado',
      'El correo ya está registrado',
    ),
    tooManyRequestsError('/api/auth/register'),
  )
  register(@Body() dto: RegisterDto): Promise<AuthResponseDto> {
    return this.authService.register(dto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Valida las credenciales y devuelve un token' })
  @ApiOkResponse({ type: AuthResponseDto })
  @ApiErrorResponses(
    validationError('/api/auth/login', [
      'El correo es obligatorio',
      'La contraseña es obligatoria',
    ]),
    httpError(
      401,
      '/api/auth/login',
      'Credenciales inválidas',
      'Credenciales inválidas',
    ),
    tooManyRequestsError('/api/auth/login'),
  )
  login(@Body() dto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(dto);
  }

  @Get('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Devuelve los datos del usuario autenticado' })
  @ApiOkResponse({ type: AuthenticatedUserDto })
  @ApiErrorResponses(
    unauthorizedError('/api/auth/profile'),
    tooManyRequestsError('/api/auth/profile'),
  )
  profile(@CurrentUser() user: User): AuthenticatedUserDto {
    return { id: user.id, email: user.email, name: user.name };
  }
}
