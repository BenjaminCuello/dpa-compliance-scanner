import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { JwtAuthGuard } from './jwt-auth.guard';

describe('JwtAuthGuard', () => {
  const context = {
    getHandler: () => undefined,
    getClass: () => undefined,
  } as unknown as ExecutionContext;

  it('deja pasar los endpoints marcados como públicos', () => {
    const getAllAndOverride = jest.fn().mockReturnValue(true);
    const guard = new JwtAuthGuard({
      getAllAndOverride,
    } as unknown as Reflector);

    expect(guard.canActivate(context)).toBe(true);
    expect(getAllAndOverride).toHaveBeenCalledWith(
      IS_PUBLIC_KEY,
      expect.any(Array),
    );
  });

  it('delega en la validación del token cuando el endpoint no es público', () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue(false),
    } as unknown as Reflector;

    const guard = new JwtAuthGuard(reflector);
    const parent = jest
      .spyOn(
        Object.getPrototypeOf(JwtAuthGuard.prototype) as {
          canActivate: (context: ExecutionContext) => boolean;
        },
        'canActivate',
      )
      .mockReturnValue(false);

    expect(guard.canActivate(context)).toBe(false);
    expect(parent).toHaveBeenCalledWith(context);

    parent.mockRestore();
  });
});
