import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { Request } from 'express';
import { User } from '../../users/entities/user.entity';

/** Entrega el usuario autenticado que el guard dejó en la petición. */
export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): User =>
    context.switchToHttp().getRequest<Request & { user: User }>().user,
);
