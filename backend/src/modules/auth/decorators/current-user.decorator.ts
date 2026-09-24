import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { Request } from 'express';
import { User } from '../../users/entities/user.entity';

/**
 * Obtiene el usuario que el guard dejó en la petición.
 * @param context Contexto de ejecución de la petición en curso.
 */
export function currentUserFrom(context: ExecutionContext): User {
  return context.switchToHttp().getRequest<Request & { user: User }>().user;
}

/** Entrega el usuario autenticado que el guard dejó en la petición. */
export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): User => currentUserFrom(context),
);
