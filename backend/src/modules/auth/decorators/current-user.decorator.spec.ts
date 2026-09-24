import { ExecutionContext } from '@nestjs/common';
import { User } from '../../users/entities/user.entity';
import { currentUserFrom } from './current-user.decorator';

describe('currentUserFrom', () => {
  const contextWith = (request: object) =>
    ({
      switchToHttp: () => ({ getRequest: () => request }),
    }) as unknown as ExecutionContext;

  it('entrega el usuario que el guard dejó en la petición', () => {
    const user = { id: 'usuario-1', email: 'ana@ejemplo.cl' } as User;

    expect(currentUserFrom(contextWith({ user }))).toBe(user);
  });

  it('entrega undefined si la petición no pasó por el guard', () => {
    expect(currentUserFrom(contextWith({}))).toBeUndefined();
  });
});
