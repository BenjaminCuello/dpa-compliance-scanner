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
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
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
  @ApiConflictResponse({ description: 'El correo ya está registrado' })
  register(@Body() dto: RegisterDto): Promise<AuthResponseDto> {
    return this.authService.register(dto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Valida las credenciales y devuelve un token' })
  @ApiOkResponse({ type: AuthResponseDto })
  @ApiUnauthorizedResponse({ description: 'Credenciales inválidas' })
  login(@Body() dto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(dto);
  }

  @Get('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Devuelve los datos del usuario autenticado' })
  @ApiOkResponse({ type: AuthenticatedUserDto })
  @ApiUnauthorizedResponse({ description: 'Token ausente o inválido' })
  profile(@CurrentUser() user: User): AuthenticatedUserDto {
    return { id: user.id, email: user.email, name: user.name };
  }
}
