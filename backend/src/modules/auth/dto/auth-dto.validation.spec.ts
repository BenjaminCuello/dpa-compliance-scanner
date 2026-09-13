import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { LoginDto } from './login.dto';
import { RegisterDto } from './register.dto';

/** Mensajes de error por campo, en el orden en que los recibe el cliente. */
const messagesOf = async <T extends object>(
  type: new () => T,
  body: object,
): Promise<Record<string, string[]>> => {
  const errors = await validate(plainToInstance(type, body));
  return Object.fromEntries(
    errors.map((error) => [
      error.property,
      Object.values(error.constraints ?? {}),
    ]),
  );
};

describe('validación de autenticación', () => {
  it('en el registro sin datos, informa primero que cada campo es obligatorio', async () => {
    const messages = await messagesOf(RegisterDto, {});

    expect(messages.email[0]).toBe('El correo es obligatorio');
    expect(messages.name[0]).toBe('El nombre es obligatorio');
    expect(messages.password[0]).toBe('La contraseña es obligatoria');
  });

  it('entrega todos los mensajes del registro en español', async () => {
    const messages = await messagesOf(RegisterDto, {});
    const todos = Object.values(messages).flat();

    expect(
      todos.some((message) => /must|should|shorter|longer/i.test(message)),
    ).toBe(false);
  });

  it('en el login sin datos, informa primero que cada campo es obligatorio', async () => {
    const messages = await messagesOf(LoginDto, {});

    expect(messages.email[0]).toBe('El correo es obligatorio');
    expect(messages.password[0]).toBe('La contraseña es obligatoria');
  });

  it('mantiene las reglas de formato cuando el campo sí se envía', async () => {
    const messages = await messagesOf(RegisterDto, {
      email: 'no-es-correo',
      name: 'Ana',
      password: 'corta',
    });

    expect(messages.email).toEqual(['El correo no tiene un formato válido']);
    expect(messages.password).toEqual(
      expect.arrayContaining([
        'La contraseña debe tener al menos 10 caracteres',
        'La contraseña debe incluir al menos una minúscula, una mayúscula y un número',
      ]),
    );
  });

  it('acepta un registro válido', async () => {
    const messages = await messagesOf(RegisterDto, {
      email: 'ana@ejemplo.cl',
      name: 'Ana',
      password: 'Clave.Segura2026',
    });

    expect(messages).toEqual({});
  });
});
