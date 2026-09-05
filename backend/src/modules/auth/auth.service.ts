import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { AuthResponseDto } from './dto/auth-response.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

/** Registro de cuentas, verificación de credenciales y emisión de tokens. */
@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Crea una cuenta nueva.
   * @throws ConflictException si el correo ya está registrado.
   */
  async register(dto: RegisterDto): Promise<AuthResponseDto> {
    const existing = await this.usersService.findByEmail(dto.email);

    if (existing) {
      throw new ConflictException('El correo ya está registrado');
    }

    const rounds = this.configService.get<number>('auth.bcryptRounds', 12);
    const passwordHash = await bcrypt.hash(dto.password, rounds);
    const user = await this.usersService.create({
      email: dto.email,
      name: dto.name,
      passwordHash,
    });

    return this.buildResponse(user);
  }

  /**
   * Valida las credenciales y entrega un token.
   * @throws UnauthorizedException si el correo no existe, la cuenta está
   * desactivada o la contraseña no coincide.
   */
  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.usersService.findByEmail(dto.email, true);

    // Se responde igual ante correo inexistente y contraseña incorrecta para
    // no revelar qué cuentas existen.
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const matches = await bcrypt.compare(dto.password, user.passwordHash);

    if (!matches) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    return this.buildResponse(user);
  }

  /** Arma la respuesta con el token y los datos públicos del usuario. */
  private buildResponse(user: User): AuthResponseDto {
    const payload: JwtPayload = { sub: user.id, email: user.email };

    return {
      accessToken: this.jwtService.sign(payload),
      user: { id: user.id, email: user.email, name: user.name },
    };
  }
}
