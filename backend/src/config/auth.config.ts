import { registerAs } from '@nestjs/config';

/** Configuración de la emisión de tokens (namespace "auth"). */
export default registerAs('auth', () => ({
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '1h',
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS ?? '12', 10),
}));
